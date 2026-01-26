import { redirectToLogin } from "../Home";



export async function setUpMultiplayer(setSocket, setWord, userAuth, navigate, setGameStarted){
    
    //Successfully logged in or redirected out. Set up connection to server.
    
    const socket = new WebSocket("ws://localhost:8080/"); //get port number from .env later.
    
    const opponent_id = "";
    const pictWord = "";

    socket.onopen = (event) => {
        console.log("Websocket got connected: ");
        console.log(event)
        console.log("SENDING:")
        console.log(userAuth.username);
        
        sendMessage(socket, JSON.stringify({command:"REGISTER", data: {
            _id:userAuth._id
        }}))
        setGameStarted(true)
    }
    //Recieving messages from central server.
    socket.onmessage = (msg) => {
        if(msg.data.command == "OTHER_PLAYER"){
            opponent_id = msg.data.other_id;
        }else if(msg.data.command == "PICT_WORD"){
            pictWord = msg.data.pict_word;
            setWord(colorifyPictWord(pictWord))
        }
    }
    console.log("REACHED HERE!!!!!!!!")
    setSocket(socket);
}


function colorifyPictWord(pict_word){

    const colorified = {};

    for(const char of pict_word){
        colorified[char] = "white";
    }

    return colorified;
}


function sendMessage(socket, message) {
    
        socket.send(message);
    
}