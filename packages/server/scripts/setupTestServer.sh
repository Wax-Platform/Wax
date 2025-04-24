#!/bin/sh
set -x
# This is run through docker. Its CWD will be the root folder.
sh scripts/wait-for-it db:5432 -t 60
sh scripts/wait-for-it http://s3:9001 -t 60

exec "$@"
