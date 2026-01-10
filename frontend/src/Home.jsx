import { useState, useContext, useEffect } from 'react'
import NavigationBar from './components/NavigationBar'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { UserAuthContext } from './contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import styles from "./Home.module.css"

//returns the user
export async function validateUser(){
  const userPromise = await fetch("http://localhost:5050/auth/validate", {
    credentials:'include'
  });
  
  if(userPromise.ok){
    console.log("returning user data!")
    const userData = await userPromise.json();
    console.log(userData);
    return userData;
  }else{
    return null;
  }
}

//it needs the context
//Use this function in every other page that needs to be protected.
//Put this in a useEffect.
export async function redirectToLogin(userAuth, navigate){
  if(userAuth.username == ""){

      console.log("Entered HERE!")
      let userExists = await validateUser();
      

      

      console.log(userExists)

      if(userExists){
        userAuth.setUsername(userExists.username);
        userAuth.setGamesWon(userExists.games_won);
      }else{
        navigate("/auth/login");
      }
    }
}

export function Home() {
  const [count, setCount] = useState(0)
  const userAuth = useContext(UserAuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    
    
    redirectToLogin(userAuth, navigate)
    
  }, []);
  

  return (
    <>
      <NavigationBar />
      <div className={styles.gamesWonSection}>
        <p>
          Games Won:
        </p>
        <p>
          {userAuth.gamesWon}
        </p>
      </div>

      <button className={styles.buttons}> Play </button>
      <button className={styles.buttons}> View Leaderboard </button>
    
    </>
  )
}


