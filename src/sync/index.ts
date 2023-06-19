import { Prisma } from "@prisma/client";
import { InscriptionContent } from "../validator";
import { OWNERS_SYNC_ID } from "./owners";

// can never be equal to OWNER_SYNC_VERSION
export const SYNC_VERSION = 7;
if (Number(SYNC_VERSION) === OWNERS_SYNC_ID) {
  throw new Error("SYNC_VERSION cannot be equal to OWNERS_SYNC_ID");
}

export type WritableInscription = {
  _name: string;
} & Prisma.RegistrationCreateInput;
