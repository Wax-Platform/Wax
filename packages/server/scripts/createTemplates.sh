#!/bin/sh
set -x

node scripts/runners/createTemplates.js

exec "$@"
