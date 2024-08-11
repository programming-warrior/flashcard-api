import express from "express";
import dotevn from "dotenv";
dotevn.config();

import pool from "./db"; 

const app=express();


app.get('/',(req,res)=>{
    return res.status(200).json({messsage:"hello world"});
})


app.listen(process.env.PORT,()=>{
    console.log(`listening on PORT ${process.env.PORT}`);
})

