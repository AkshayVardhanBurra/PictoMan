import { useState, useContext, useEffect } from 'react'
import { UserAuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NavigationBar from "../components/NavigationBar";
import { redirectToLogin } from "../Home";
import { setUpMultiplayer } from './GamePageLogic';


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
            <PictWordDisplay pict_word={word} colorMap={colorMap} />
        </>
    }
}





//returns a format where it maps letter to color.


export default GamePage;