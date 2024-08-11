import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { RequestWithUsername } from "./types";

const JWT_SECRET = process.env.JWT_SECRET || "";

interface JwtPayload {
    username: string
}



export const authenticateAdmin = (req: RequestWithUsername, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err,value) => {
        if (err) return res.sendStatus(403);

        req.username=(value as JwtPayload).username;

        next();
    });
}