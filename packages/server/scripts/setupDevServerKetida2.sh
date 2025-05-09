#!/bin/sh
set -x
# This is run through docker. Its CWD will be the root folder.
# node scripts/runners/createGlobalTeams.js
node scripts/runners/createAdmin.js
node scripts/runners/createApplicationParameters.js
node scripts/runners/createTemplates.js

exec "$@"
