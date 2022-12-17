#!/bin/bash
#######  Initial setup for running TRAZEC  #######

## Run this script once to create the initial setup

## Prerequisites:
# - Make sure to install JavaScript, TypeScript and Node.js.
# - Make sure to install PostgreSQL and that the
#   `psql` command works from the command-line (make an alias for psql)
# - Make sure to install postgis

## Node.js packages installation
echo "Installing Node.js packages"
#npm install express@4.18.1 # Node.js
#npm install path@0.12.7 # Navigating and path creation
#npm install pg-promise@10.12.0 # PostgreSQL
#npm install yargs@17.5.1 # Commandline shortcuts
#npm install http-proxy-middleware@2.0.6 # Creating proxies
#npm install chai@4.3.6 # Integration testing
#npm install chai-http@4.3.0 # Integration testing
#npm install short-uuid@4.2.0 # Creating unique identifiers
#npm install uuid
#npm install totp-generator@0.0.13 # Generating tokens
#npm install mocha@10.0.0 # For running tests
#sudo npm install -g typescript # For using OOP and stronger types
#sudo npm install -g ts-node # For TypeScript
#npm install --save-dev @types/mocha # Needed to run mocha tests with Typescript
#npm install exact-math # For computing accurately with floating points.
#npm install --save-dev @types/chai-as-promised # For using eventually assertion tests.
#npm install chai-as-promised # For using eventually assertion tests.
echo "Node.js packages installed"


## Insert your name to create a role for you in the DB
ROLE_NAME="user1"
PASSWORD="1234"
DB_NAME="trazec"

## Install extensions
psql -U postgres -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
# psql -U postgres -c "CREATE EXTENSION IF NOT EXISTS postgis;" ## probably remove
# psql -U $ROLE_NAME -d $DB_NAME -c "CREATE EXTENSION postgis"

## Other
# psql -U postgres -c "SELECT * FROM pg_extension;"

## Clean up existing roles
# psql -U postgres -c "DROPUSER IF EXISTS $ROLE_NAME"

## Create the new role and grant privileges
# psql -U postgres -c "CREATE ROLE $ROLE_NAME WITH LOGIN PASSWORD '$PASSWORD';"
# psql -U postgres -c "ALTER ROLE $ROLE_NAME CREATEDB;"
psql -U $ROLE_NAME -d postgres -c "CREATE DATABASE $DB_NAME"
echo "Database $DB_NAME access created for user $ROLE_NAME"

## Remove tables if exists
psql -U $ROLE_NAME -d $DB_NAME -f "src/Models/database/resetSchema.sql"
echo "Tables removed from the database if they already existed."

psql -U postgres -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS postgis;"

## Add all the tables
psql -U $ROLE_NAME -d $DB_NAME -f "src/Models/database/schema.sql"
echo "Tables added to the database."
