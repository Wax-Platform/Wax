#!/bin/sh
set -x
# This is run through docker. Its CWD will be the root folder.
sh scripts/wait-for-it db:5432 -t 60
sh scripts/wait-for-it http://s3:9001 -t 60
sh scripts/wait-for-it http://epubchecker:3001/healthcheck -t 60
sh scripts/wait-for-it http://pagedjs:3003/healthcheck -t 60
sh scripts/wait-for-it http://xsweet:3004/healthcheck -t 60

node scripts/runners/migrations.js
node scripts/runners/createGlobalTeams.js
node scripts/runners/createAdmin.js
node scripts/runners/createApplicationParameters.js
node scripts/runners/createTemplates.js

exec "$@"
