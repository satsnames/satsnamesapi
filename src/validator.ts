import { parse } from "json5";
import { logger } from "./logger";
export interface InscriptionContent {
  name: string;
  p: "sns";
  op: "reg";
  [key: string]: string;
}

export type ValidatedInscriptionContent = {
  op: InscriptionContent;
  textContent: string;
};

export function getSatsName(nameStr: string): string | false {
  const name = nameStr.toLowerCase().trim().split(/\s/g)[0];
  const ends = name.endsWith(".sats");
  const len = name.split(".").length === 2;
  if (ends && len) {
    return name;
  }
  return false;
}

function cleanContent(text: string) {
  return text
    .replaceAll("‘", '"')
    .replaceAll("’", '"')
    .replaceAll("“", '"')
    .replaceAll("”", '"');
}

export function validateSnsInscription(
  _text: string
): false | ValidatedInscriptionContent {
  const text = cleanContent(_text);

  try {
    const json = parse(text) as unknown;
    if (typeof json === "object" && !Array.isArray(json) && json !== null) {
      const hasP = "p" in json && json.p === "sns";
      const hasOp = "op" in json && json.op === "reg";
      const hasName = "name" in json && typeof json.name === "string";
      if (!hasP || !hasOp || !hasName) return false;
      const name = getSatsName(json.name as string);
      if (name === false) return false;
      return {
        op: {
          ...(json as unknown as InscriptionContent),
          name,
        },
        textContent: text,
      };
    }
    return false;
  } catch (error) {
    logger.trace({ error }, "Error parsing JSON");
    const name = getSatsName(text);
    if (name === false) return false;
    return {
      op: {
        p: "sns",
        op: "reg",
        name: name,
      },
      textContent: text,
    };
  }
}
