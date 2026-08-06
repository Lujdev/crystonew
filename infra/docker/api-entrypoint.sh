#!/bin/sh
set -eu

node_modules/.bin/typeorm migration:run -d dist/database/data-source.js
node dist/database/seeds/run-seeds.js
exec node dist/main.js
