import express from "express";
import User from "../models/User.model.js";
import bcrypt from "bcrypt";

import { generateToken } from "../jwthandler.js";
import {verifyToken} from "./middleware.js"
const router = express.Router();

router.use(express.json());

//Working
router.post("/createaccount", async (req, res) => {
    //Don't need to chck if request has the necessary information. form validation will handle that.

    try{
        if(await User.findOne({username: req.body.username}) != null){
            return res.status(400).json({success:false, message:"User already exists!"});
        }
        const newUser = new User(req.body);
        newUser.password = await bcrypt.hash(newUser.password, 10);
        await newUser.save();
        res.status(201).json({success:true, _id: newUser._id, username:newUser.username});
    }catch(error){
        res.status(404).json({success:false, message:"Something went wrong in the server while trying to createaccount: " + req.body.username})
    }

    
})



//Working
router.post("/login", async (req, res) => {
    const {username, password} = req.body;

    try{

    const userFound = await User.findOne({username:username});
    if(userFound == null){
        return res.status(400).json({success:false, message:"User is not there!"})
    }
    console.log(userFound.password)
    if(await bcrypt.compare(password, userFound.password)){
        console.log("Cookie Sent!")
        res.cookie("mirror", "mirrorcookie!", {
            sameSite: "lax",
            httpOnly:false,
            secure:false, 
            
        })
        res.cookie("token", generateToken(userFound), {
            maxAge: 3600000 * 24,
           //sameSite:'strict'
           httpOnly:true,
           secure:false, // change to true later


        })

        res.status(200).json({success:true, username:userFound.username, games_won:userFound.games_won})
        
    }else{
        return res.status(400).json({success:false, message:"Wrong password or username"})
    }

    }catch(error){
        console.log(error)
        return res.status(400).json({success:false, message:"Something went wrong in the server!"})
    }

    
})

//Just call this when the user wants to log out.
//don't forget to clear the context too.
router.post('/logOut', async (req, res) => {
    console.log("Clearing the cookie!")
    res.clearCookie('token').status(200).json({ success: true });
});
//Working
router.get("/checkusername", async (req, res) => {
    const usernameFromUser = req.query.username;
    console.log(req.url);
    if(usernameFromUser == null){
        return res.status(404).json({
            success:false,
            body:"Something went wrong with the query or the server!"
        })
    }else{

        try{
        const user = await User.findOne({username:usernameFromUser});

        if(user == null){
            return res.status(200).json({
                success:true,
                exists:false
            })
        }else{
            return res.status(200).json({
                success:true,
                exists:true
            })
        }
    }catch(error){
        return res.status(404).json({
            success:false,
            body:"Something went wrong with the query or the server!"
        })
    }
    }


})


router.get("/validate", verifyToken, async(req, res) => {
    try{
        const user = await User.findById(req.user.id);
        console.log(user.id);
        return res.status(200).json(user)
        
    }catch(error){
        console.log(error)
       return res.status(400).json({success:false, message:"Something went wrong in the server!"})
    }
})

export default router;