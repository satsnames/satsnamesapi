/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `names` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name_id` to the `registrations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "registrations" ADD COLUMN     "name_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "names_name_key" ON "names"("name");

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_name_id_fkey" FOREIGN KEY ("name_id") REFERENCES "names"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
