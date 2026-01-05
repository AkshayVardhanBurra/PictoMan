import jwt from "jsonwebtoken";
import dotenv from "dotenv"

const SECRET = process.env.JWTSECRET;

export function generateToken(user){
    return jwt.sign({id: user._id, username:user.username}, SECRET, {
        expiresIn: '24h'
    })
}

