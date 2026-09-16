// loads PostgreSQL's connection pool from the pg package
const { Pool } = require("pg")

const { connectionString } = require("pg/lib/defaults")

// loads variables from .env
require("dotenv").config()

// connect Express server and Neon
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

// let's server.js use connection
module.exports = pool