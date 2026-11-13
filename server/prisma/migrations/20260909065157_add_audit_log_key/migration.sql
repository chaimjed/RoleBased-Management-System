/*
  Warnings:

  - Added the required column `key` to the `AuditLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `AuditLog` ADD COLUMN `key` VARCHAR(191) NOT NULL DEFAULT 'unknown';

ALTER TABLE `AuditLog` ALTER COLUMN `key` DROP DEFAULT;