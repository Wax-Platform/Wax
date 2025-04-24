#!/bin/sh
set -x
# This is run through docker. Its CWD will be the root folder.

node_modules/.bin/coko-server migrate
node scripts/runners/createGlobalTeams.js
node scripts/runners/createAdmin.js
node scripts/runners/createApplicationParameters.js

exec "$@"
