import { redirectToLogin } from "../Home";



export async function setUpMultiplayer(setSocket, setWord, userAuth, navigate, setGameStarted, setColorMap){
    
    //Successfully logged in or redirected out. Set up connection to server.
    
    const socket = new WebSocket("ws://localhost:8080/"); //get port number from .env later.
    
    const opponent_id = "";
    const pictWord = "";

    socket.onopen = (event) => {
        
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
            setWord(pictWord);
            setColorMap(colorifyPictWord(pictWord));
        }
    }

    //COMMENT OUT LATER
    setWord("EXAMPLE")
    setColorMap(colorifyPictWord("EXAMPLE"));

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


function sendMessage(socket, message) {
    
    socket.send(message);
    
}