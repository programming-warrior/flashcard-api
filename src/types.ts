import {z} from "zod";
import { Request } from "express";

export const userSchema=z.object({
    username:z.string(),
    password:z.string()
})

export const flashCardContentSchema=z.object({
    question:z.string(),
    answer:z.string()
})

export const idSchema=z.string().uuid();

export interface RequestWithUsername extends Request{
    username?:string;
}