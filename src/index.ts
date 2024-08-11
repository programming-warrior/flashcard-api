import express from "express";
import dotevn from "dotenv";
dotevn.config();
import jwt from "jsonwebtoken";
import pool from "./db";
import { userSchema,flashCardContentSchema } from "./types";
import { authenticateAdmin } from "./middleware";
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(express.json())




app.post("/login", async (req, res) => {
    const user = userSchema.safeParse(req.body);
    if (!user.success) {
        return res.status(400).send(user.error.message);
    }
    const { username, password } = user.data;
    try {
        const [rows]: any = await pool.query('SELECT * FROM  admin WHERE username=?', [username]);

        const result: any = rows[0];

        if (result.password !== password) {
            return res.status(400).json({ message: "invalid credentials" });
        }

        const token = jwt.sign(
            { username: result.username },
            process.env.JWT_SECRET||"",
            { expiresIn: '1h' }
        );

        return res.status(200).json({ token});
    }
    catch(e:any){
        return res.status(500).json({message:e.message});
    }

});

app.post('/create',authenticateAdmin,async(req,res)=>{
    const content=flashCardContentSchema.safeParse(req.body);

    if(!content.success) return res.status(400).send(content.error.message);

    const {question,answer}=content.data;
    const id=uuidv4()

    try{
        const [rows]: any = await pool.query('INSERT INTO flashcontent values(?,?,?)',[id,question,answer]);

        if(rows.affectedRows>0) return res.status(201).json({id,question,answer});

        return res.status(500).json({error:"something went wrong"});
    }
    catch(e:any){
        return res.status(500).json({error:e.message});
    }

})

app.listen(process.env.PORT, () => {
    console.log(`listening on PORT ${process.env.PORT}`);
})

