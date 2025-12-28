/*
  Warnings:

  - You are about to drop the column `backup_job_id` on the `system_logs` table. All the data in the column will be lost.
  - You are about to drop the `backup_jobs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ticket_transactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "system_logs" DROP CONSTRAINT "system_logs_backup_job_id_fkey";

-- DropForeignKey
ALTER TABLE "ticket_transactions" DROP CONSTRAINT "ticket_transactions_loan_id_fkey";

-- DropForeignKey
ALTER TABLE "ticket_transactions" DROP CONSTRAINT "ticket_transactions_member_id_fkey";

-- DropIndex
DROP INDEX "system_logs_backup_job_id_idx";

-- AlterTable
ALTER TABLE "system_logs" DROP COLUMN "backup_job_id";

-- DropTable
DROP TABLE "backup_jobs";

-- DropTable
DROP TABLE "ticket_transactions";
