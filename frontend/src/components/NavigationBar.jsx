
import styles from "./NavigationBar.module.css"
import {useContext, useState} from "react"
import {Link, useNavigate} from "react-router-dom"
import { validateUser } from "../Home"
import { useEffect } from "react";
import { UserAuthContext } from "../contexts/AuthContext";


async function checkLoggedIn(context){

    if(context.username != ""){
        return true;
    }else{
        const user = await validateUser();

        if(user != null){
            context.setUsername(user.username);
            context.setGamesWon(user.games_won);
        }

       
        return user != null;
    }


}



function logOut(context, setLogged, navigate){
    fetch("http://localhost:5050/auth/logOut", {
        credentials:"include",
        method: 'POST', // Specify the method
        headers: {
            'Content-Type': 'application/json' // Tell the server you're sending JSON
        }
    }).then(pr => {
        
        if(pr.ok){
            console.log("Setting up log out!")
            setLogged(false);
            context.setUsername("");
            context.setGamesWon(0);
            navigate("/auth/login")
            
        }
        return pr.json()
    }).then(j => {console.log(JSON.stringify(j))})
}


function NavigationBar(){


    const [isLogged, setIsLogged] = useState(false);
    const authContext = useContext(UserAuthContext);
    const [logStatusChange, setStatus] = useState(1);
    const navigate = useNavigate();
    useEffect(() => {
        console.log("checking log status!")
        checkLoggedIn(authContext).then(loggedStatus => {
            setIsLogged(loggedStatus);
        })
    }, [])

    useEffect(() => {
        if(logStatusChange != 1){
            logOut(authContext, setIsLogged, navigate);
        }
    }, [logStatusChange])



    return <>
    <nav className={styles.navBar}>
        <h1 className = {styles.logo}>PictoMan</h1>
        <div className = {styles.mover}>
            <ul className = {styles.navList}>
                
                <li className = {styles.navItem}> Home</li>
                <li className = {styles.navItem}> How To Play</li>
                {!isLogged ? <li className = {styles.navItem}> <Link to="/auth/login"> Login/Sign Up </Link>  </li> :
                <li className = {styles.navItem}> <p onClick={() => {setStatus(logStatusChange + 1)}}> Log Out</p></li>}
            </ul>
        </div>
    </nav>
    </>
}

export default NavigationBar;