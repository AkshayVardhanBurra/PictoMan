import express from "express";
import User from "../models/User.model.js";
import Game from "../models/Game.model.js";
import mongoose from "mongoose";

export const router = express.Router();

router.use(express.json())





//localhost:####/api/users?records=<number_of_records>&slide=<slide_number>
//basically, number_of_records=50 and slide_number = 3?
router.get("/users", async (req, res) => {

    try{
    const slide_number = Number(req.query.slide_number);
    const number_of_records = Number(req.query.number_of_records);
    
    console.log(typeof(slide_number))
    const users = await User.find({}).sort({games_won:-1, username:-1}).
    skip(slide_number * number_of_records).limit(number_of_records);

    

    console.log(req.query)

    return res.status(200).json({success:true, users:users, empty:users.length == 0});
    
    }catch(error){
        return res.status(400).json({success:false, message:"Something is wrong with the query or URL idk bro."})
    }
});

router.post("/recordgame", async(req, res) => {
    try{
        const gameRecord = new Game(req.body)
        await gameRecord.save();
        return res.status(200).json({success:true, message:"Successfully saved game record"})
    }catch(error){
        return res.status(400).json({success:false, message:"Failed to save game record!"})
    }
})

router.get("/getrecords", async (req, res) => {
    try{
        const userId = new mongoose.Types.ObjectId(req.query.userid)
        const records = await Game.find({ $or: [ { winner: req.query.userid }, { loser: req.query.userid } ] }).populate([
            {
            path: "winner",
            select: "username"
            }, 
            {
            path: "loser",
            select: "username"
            }])
            console.log(records)
        return res.json({success:true, records: records})
    }catch(error){
        console.log(error)
        return res.status(400).json({success:false, message:"Failed to fetch records"})
    }
})

//This will be continuously called by the SearchBar component.
router.get("/searchUsers", async (req, res) => {
    try{
        console.log("Here!")
        const exactUser = await User.find({username:req.query.startsWith})
        console.log(exactUser);
        const users = await User.find({username:{$regex: req.query.startsWith}}).limit(req.query.limit);
        if(exactUser.length > 0){
            return res.status(200).json({searchResults: users, exactUser:exactUser})
        }else{
            return res.status(200).json({searchResults: users, exactUser:null})
        }
        
    }catch(error){
        console.log(error);
        return res.status(400).json({success:false, message:"Something went wrong in the server!"});
    }
})

router.get("/getIndividualUser/:username", async (req, res)=>{
    try{
        const user = await User.findOne({ 
  username: { $regex: new RegExp(req.params.username, 'i') } 
});
        console.log("Called with user " + JSON.stringify(user) + " " + req.params.username)
        return res.status(200).json(user);
    }catch(error){
        return res.status(400).json({success:false, message:"Something went wrong in the server!"});
    }
})

