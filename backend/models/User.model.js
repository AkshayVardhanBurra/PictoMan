import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    username: {
        type:String,
        required:true,
        unique:true
    },

    password: {
        type:String,
        required:true
    },

    games_won:{
        type:Number,
        default:0
    }
}, {
    timestamps:true //createdAt, updatedAt
})

const User = mongoose.model('User', userSchema);

export default User;


