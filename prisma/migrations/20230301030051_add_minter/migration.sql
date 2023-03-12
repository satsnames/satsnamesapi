/*
  Warnings:

  - Added the required column `minter` to the `registrations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "registrations" ADD COLUMN "minter" TEXT;

update registrations set minter = inscription_owner;
