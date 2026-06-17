import { redirectToLogin } from "../Home";



export async function setUpMultiplayer(setSocket, setWord, userAuth, navigate, setGameStarted, setColorMap, setOpponentWord){
    //Successfully logged in or redirected out. Set up connection to server.
    const socket = new WebSocket("ws://localhost:8080/"); //get port number from .env later.
    
    let opponent_id = "";
    let pictWord = "";
    let room_id = "";

    socket.onopen = (event) => {
        
        sendMessage(socket, JSON.stringify({command:"REGISTER", data: {
            _id:userAuth._id
        }}))
    }


    //Recieving messages from central server.
    socket.onmessage = (msg) => {
        console.log("entered the onmessage")
        console.log(msg.data)
        let parsed = JSON.parse(msg.data)
        if(parsed.command.includes("OTHER_PLAYER")){
            opponent_id = parsed.data.other_id;
        }
        if(parsed.command.includes("PICT_WORD")){
            pictWord = parsed.data.pict_word;
            setWord(pictWord);
            console.log("FROM SERVER: " + parsed.data.opponent_word);
            setOpponentWord(parsed.data.opponent_word);
            setColorMap(colorifyPictWord(pictWord));
            setGameStarted(true);
        }
        if(parsed.command.includes("ROOM_ID")){
            room_id = parsed.data.room_id;
        }

    }


    setSocket(socket);
}


//Returns a string of w's that are the same length as pict_word
function colorifyPictWord(pict_word){
    let result = "";

    for(let i = 0; i < pict_word.length; i++){
        result += "w";
    }
    return result;
    
}


export function sendMessage(socket, message) {
    
    socket.send(message);
    
}