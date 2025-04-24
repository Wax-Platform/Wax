#!/bin/sh
set -x

node scripts/runners/createCollection.js

exec "$@"
