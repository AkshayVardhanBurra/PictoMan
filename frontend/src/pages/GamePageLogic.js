import { redirectToLogin } from "../Home";
import { currentGuesses, resetGuesses } from "./GamePage";


export let opponent_id = "";
export let pictWord = "";
export let room_id = "";
export let judge = false;
export let promptLogicLayerCopy = "";
export let my_id = ""

export function resetVariables(){
    opponent_id = "";
    pictWord = "";
    room_id = "";
    judge = false;
    promptLogicLayerCopy = "";
    my_id = ""
}

let internalBoardState = false;
let intervalID = ""

export function clearHeartBeat(){
    if(intervalID != ""){
        clearInterval(intervalID)
    }
}

function sendHeartBeat(socket){
    if(my_id != ""){
        sendMessage(socket, JSON.stringify({command:"HEART_BEAT", data:{"current_id":my_id}}))
        console.log("SENT HEART BEAT!")
    }
}

export async function setUpMultiplayer(setSocket, setWord, userAuth, navigate, setGameStarted, setColorMap, setOpponentWord, prompt, setPrompt, setScores, boardState, setBoardState){
    //Successfully logged in or redirected out. Set up connection to server.
    const socket = new WebSocket("wss://pictoman-ei8a.onrender.com"); //get port number from .env later.
    


    socket.onopen = (event) => {
        
        sendMessage(socket, JSON.stringify({command:"REGISTER", data: {
            _id:userAuth._id
        }}))

        const heartBeatIntervalId = setInterval(() => {sendHeartBeat(socket)}, 1000)
        intervalID = heartBeatIntervalId
    }


    //Recieving messages from central server.
    socket.onmessage = async (msg) => {
        console.log("entered the onmessage")
        console.log(msg.data)
        let parsed = JSON.parse(msg.data)
        if(parsed.command.includes("OTHER_PLAYER")){
            opponent_id = parsed.data.other_id;
            my_id = parsed.data.my_id
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
            judge = parsed.data.judge

            if(judge){
                //call api and get prompt
                let aiResponse = await getPromptFromLLM();
                
                //send prompt using sendMessage
                sendMessage(socket, JSON.stringify({
                    command:"SEND_PROMPT",
                    data:{
                        "opponent_id": opponent_id,
                        "room_id": room_id,
                        "prompt": aiResponse
                    }
                }))
                promptLogicLayerCopy = aiResponse
                setPrompt(aiResponse)
            }
        }

        if(parsed.command.includes("RESET_PICTWORD")){
            pictWord = parsed.data.pict_word;
            setWord(pictWord);
            setColorMap(colorifyPictWord(pictWord));
            
         
            console.log("RECIEVED RESET COMMAND: " + pictWord);
        }
        if(parsed.command.includes("RESET_BOARD")){
            pictWord = parsed.data.pict_word;
            setWord(pictWord);
            setColorMap(colorifyPictWord(pictWord));
            setBoardState(!internalBoardState)
            internalBoardState = !internalBoardState
            //resetBoard();
            console.log("RESET_BOARD: " + pictWord)
          
        }

        if(parsed.command.includes("SEND_PROMPT")){
            promptLogicLayerCopy = parsed.data.prompt
            setPrompt(promptLogicLayerCopy)
        }

        if(parsed.command.includes("RECIEVE_SCORES")){
            console.log("RECEIVED SCORES!!!!")
            setScores(parsed.data.scores);
        }
        if(parsed.command.includes("END_GAME")){
            resetVariables();
            alert("Other player left the game!")
            navigate("/");
            if(socket.OPEN){
                socket.close();
            }
            setSocket(null)
            clearHeartBeat()
        }

    }


    setSocket(socket);
}


async function getPromptFromLLM(){
    let response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method:"POST",
                    headers: {
                        "Authorization": `Bearer ${import.meta.env.VITE_LLMKEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "model": "cohere/north-mini-code:free",
                        "messages": [
                            {
                                "role": "user",
                                "content": "I need a random sentence to describe something interesting to draw. Preferably, combine two unrelated objects into a sentence that artists have to draw. Give me only one sentence. Do not use any introductory or conlusion text. Your output is only one sentence."

                            }
                        ],
                        "reasoning": {"enabled": false}
                    })
    })

    const result = await response.json()
    console.log(result)
    return result.choices[0].message.content;
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