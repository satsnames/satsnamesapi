import { Prisma } from "@prisma/client";
import { InscriptionContent } from "../validator";

export const SYNC_VERSION = 7;

export type WritableInscription = {
  _name: string;
} & Prisma.RegistrationCreateInput;
