import { Prisma } from "@prisma/client";
import PQueue from "p-queue";
import { logger } from "./logger";
import { WritableInscription } from "./sync";
import { InscriptionContent, validateSnsInscription } from "./validator";

export interface OrdApiDetails {
  address: string;
  content_type: string;
  genesis_fee: string;
  genesis_height: string;
  genesis_transaction: string;
  id: string;
  inscription_number: number;
  location: string;
  output: string;
  output_value: string;
  sat: string;
  timestamp: string;
}

export type InscriptionWithContent = OrdApiDetails & {
  op: InscriptionContent;
  textContent: string;
};

export async function fetchInscriptionsFromHeight(fromHeight: number) {
  const from = fromHeight + 1;
  const limit = 100;
  const to = from + 100;

  const res = await fetch(
    `https://ordapi.xyz/inscriptions/?start=${from}&end=${to}&limit=${limit}`
  );

  const data = (await res.json()) as OrdApiDetails[];

  logger.debug(
    {
      results: data.length,
      from,
      to,
    },
    "Fetched Ordinals list"
  );

  return data;
}

export async function fetchContent(id: string) {
  const url = `https://ordinals.com/content/${id}`;
  const res = await fetch(url);
  const text = await res.text();
  return text;
}

function getFilterConcurrency() {
  const env = process.env.FILTER_CONCURRENCY;
  if (env) {
    return parseInt(env, 10);
  }
  return 6;
}

const filterQueue = new PQueue({
  concurrency: getFilterConcurrency(),
});

export async function filterInscriptions(list: OrdApiDetails[]) {
  const maxId = list.at(-1)?.inscription_number;

  const inscriptions = (
    await Promise.all(
      list.map(async (i) => {
        if (!i.content_type.includes("text/plain")) return false;
        logger.trace({ id: i.id }, "Fetching content");

        const content = await filterQueue.add(() => fetchContent(i.id));
        if (typeof content !== "string") return false;
        // logger.trace(content);

        const details = validateSnsInscription(content);
        if (details === false) return false;
        const validated: InscriptionWithContent = {
          ...i,
          ...details,
        };
        return validated;
      })
    )
  ).filter((i): i is InscriptionWithContent => {
    return i !== false;
  });

  return {
    maxId,
    inscriptions,
  };
}

export function convertInscriptionToDb(
  i: InscriptionWithContent
): WritableInscription {
  const name = i.op.name;
  return {
    _name: name,
    inscriptionId: i.id,
    inscriptionContent: i.textContent,
    inscriptionContentType: i["content_type"],
    inscriptionJSON: i.op as Prisma.RegistrationCreateInput["inscriptionJSON"],
    inscriptionIndex: i.inscription_number,
    inscriptionOwner: i.address,
    minter: i.address,
    sat: i.sat.replaceAll("/sat/", ""),
    location: i.location,
    timestamp: BigInt(new Date(i.timestamp).getTime()),
    genesisHeight: parseInt(i.genesis_height.replace("/block/", ""), 10),
    genesisTransaction: i.genesis_transaction.replace("/tx/", ""),
    outputValue: BigInt(i.output_value),
    name: {
      connectOrCreate: {
        where: { name },
        create: { name },
      },
    },
  };
}

export async function fetchAndFilterInscriptions(startHeight: number): Promise<{
  maxId?: number;
  inscriptions: WritableInscription[];
}> {
  const list = await fetchInscriptionsFromHeight(startHeight);
  const filtered = await filterInscriptions(list);

  return {
    maxId: filtered.maxId,
    inscriptions: filtered.inscriptions.map(convertInscriptionToDb),
  };
}
