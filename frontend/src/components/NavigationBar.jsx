
import styles from "./NavigationBar.module.css"
import {useContext, useState} from "react"
import {Link} from "react-router-dom"
import { validateUser } from "../Home"
import { useEffect } from "react";
import { UserAuthContext } from "../contexts/AuthContext";


async function checkLoggedIn(context){

    if(context.username != ""){
        return true;
    }else{
        const user = await validateUser();
        context.setUsername(user.username);
        context.setGamesWon(user.games_won);

       
        return user != null;
    }


}



function logOut(context){
    fetch("https://localhost:5050:/auth/logOut", {
        credentials:"include"
    }).then(pr => {
        if(pr.ok){
            context.setUsername("");
            context.setGamesWon(0);
        }
        return pr.json()
    }).then(j => {console.log(JSON.stringify(j))})
}


function NavigationBar(){


    const [isLogged, setIsLogged] = useState(false);
    const authContext = useContext(UserAuthContext);
    useEffect(() => {
        checkLoggedIn(authContext).then(loggedStatus => {
            setIsLogged(loggedStatus);
        })
    }, [])



    return <>
    <nav className={styles.navBar}>
        <h1 className = {styles.logo}>PictoMan</h1>
        <div className = {styles.mover}>
            <ul className = {styles.navList}>
                
                <li className = {styles.navItem}> Home</li>
                <li className = {styles.navItem}> How To Play</li>
                {!isLogged ? <li className = {styles.navItem}> <Link to="/auth/login"> Login/Sign Up </Link>  </li> :
                <li className = {styles.navItem}> <Link onClick={logOut} to="/auth/login"> Log Out</Link></li>}
            </ul>
        </div>
    </nav>
    </>
}

export default NavigationBar;