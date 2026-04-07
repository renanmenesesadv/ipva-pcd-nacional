#!/bin/bash
# Backup do banco MySQL da Hostinger
# Executar via cron: 0 3 * * * /path/to/backup-db.sh

BACKUP_DIR="$HOME/backups/ipvazero"
DATE=$(date +%Y-%m-%d_%H%M)
DB_HOST="127.0.0.1"
DB_USER="u588509227_ipva"
DB_PASS="HondaPunto9671"
DB_NAME="u588509227_ipva"
KEEP_DAYS=30

mkdir -p "$BACKUP_DIR"

# Dump do banco
mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_DIR/backup_${DATE}.sql" 2>/dev/null

if [ $? -eq 0 ]; then
  gzip "$BACKUP_DIR/backup_${DATE}.sql"
  echo "[$(date)] Backup OK: backup_${DATE}.sql.gz"
else
  echo "[$(date)] ERRO: Backup falhou"
fi

# Remove backups com mais de N dias
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$KEEP_DAYS -delete 2>/dev/null

echo "[$(date)] Backups ativos: $(ls $BACKUP_DIR/backup_*.sql.gz 2>/dev/null | wc -l)"
