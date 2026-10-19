-- DropForeignKey
ALTER TABLE `Block` DROP FOREIGN KEY `Block_pageId_fkey`;

-- DropIndex
DROP INDEX `Block_pageId_fkey` ON `Block`;

-- AlterTable
ALTER TABLE `Block` ADD COLUMN `fragmentId` VARCHAR(191) NULL,
    MODIFY `pageId` VARCHAR(191) NULL;

-- AlterTable (nullable until existing pages are backfilled below)
ALTER TABLE `Page` ADD COLUMN `templateId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Fragment` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `kind` ENUM('HEADER', 'FOOTER', 'GENERAL') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Fragment_kind_idx`(`kind`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Template` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(500) NULL,
    `layout` JSON NOT NULL,
    `isSystem` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Template_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TemplateSlot` (
    `templateId` VARCHAR(191) NOT NULL,
    `slot` VARCHAR(50) NOT NULL,
    `fragmentId` VARCHAR(191) NOT NULL,

    INDEX `TemplateSlot_fragmentId_idx`(`fragmentId`),
    PRIMARY KEY (`templateId`, `slot`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seed the preset templates (keep in sync with config/templates.ts) and give
-- every existing page the default one
INSERT INTO `Template` (`id`, `name`, `description`, `layout`, `isSystem`, `updatedAt`) VALUES
('tpl_single_column', 'Single column', 'Header, a centred column of content, then footer.',
 '{"columns":["1fr"],"rows":["auto","1fr","auto"],"areas":[["header"],["main"],["footer"]],"contentWidth":"narrow","slots":{"header":{"kind":"HEADER"},"footer":{"kind":"FOOTER"}}}',
 true, CURRENT_TIMESTAMP(3)),
('tpl_full_width', 'Full width', 'Header, full-width content, then footer.',
 '{"columns":["1fr"],"rows":["auto","1fr","auto"],"areas":[["header"],["main"],["footer"]],"contentWidth":"full","slots":{"header":{"kind":"HEADER"},"footer":{"kind":"FOOTER"}}}',
 true, CURRENT_TIMESTAMP(3));

UPDATE `Page` SET `templateId` = 'tpl_single_column';

ALTER TABLE `Page` MODIFY `templateId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Page` ADD CONSTRAINT `Page_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `Template`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Block` ADD CONSTRAINT `Block_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `Page`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Block` ADD CONSTRAINT `Block_fragmentId_fkey` FOREIGN KEY (`fragmentId`) REFERENCES `Fragment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TemplateSlot` ADD CONSTRAINT `TemplateSlot_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `Template`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TemplateSlot` ADD CONSTRAINT `TemplateSlot_fragmentId_fkey` FOREIGN KEY (`fragmentId`) REFERENCES `Fragment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
