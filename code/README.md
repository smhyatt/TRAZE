
# How to run the project

The first step is to install JavaScript, TypeScript, PostgreSQL and PostGis on your computer.
Make sure that running `psql` work for running PostgreSQL (you might need
to create an alias).

For setting up the project and database run the `init.sh` script:

    chmod +x init.sh
    .\init.sh

To compile the project:

    npm run build

To clean the project:

    npm run clean

To run tests:

    npm test

To see the result on your browser goto `http://localhost:3002/` and run:

    // npm start
    node dist/src/routes.js


