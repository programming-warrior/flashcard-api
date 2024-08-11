import express from "express";
import dotevn from "dotenv";
import mysql from "mysql2/promise";


dotevn.config();

const app=express();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT||''),
});


(async () => {
    try {
        const connection = await pool.getConnection();
        console.log("Connected to MySQL database");
        connection.release(); // Release the connection back to the pool
    } catch (error) {
        console.error("Error connecting to MySQL:", error);
    }
})();


app.listen(process.env.PORT,()=>{
    console.log(`listening on PORT ${process.env.PORT}`);
})

