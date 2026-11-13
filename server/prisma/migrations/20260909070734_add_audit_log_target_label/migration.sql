-- DropIndex
DROP INDEX `AuditLog_action_idx` ON `auditlog`;

-- AlterTable
ALTER TABLE `auditlog` ADD COLUMN `targetLabel` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `AuditLog_key_idx` ON `AuditLog`(`key`);
