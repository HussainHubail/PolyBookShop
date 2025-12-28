/*
  Warnings:

  - Added the required column `message` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- Update existing notifications with default values before adding NOT NULL constraints
UPDATE "notifications" SET "payload" = NULL WHERE "payload" = '';

-- AlterTable (add columns with defaults first, then remove defaults)
ALTER TABLE "notifications" 
ADD COLUMN "title" VARCHAR(255) NOT NULL DEFAULT 'Notification',
ADD COLUMN "message" TEXT NOT NULL DEFAULT 'You have a new notification',
ADD COLUMN "priority" VARCHAR(20) NOT NULL DEFAULT 'normal',
ALTER COLUMN "payload" DROP NOT NULL;

-- Remove the default values after populating existing rows
ALTER TABLE "notifications" 
ALTER COLUMN "title" DROP DEFAULT,
ALTER COLUMN "message" DROP DEFAULT;

-- CreateTable
CREATE TABLE "holds" (
    "id" SERIAL NOT NULL,
    "member_id" INTEGER NOT NULL,
    "loan_id" INTEGER,
    "reason" VARCHAR(500) NOT NULL,
    "placed_by" INTEGER NOT NULL,
    "placed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removed_at" TIMESTAMP(3),
    "removed_by" INTEGER,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fines" (
    "id" SERIAL NOT NULL,
    "member_id" INTEGER NOT NULL,
    "loan_id" INTEGER,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'USD',
    "reason" VARCHAR(500) NOT NULL,
    "charged_by" INTEGER NOT NULL,
    "charged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),
    "paid_amount" DECIMAL(10,2),
    "status" VARCHAR(50) NOT NULL DEFAULT 'unpaid',
    "waived_by" INTEGER,
    "waived_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "holds_member_id_idx" ON "holds"("member_id");

-- CreateIndex
CREATE INDEX "holds_loan_id_idx" ON "holds"("loan_id");

-- CreateIndex
CREATE INDEX "holds_status_idx" ON "holds"("status");

-- CreateIndex
CREATE INDEX "holds_placed_at_idx" ON "holds"("placed_at");

-- CreateIndex
CREATE INDEX "fines_member_id_idx" ON "fines"("member_id");

-- CreateIndex
CREATE INDEX "fines_loan_id_idx" ON "fines"("loan_id");

-- CreateIndex
CREATE INDEX "fines_status_idx" ON "fines"("status");

-- CreateIndex
CREATE INDEX "fines_charged_at_idx" ON "fines"("charged_at");

-- CreateIndex
CREATE INDEX "notifications_read_at_idx" ON "notifications"("read_at");

-- AddForeignKey
ALTER TABLE "holds" ADD CONSTRAINT "holds_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holds" ADD CONSTRAINT "holds_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fines" ADD CONSTRAINT "fines_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fines" ADD CONSTRAINT "fines_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
