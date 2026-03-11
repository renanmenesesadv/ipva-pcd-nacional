# IPVA Zero PCD - TODO

## Fase 1 - Plataforma Base
- [x] Landing page com hero section e imagem gerada por IA
- [x] Formulário de análise de elegibilidade (27 estados)
- [x] Dados estruturados de todos os 27 estados brasileiros
- [x] Página de resultado com elegibilidade e passo a passo
- [x] Geração de relatório em PDF/TXT
- [x] Design responsivo com paleta azul/verde/amarelo
- [x] FAQ com perguntas frequentes

## Fase 2 - Captura de Leads e Dashboard
- [x] Upgrade para web-db-user (backend + banco de dados)
- [x] Tabela de leads no banco de dados (MySQL)
- [x] Formulário de captura de lead (antes do formulário principal)
  - [x] Nome, email, WhatsApp, tipo de deficiência
  - [x] Segmentação por tipo de deficiência (TEA em destaque)
  - [x] Benefícios listados (relatório PDF, comunidade PCD, ações contra plano)
- [x] Revisão textual com títulos mais diretos e curiosos
  - [x] "Seu filho com autismo não precisa pagar IPVA"
  - [x] Barra de urgência com prazo de solicitação
  - [x] Prova social ("Já ajudamos mais de 3.000 famílias")
- [x] Dashboard de admin (/admin)
  - [x] Cards de estatísticas (total, elegíveis, não contatados, recentes)
  - [x] Gráfico de barras por deficiência
  - [x] Gráfico de barras por estado (top 10)
  - [x] Tabela de leads com filtros (busca, deficiência, estado, elegível, contatado)
  - [x] Paginação da tabela
  - [x] Botão de contato via WhatsApp direto
  - [x] Marcar lead como contatado/não contatado
  - [x] Exportação de leads em CSV
  - [x] Controle de acesso (apenas admin)
- [x] Notificação ao dono quando novo lead é capturado
- [x] Testes unitários (9 testes passando)

## Pendente / Próximas Melhorias
- [ ] Integração com Google Sheets (exportação automática)
- [ ] Envio de email automático com relatório PDF ao lead
- [ ] Integração com WhatsApp Business API para follow-up automático
- [ ] Página de obrigado após captura do lead
- [ ] Pixel do Facebook/Meta para remarketing
- [ ] Integração com Google Analytics
- [ ] Campo UTM tracking para medir origem dos leads

## Fase 3 - Correções e Melhorias Textuais (solicitado)
- [x] Verificar e corrigir dado do RN sobre não-condutor
- [x] Novo título principal: "Você pode estar pagando IPVA indevidamente"
- [x] Usar autismo como exemplo central + outras deficiências abaixo
- [x] Inserir tabela/lista de deficiências elegíveis no texto para gerar curiosidade
- [x] Ajustar copywriting para público de pais de autistas
