import { useState, useContext, useEffect } from 'react'
import { UserAuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NavigationBar from "../components/NavigationBar";
import { redirectToLogin } from "../Home";
import { setUpMultiplayer } from './GamePageLogic';

function GamePage(){

    
    const userAuth = useContext(UserAuthContext);
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);
    const [word, setWord] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        redirectToLogin(userAuth, navigate);
    }, [])
    useEffect(() => {
        
        if(userAuth._id != ""){
            setUpMultiplayer(setSocket, setWord, userAuth, navigate, setGameStarted);
            console.log("FROM EFFECT: " + userAuth.username)
        }
    }, [userAuth._id])

    if(socket == null || !gameStarted || word == null){ // || word == null
        
        return <>
        Web socket is missing!
        </>
    }else{
        return <>
            <NavigationBar />
        </>
    }
}





//returns a format where it maps letter to color.


export default GamePage;