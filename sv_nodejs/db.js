require('dotenv').config();
const mysql = require('mysql2');
console.log('Host',process.env.DB_HOST);
/*
 host: 'localhost',
        user: 'root',
        password: 'secret',
        port: 3306
*/

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
});

db.connect(err => {
    if (err) {
        console.error('Error de conexión a la base de datos:', err);
    } else {
        console.log('Conexión exitosa a la base de datos');
    }
});

module.exports = db;