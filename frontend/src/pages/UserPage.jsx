import {useState, useEffect} from "react";
import { useParams } from "react-router-dom";
import styles from "./UserPage.module.css";
import API_URL from "../api_url";
import NavigationBar from "../components/NavigationBar";



function UserPage(){

    const {username} = useParams();
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {

        setIsLoading(true);

        fetch(`${API_URL}api/getIndividualUser/${username}`).then(p => p.json())
        .then(j => {
            console.log(j)
            
                setUserData(j);
                console.log("The user data is set")
                setIsLoading(false);
            }
        )


        
        
    }, [])


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
        <h1> {userData.username}</h1>
        <div className={styles.gamesWonSection}>
            <p>
            Games Won:
            </p>
            <p>
            {userData.games_won}
            </p>
        </div>
        <GameRecords userid={userData._id}/>
      </>
    }
}

function GameRecords({userid}){

    let [gameRecords, setGameRecords] = useState([])

    useEffect(() => {
        if(userid != null && userid !== ""){
           
            fetch(`${API_URL}api/getrecords?userid=${userid}`).then(p => p.json()).then(js => {
                let response = js;
                if(response.success){
                    setGameRecords(response.records)
                    console.log(response.records)
                    console.log(response.records[0])
                }
            })
        }
    }, [userid])


    return (
        <div>
            {gameRecords.map(record => (
                <h3 key={record._id}>Winner: {record.winner.username} Loser: {record.loser.username}</h3>
            ))}
        </div>
    )

}


export default UserPage;
//Get the user when component first loads for first time. //get username from dynamic url.

// Display name and games won