import {useState, useEffect} from "react";
import { useParams } from "react-router-dom";
import styles from "./UserPage.module.css";
import API_URL from "../api_url";






function UserPage(){

    const {username} = useParams();
    const {userData, setUserData} = useState(null);
    const {isLoading, setIsLoading} = useState(true);
    useEffect(() => {

        setIsLoading(true);

        fetch(`${API_URL}api/getIndividualUser/${username}`).then(p => p.json())
        .then(j => {
            if(j.length != 1){
                setUserData(null);
            }else{
                setUserData(j[0]);
                setIsLoading(false);
            }
        })


        
        
    })


    if(isLoading){
        return <div>
            IS LOADING.....
        </div>
    }
    else if(userData == null){
        return <div>
            USER NOT FOUND!
        </div>
    }else{
    return <>
        <NavigationBar />
        <div className={styles.gamesWonSection}>
            <p>
            Games Won:
            </p>
            <p>
            {userData.gamesWon}
            </p>
        </div>
      </>
    }
}


//Get the user when component first loads for first time. //get username from dynamic url.

// Display name and games won