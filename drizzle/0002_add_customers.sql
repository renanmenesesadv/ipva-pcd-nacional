CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`nome` varchar(255) NOT NULL,
	`telefone` varchar(20),
	`plano` enum('relatorio_avulso','plano_anual','consultoria') NOT NULL,
	`relatoriosUsados` int NOT NULL DEFAULT 0,
	`kiwifyOrderId` varchar(100),
	`status` enum('active','expired','refunded') NOT NULL DEFAULT 'active',
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
