import { nameDetailsSchema, NameDetail, registrationOpSchema } from "./types";
import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";
import LRUCache from "lru-cache";
import { getCodePoints } from "./utils";

export async function fetchName(
  nameStr: string,
  db: PrismaClient
): Promise<NameDetail | null> {
  const inscriptions = await db.registration.findMany({
    where: {
      name: {
        name: nameStr,
      },
    },
    include: {
      name: true,
    },
    orderBy: {
      inscriptionIndex: "asc",
    },
  });

  const inscription = inscriptions[0] ?? null;

  if (inscription === null) {
    return null;
  }

  const name = inscription.name;

  const valid = registrationOpSchema.safeParse(inscription.inscriptionJSON);

  const rank = await fetchRegistrationIndex(inscription.inscriptionIndex, db);

  const codePoints = getCodePoints(nameStr);

  return {
    name: name.name,
    inscriptionId: inscription.inscriptionId,
    inscriptionIndex: inscription.inscriptionIndex,
    owner: inscription.inscriptionOwner,
    genesisHeight: inscription.genesisHeight,
    queryDecoded: codePoints,
    inscriptions: inscriptions.map((i) => ({
      inscriptionId: i.inscriptionId,
      inscriptionIndex: i.inscriptionIndex,
      textContent: i.inscriptionContent,
    })),
    nameIndex: rank + 1,
    timestamp: new Date(Number(inscription.timestamp)).toUTCString(),
    registrationOp: valid.success
      ? valid.data
      : {
          p: "sns",
          op: "reg",
          name: name.name,
        },
  };
}

export type NamesResultItem = {
  inscriptionId: string;
  owner: string;
  name: string;
  inscriptionIndex: number;
};

export async function fetchNames(db: PrismaClient, after?: number) {
  let maxId: number;
  if (typeof after !== "undefined") {
    maxId = after;
  } else {
    const maxName = await db.registration.findFirst({
      orderBy: {
        inscriptionIndex: "desc",
      },
      select: {
        inscriptionIndex: true,
      },
    });
    maxId = (maxName?.inscriptionIndex ?? 100) + 1;
  }
  logger.debug(`Cursor: ${maxId}`);
  const results = await db.$queryRaw<NamesResultItem[]>`
    with regs as ( select 
      distinct on (name)
      inscription_id as "inscriptionId"
      , inscription_owner as owner
      , inscription_index as "inscriptionIndex"
      , name
    from names, registrations
    where names.id = registrations.name_id
    order by
      name asc
      ,inscription_index asc
    )

    select *
    from regs
    where "inscriptionIndex" < ${maxId}
    order by "inscriptionIndex" desc
    limit 100
  `;

  return results;
}

async function fetchRegistrationIndex(index: number, db: PrismaClient) {
  const results = await db.$queryRaw<{ count: bigint }[]>`
    select count(distinct name)
    from names, registrations
    where names.id = registrations.name_id
    and registrations.inscription_index < ${index}
  `;

  return Number(results[0].count);
}

export const allNamesCache = new LRUCache<string, string>({
  ttl: 1000 * 60 * 5,
  maxSize: 10000000,
  sizeCalculation(n) {
    // console.log(n.length);
    return n.length;
  },
});

export async function fetchAllNamesCache(db: PrismaClient) {
  const value = allNamesCache.get("");
  if (typeof value === "undefined") {
    logger.info("All names cache miss");
    const text = await fetchNamesCSV(db);
    allNamesCache.set("", text);
    return text;
  }
  logger.info("All names cache hit");
  return value;
}

export async function fetchNamesCSV(db: PrismaClient) {
  const results = await db.$queryRaw<
    { name: string; inscriptionIndex: number; inscriptionId: string }[]
  >`
    with regs as ( select 
      distinct on (name)
      inscription_index as "inscriptionIndex"
      , name
      , inscription_id as "inscriptionId"
    from names, registrations
    where names.id = registrations.name_id
    order by
      name asc
      ,inscription_index asc
    )

    select *
    from regs
    order by "inscriptionIndex" desc
    limit 10000
  `;

  let data = "Name,Inscription Index,Inscription ID\n";
  results.forEach((r) => {
    const row = [r.name, r.inscriptionIndex, r.inscriptionId];
    data += `${row.join(",")}\n`;
  });

  return data;
}
