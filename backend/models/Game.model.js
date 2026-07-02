import mongoose from "mongoose"

const gameSchema = {
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    loser: {
       
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        
    }
}

const Game = mongoose.model('Game', gameSchema)
export default Game