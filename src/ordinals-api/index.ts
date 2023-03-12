import PQueue from "p-queue";
import { logger } from "../logger";
import { InscriptionContent, validateSnsInscription } from "../validator";
import { Ordinals } from "./client";
import { OpenAPIConfig } from "./client/core/OpenAPI";

type InscriptionsService = Ordinals["inscriptions"];

export type OrdinalsListResponse = Awaited<
  ReturnType<InscriptionsService["getOrdinalsV1Inscriptions"]>
>;

export type OrdinalsListItem = OrdinalsListResponse["results"][number];

export type InscriptionWithContent = OrdinalsListItem & {
  op: InscriptionContent;
  textContent: string;
};

export const apiClient = new Ordinals();
export const inscriptionsClient = apiClient.inscriptions;
export const API_URL = new Ordinals().request.config.BASE;

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

export async function fetchOrdinals(
  fromIndex: number
): Promise<OrdinalsListResponse> {
  const list = await inscriptionsClient.getOrdinalsV1Inscriptions({
    fromNumber: fromIndex + 1,
    limit: 60,
    // orderBy: "ordinal",
    order: "asc",
    mimeType: ["text/plain"],
  });

  return list;
}

export async function fetchOrdinalContent(id: string) {
  const url = `${API_URL}/ordinals/v1/inscriptions/${id}/content`;
  const res = await fetch(url);
  const text = await res.text();
  return text;
}

export async function filterInscriptions(list: OrdinalsListResponse) {
  const { results, ...rest } = list;
  const maxId = results.at(-1)?.number;
  const inscriptions = (
    await Promise.all(
      list.results.map(async (inscription) => {
        const { id } = inscription;
        const content = await filterQueue.add(() => fetchOrdinalContent(id));
        if (typeof content !== "string") {
          logger.error({ id }, `Unable to fetch content`);
          return false;
        }
        const details = validateSnsInscription(content);
        if (details === false) return false;
        const validated: InscriptionWithContent = {
          ...inscription,
          ...details,
        };
        return validated;
      })
    )
  ).filter((i): i is InscriptionWithContent => {
    return i !== false;
  });

  return {
    ...rest,
    maxId,
    inscriptions,
  };
}
