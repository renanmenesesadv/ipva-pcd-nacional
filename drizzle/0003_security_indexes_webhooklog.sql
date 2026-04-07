-- Índices para performance nas buscas por email
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_kiwify_order ON customers(kiwifyOrderId);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_leads_email ON leads(email);

-- Tabela de log de eventos do webhook (auditoria)
CREATE TABLE IF NOT EXISTS `webhook_events` (
  `id` int AUTO_INCREMENT NOT NULL,
  `eventType` varchar(50) NOT NULL,
  `orderId` varchar(100),
  `email` varchar(320),
  `productName` varchar(255),
  `plano` varchar(50),
  `status` varchar(20) NOT NULL,
  `errorMessage` text,
  `rawPayload` text,
  `ipAddress` varchar(45),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_webhook_events_order` (`orderId`),
  INDEX `idx_webhook_events_email` (`email`),
  INDEX `idx_webhook_events_created` (`createdAt`)
);
