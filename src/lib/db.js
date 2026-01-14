import mysql from "mysql2/promise";

let connection;

export async function getConnection() {
    if (!connection) {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER || "aventura",
            password: process.env.DB_PASSWORD || "aventura",
            database: process.env.DB_NAME || "parque_aventuras",
        });
    }
    return connection;
}