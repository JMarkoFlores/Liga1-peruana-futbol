#!/bin/sh
set -eu
# TCP evita dar por listo el servidor temporal usado durante la inicialización.
result=$(MYSQL_PWD="$MYSQL_PASSWORD" mysql --protocol=TCP -h127.0.0.1 \
    -u"$MYSQL_USER" "$MYSQL_DATABASE" -Nse \
    "SELECT IF(EXISTS(SELECT 1 FROM equipos) AND EXISTS(SELECT 1 FROM partidos),1,0) FROM demo_initialization WHERE id=1 AND seed_version='liga1-v1'")
test "$result" = "1"
