import { useState, useContext, useEffect } from 'react'
import NavigationBar from './components/NavigationBar'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { UserAuthContext } from './contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

//returns the user
async function validateUser(){
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
async function redirectToLogin(userAuth, navigate){
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

function Home() {
  const [count, setCount] = useState(0)
  const userAuth = useContext(UserAuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    
    
    redirectToLogin(userAuth, navigate)
    
  }, []);
  

  return (
    <>
      <NavigationBar />
      <h1> Hello {userAuth.username} </h1>
    
    </>
  )
}

export default Home
