CREATE TABLE IF NOT EXISTS `reports` (
  `id` int AUTO_INCREMENT NOT NULL,
  `customerEmail` varchar(320) NOT NULL,
  `estado` varchar(2) NOT NULL,
  `estadoNome` varchar(100) NOT NULL,
  `deficiencia` varchar(100) NOT NULL,
  `condutor` varchar(10) NOT NULL,
  `tipoVeiculo` varchar(10) NOT NULL,
  `valorVeiculo` varchar(20) NOT NULL,
  `elegivel` boolean NOT NULL DEFAULT false,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_reports_email` (`customerEmail`),
  INDEX `idx_reports_created` (`createdAt`)
);
