
const mysql = require('mysql2/promise'); // 
const config = require('./config.json');

async function createConnection() {
    // create the connection to database
    const { host, port, user, password, database } = config.database;
    const connection = await mysql.createConnection({ host, port, user, password, database });
    return connection;
}

module.exports = createConnection;




