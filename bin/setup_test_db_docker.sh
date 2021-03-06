#!/bin/bash

if [[ "$OSTYPE" == "linux-gnu"* && $EUID != 0 ]]
then
	commandPrefix="sudo"
else
	commandPrefix=
fi

# Start docker yml from path and detached.
docker-compose -f docker/pg/docker-compose.yml up -d postgres

wait_time=5s

# Wait for PostgreSQL Server to come up.
echo waiting database to start in $wait_time...
sleep $wait_time
echo database started...

# Drop if exists and re-create database.
docker exec postgres dropdb nhs-virtual-visit-test -U postgres
docker exec postgres createdb nhs-virtual-visit-test -U postgres

# Run create tables scripts.
npm run dbmigratetest up
