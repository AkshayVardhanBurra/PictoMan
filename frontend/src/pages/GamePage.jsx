import { useState, useContext, useEffect } from 'react'
import { UserAuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NavigationBar from "../components/NavigationBar";
import { redirectToLogin } from "../Home";
import { setUpMultiplayer } from './GamePageLogic';


function PictWordDisplay({pict_word}){

    const helper = (pict_word) => {
        const tags = [];

        let currLetter;
        for(let i = 0; i < pict_word.length; i++){
            if(i % 2 == 0){
                currLetter = pict_word[i];
            }else{
                if(pict_word[i] == 'w'){
                    tags.push(<span key={i} style={{color:"white"}}> {currLetter} </span>)
                }else{
                   
                    tags.push(<span key={i} style={{color:"red"}}> {currLetter} </span>)
                
                }
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

function GamePage(){

    
    const userAuth = useContext(UserAuthContext);
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);
    const [word, setWord] = useState("");
    const [colorMap, setColorMap] = useState("");

    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        redirectToLogin(userAuth, navigate);
    }, [])
    useEffect(() => {
        console.log("HERE WITH USER ID1 " + userAuth._id);

        if(userAuth._id != ""){
            console.log("HERE WITH USER ID " + userAuth._id);
            setUpMultiplayer(setSocket, setWord, userAuth, navigate, setGameStarted, setColorMap);
            console.log("FROM EFFECT: " + userAuth.username)
        }else{
            console.log("No id, was blank")
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
            <PictWordDisplay pict_word={word} />
        </>
    }
}





//returns a format where it maps letter to color.


export default GamePage;