import { useState, useContext, useEffect } from 'react'
import { UserAuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NavigationBar from "../components/NavigationBar";
import { redirectToLogin } from "../Home";

function GamePage(){

    
    const userAuth = useContext(UserAuthContext);
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);
    const [word, setWord] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    useEffect(() => {
        setUpMultiplayer(setSocket, setWord, userAuth, navigate, setGameStarted);
    }, [])

    if(socket == null || !gameStarted){
        return <>
        Web socket is missing!
        </>
    }else{
        return <>
            <NavigationBar />
        </>
    }
}


function sendMessage(socket, message) {
    
        socket.send(message);
    
}

async function setUpMultiplayer(setSocket, setWord, userAuth, navigate, setGameStarted){
    await redirectToLogin(userAuth, navigate);
    //Successfully logged in or redirected out. Set up connection to server.
    
    const socket = new WebSocket("ws://localhost:8080/"); //get port number from .env later.
    
    const opponent_id = "";
    const pictWord = "";

    socket.onopen = (event) => {
        console.log("Websocket got connected: ");
        console.log(event)
        sendMessage(socket, JSON.stringify({command:"REGISTER", data: {
            _id:userAuth._id
        }}))
        setGameStarted(true)
    }
    //Recieving messages from central server.
    socket.onmessage = (msg) => {
        if(msg.data.command == "OTHER_PLAYER"){
            opponent_id = msg.data.data.other_id;
        }else if(msg.data.command == "PICT_WORD"){
            pictWord = msg.data.data.pict_word;
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

export default GamePage;