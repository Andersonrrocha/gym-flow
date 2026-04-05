-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN "catalogKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_catalogKey_key" ON "Exercise"("catalogKey");
