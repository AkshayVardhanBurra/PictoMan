import { useState, useContext, useEffect } from 'react'
import { UserAuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NavigationBar from "../components/NavigationBar";
import { redirectToLogin } from "../Home";
import { judge, my_id, opponent_id, room_id, sendMessage, setUpMultiplayer } from './GamePageLogic';
import {generate} from 'random-words'
import CountdownTimer from '../components/Timer';
import { DrawingBoard } from '../components/DrawingBoard';

const MAX_QUEUE_MESSAGES = 4;


function PictWordDisplay({pict_word, colorMap}){

    const helper = (pict_word) => {
        const tags = [];

        
        for(let i = 0; i < pict_word.length; i++){


            
                if(colorMap[i] == 'w'){
                    tags.push(<span key={i} style={{color:"white"}}> {pict_word[i]} </span>)
                }else{
                   
                    tags.push(<span key={i} style={{color:"red"}}> {pict_word[i]} </span>)
                
                }
            
        }

        return tags;
    }
    return <>
    <p>
        
        {helper(pict_word)}
    </p>
    </>
}



function OpponentPictWord({opponentWord, opponentGuesses}){


    const helper = () => {

        const jsxnodes = []
        for(let i = 0; i < opponentWord.length; i++){
            if(opponentGuesses.includes(opponentWord[i])){
                jsxnodes.push(<span key={i}> {opponentWord[i]} </span>);
            }else{
                jsxnodes.push(<span key={i}> _ </span>);
            }
        }

        return jsxnodes;
    }
    console.log("OPPONENT WORD: " + opponentWord)
    return <>

        {
            helper()
        }
    </>
}

export const MAX_GUESSES = 6;
export let currentGuesses = 0;

export function resetGuesses(){
    currentGuesses = 0;
}

function guessWord(socket, phrase, guessQueue, setGuessQueue, opponentWord, setOpponentWord){
    if(socket == null || socket == undefined){
        return;
    }

    //TODO make sure to handle number of guesses
    //TODO send reset message once word is guessed
    const addedGuessQueue = new Set([]);
    for (const guess of phrase){
        if(opponentWord.includes(guess)){
            addedGuessQueue.add(guess);
        }else{
            //number of guesses goes up
            currentGuesses += 1;
            if(currentGuesses >= MAX_GUESSES){
                const message = {
                    command: "RESET_OPPONENT_WORD", 
                    data: {
                        room_id: room_id,
                        opponent_id: opponent_id,
                        pict_word: generate()
                    }
                }
                setOpponentWord(message.data.pict_word);
                sendMessage(socket, JSON.stringify(message));
                setGuessQueue([]);
                resetGuesses();
            }
            return;
        }
    }
    
    let theGuessQueue = [...new Set([...guessQueue, ...addedGuessQueue])]
    setGuessQueue(theGuessQueue);

    let counter = 0;
    for(let i = 0; i < theGuessQueue.length; i++){
        if(opponentWord.includes(theGuessQueue[i])){
            counter+=1;
        }
    }

    console.log(theGuessQueue)
    let uniqueOppStr = [...new Set(opponentWord)].join("");
    if(counter == uniqueOppStr.length){
        let opWord = generate();
        sendMessage(socket, JSON.stringify({
            command: "RESET_BOARD",
            data:{
                room_id:room_id,
                opponent_id:opponent_id,
                pict_word:opWord
            }

        }))
        setOpponentWord(opWord)
        setGuessQueue([]);
    }
}



function GamePage(){

    
    const userAuth = useContext(UserAuthContext);
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);
    const [word, setWord] = useState("");
    const [colorMap, setColorMap] = useState("");
    const [opponentWord, setOpponentWord] = useState("");
    const [opponentGuesses, setOpponentGuesses] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [pictWordInput, setPictWordInput] = useState("");
    const [prompt, setPrompt] = useState("");
    const [shouldExport, setShouldExport] = useState(false);
    const [scores, setScores] = useState(null);
    const [gameEnded, setGameEnded] = useState(false);

    const exportImg = (dataUrl) => {
        sendMessage(socket, JSON.stringify({
            command: "UPLOAD_IMAGE",
            data: {
                "opponent_id":opponent_id,
                "my_id": my_id,
                "room_id": room_id,
                "img_url_64": dataUrl,
                "prompt": prompt
            }
        }))

        setGameEnded(true)
    }

    useEffect(() => {
        redirectToLogin(userAuth, navigate);
    }, [])
    useEffect(() => {

        if(userAuth._id != ""){
            setUpMultiplayer(setSocket, setWord, userAuth, navigate, setGameStarted, setColorMap, setOpponentWord, prompt, setPrompt, setScores);
        }else{

            redirectToLogin(userAuth, navigate);
        }
    }, [userAuth._id])

    if(gameEnded){
        return <EndGameScreen scores={scores} />
    }

    if(socket == null || !gameStarted || word == "" || prompt == ""){ // || word == null
        console.log("Loading game!")
        return <>
        Loading game.....
        </>
    }else{
        
        return <>
            <NavigationBar />
            <h2> Prompt: {prompt} </h2>
            <CountdownTimer initialMinutes={1} onTimerEnd={() => {
                if(judge){
                    console.log("I am the judge!")
                }else{
                    console.log("I am not the judge")
                }

                setShouldExport(true);
                
            }}/>
            <PictWordDisplay pict_word={word} colorMap={colorMap} />
            <OpponentPictWord opponentWord={opponentWord} opponentGuesses={opponentGuesses} />
            <input type="text" onChange={(e) => {
                setPictWordInput(e.target.value);
            }} value={pictWordInput}/>
            <button onClick={() => {
                guessWord(socket,  pictWordInput.toLowerCase(), opponentGuesses, setOpponentGuesses, opponentWord.toLowerCase(), setOpponentWord )
            }}> Enter </button>

            <DrawingBoard shouldExport = {shouldExport} onExport={exportImg}/>
        </>
    }
}


function EndGameScreen({scores}){
    

    useEffect(() => {
        if(scores != null){
            console.log("Sending API request to add game to players' records")
        }
    }, [scores])


    if(scores == null){
        return <h2> Retrieving scores....</h2>
    }else if(scores[my_id] > scores[opponent_id]){
        return <h2> You won! Your score was {scores[my_id]} out of 10</h2>
    }else{
        return <h2> You lost! Your score was {scores[my_id]} out of 10</h2>
    }

}




//returns a format where it maps letter to color.


export default GamePage;