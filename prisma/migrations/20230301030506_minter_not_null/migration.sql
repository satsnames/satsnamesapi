/*
  Warnings:

  - Made the column `minter` on table `registrations` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "registrations" ALTER COLUMN "minter" SET NOT NULL;
