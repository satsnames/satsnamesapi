-- CreateTable
CREATE TABLE "names" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "names_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registrations" (
    "inscription_id" TEXT NOT NULL,
    "inscription_content" TEXT NOT NULL,
    "inscription_content_type" TEXT NOT NULL,
    "inscription_owner" TEXT NOT NULL,
    "sat" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "genesis_height" INTEGER NOT NULL,
    "output_value" BIGINT NOT NULL,
    "genesis_transaction" TEXT NOT NULL,
    "inscription_index" INTEGER NOT NULL,
    "inscription_json" JSONB NOT NULL,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("inscription_id")
);

-- CreateTable
CREATE TABLE "syncs" (
    "id" SERIAL NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "inscription_index" INTEGER NOT NULL,

    CONSTRAINT "syncs_pkey" PRIMARY KEY ("id")
);
