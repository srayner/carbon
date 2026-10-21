-- CreateTable
CREATE TABLE `SiteTheme` (
    `id` VARCHAR(191) NOT NULL,
    `values` JSON NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
