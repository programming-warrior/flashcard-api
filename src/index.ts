import express from "express";
import dotevn from "dotenv";
dotevn.config();
import jwt from "jsonwebtoken";
import { z } from "zod";
import pool from "./db";
import { userSchema, flashCardContentSchema, idSchema } from "./types";
import { authenticateAdmin } from "./middleware";
import { v4 as uuidv4 } from 'uuid';
import cors from "cors";


const app = express();

const corsOptions = {
    origin: '*', 
};
app.use(cors(corsOptions));
app.use(express.json())




app.post("/api/login", async (req, res) => {
    const user = userSchema.safeParse(req.body);
    if (!user.success) {
        return res.status(400).json({error:"invalid credentials"});
    }
    const { username, password } = user.data;
    try {
        const [rows]: any = await pool.query('SELECT * FROM  admin WHERE username=?', [username]);

        const result: any = rows[0];
        if(!result) return res.status(400).json({error:"invalid credentials"});

        if (result.password !== password) {
            return res.status(400).json({ error: "invalid credentials" });
        }

        const token = jwt.sign(
            { username: result.username },
            process.env.JWT_SECRET || "",
            { expiresIn: '1h' }
        );

        await pool.query('INSERT INTO session VALUES(?)',[token]);

        return res.status(200).json({ token });
    }
    catch (e: any) {
        return res.status(500).json({ error:"something went wrong"});
    }

});

app.get('/',(req,res)=>{
    return res.send("hello world");
})

app.get('/api/fetch',async(req,res)=>{
    const page=req.query;
    try{
        const [rows]=await pool.query('SELECT * from flashcontent ');
        return res.status(200).json(rows);
    }
    catch(e:any){
        return res.status(500).json({error:e.message});
    }
})


app.post('/api/create', authenticateAdmin, async (req, res) => {
    const content = flashCardContentSchema.safeParse(req.body);

    if (!content.success) return res.status(400).send(content.error.message);

    const { question, answer } = content.data;
    const id = uuidv4()

    try {
        const [rows]: any = await pool.query('INSERT INTO flashcontent values(?,?,?)', [id, question, answer]);

        if (rows.affectedRows > 0) return res.status(201).json({ id, question, answer });

        return res.status(500).json({ error: "something went wrong" });
    }
    catch (e: any) {
        return res.status(500).json({ error: "something went wrong" });
    }

})

app.delete('/api/delete/:id', authenticateAdmin, async (req, res) => {
    const id = idSchema.safeParse(req.params.id);
    if (!id.success) return res.status(401).send(id.error.message);

    try {
        const [rows]: any = await pool.query('DELETE FROM flashcontent WHERE id=?', [id.data]);

        if (rows.affectedRows > 0) return res.status(201).end();

        return res.status(404).json({ error: "invalid id" });
    }
    catch (e: any) {
        return res.status(500).json({ error: e.message });
    }

})


app.put('/api/update/:id', authenticateAdmin, async (req, res) => {

    const content = flashCardContentSchema.safeParse(req.body);

    if (!content.success) return res.status(400).send(content.error.message);

    const id = idSchema.safeParse(req.params.id);
    if (!id.success) return res.status(401).send(id.error.message);

    const { question, answer } = content.data;


    try {
        const [rows]: any = await pool.query(
            'UPDATE flashcontent SET question = ?, answer = ? WHERE id = ?',
            [question, answer, id.data]
        );

        if (rows.affectedRows > 0) return res.status(201).end();

        return res.status(404).json({ error: "invalid id" });
    }
    catch (e: any) {
        return res.status(500).json({ error: e.message });
    }

})

app.post('/api/token/delete',async (req,res)=>{
    let token=req.body.token;
    token=typeof(token)==='string' && token.trim().length>0 ? token : null;
    if(!token) return res.status(404).json({error:"no token found"});
    console.log(token);
    const [row]:any=await pool.query('DELETE FROM session WHERE token=? ',[token]);
    if(row.affectedRows>0){
        return res.status(201).end();
    }
    return res.status(500).json({error:"server error"});
})



app.listen(process.env.PORT, () => {
    console.log(`listening on PORT ${process.env.PORT}`);
})

