import mysql from 'mysql2/promise';
import dotenv from 'dotenv'; 
dotenv.config();

const db_host = process.env.DB_HOST ?? 'localhost'
const db_port: number = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306
const db_username = process.env.DB_USER ?? 'root'
const db_password = process.env.DB_PASSWORD ?? 'root'
const db_databse = process.env.DB_NAME ?? 'test'


export default function poolReturner () {

    const pool = mysql.createPool({
        host: db_host,
        user: db_username,
        password: db_password,
        database: db_databse,
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
        idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
    });

    return pool      
}