import type {
  FastifyInstance,
  FastifyBaseLogger,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
  FastifyPluginCallback,
  FastifyPluginAsync as FastifyPluginAsyncBase,
} from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

export type FastifyServer = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  FastifyBaseLogger,
  ZodTypeProvider
>;

export type FastifyPlugin = FastifyPluginCallback<
  Record<any, any>,
  RawServerDefault,
  ZodTypeProvider
>;

export type FastifyPluginAsync = FastifyPluginAsyncBase<
  Record<any, any>,
  RawServerDefault,
  ZodTypeProvider
>;

export const nameSchema = z.object({
  name: z.string(),
  owner: z.string(),
  inscriptionId: z.string(),
  inscriptionIndex: z.number(),
});

export const namesResultSchema = z.object({
  names: z.array(nameSchema),
});

export type NamesResult = z.infer<typeof namesResultSchema>;

export const registrationOpSchema = z.intersection(
  z.object({
    op: z.literal("reg"),
    p: z.literal("sns"),
    name: z.string(),
    npub: z.optional(z.string()),
    lnurl: z.optional(z.string()),
  }),
  z.record(z.string(), z.string())
);

export type RegistrationOp = z.infer<typeof registrationOpSchema>;

export const nameDetailsSchema = z.object({
  name: z.string(),
  inscriptionId: z.string(),
  owner: z.string(),
  inscriptionIndex: z.number(),
  genesisHeight: z.number(),
  registrationOp: registrationOpSchema,
  nameIndex: z.number(),
  timestamp: z.string(),
  queryDecoded: z.string(),
  inscriptions: z.array(
    z.object({
      textContent: z.string(),
      inscriptionId: z.string(),
      inscriptionIndex: z.number(),
    })
  ),
});

export type NameDetail = z.infer<typeof nameDetailsSchema>;
