import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { RequestWithUsername } from "./types";
import pool from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "";

interface JwtPayload {
    username: string
}



export const authenticateAdmin = async (req: RequestWithUsername, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    try {
        const [rows]: any = await pool.query('SELECT token FROM session WHERE token=?', [token]);
        if (rows.length==0 ) return res.status(401).json({error:"invalid token"});

        jwt.verify(token, JWT_SECRET, (err, value) => {
            if (err) return res.sendStatus(403);

            req.username = (value as JwtPayload).username;

            next();
        });
    }
    catch(e){
        return res.status(500).json({error:'something went wrong'});
    }


}