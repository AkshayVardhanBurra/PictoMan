import express from "express";
import User from "../models/User.model.js";

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

