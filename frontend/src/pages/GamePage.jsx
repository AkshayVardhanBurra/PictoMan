import { useState, useContext, useEffect } from 'react'
import { UserAuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NavigationBar from "../components/NavigationBar";
import { redirectToLogin } from "../Home";
import { sendMessage, setUpMultiplayer } from './GamePageLogic';


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

function GuessQueue({guessQueue}){

    return <>
        
        <div>
            {
                guessQueue.map((guess) => {
                    return <p key={guess.id}> Opponent guessed {guess.letter} </p>
                })
            }
        </div>
    
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

function guessWord(socket, phrase, guessQueue, setGuessQueue, opponentWord){
    if(socket == null || socket == undefined){
        return;
    }

    //TODO send reset message once word is guessed
    //TODO make sure to handle number of guesses
    //TODO make sure to make it visible to opponent about the guesses
    const addedGuessQueue = [];
    for (const guess of phrase){
        if(opponentWord.includes(guess) && !guessQueue.includes(guess)){
            addedGuessQueue.push(guess);
        }else{
            //number of guesses goes up
            return;
        }
    }

    setGuessQueue([...guessQueue, ...addedGuessQueue]);
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

    //max amount of items determined my MAX_QUEUE_MESSAGES
    const [guessQueue, setGuessQueue] = useState([{id:1, letter:"A"}, {id:2, letter:"B"}, {id:3, letter:"C"}, {id:4, letter:"D"}]);

    useEffect(() => {
        redirectToLogin(userAuth, navigate);
    }, [])
    useEffect(() => {

        if(userAuth._id != ""){
            setUpMultiplayer(setSocket, setWord, userAuth, navigate, setGameStarted, setColorMap, setOpponentWord);
        }else{

            redirectToLogin(userAuth, navigate);
        }
    }, [userAuth._id])

    if(socket == null || !gameStarted || word == ""){ // || word == null
        
        return <>
        Web socket is missing!
        </>
    }else{
        console.log(word);
        return <>
            <NavigationBar />
            <GuessQueue guessQueue={guessQueue} />
            <PictWordDisplay pict_word={word} colorMap={colorMap} />
            <OpponentPictWord opponentWord={opponentWord} opponentGuesses={opponentGuesses} />
            <input type="text" onChange={(e) => {
                setPictWordInput(e.target.value);
            }} value={pictWordInput}/>
            <button onClick={() => {
                guessWord(socket,  pictWordInput, opponentGuesses, setOpponentGuesses, opponentWord)
            }}> Enter </button>
        </>
    }
}





//returns a format where it maps letter to color.


export default GamePage;