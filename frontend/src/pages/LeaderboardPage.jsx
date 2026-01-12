import {useState, useEffect, useContext} from "react"
import {useNavigate} from "react-router-dom"
import NavigationBar from "../components/NavigationBar";
import API_URL from "../api_url";

const MAX_LEADERBOARD_USERS = 200;
const MAX_RECORDS_PER_PAGE = 2;

export function LeaderboardCard({user}){
    return <>
    <p> {user.username}: {user.games_won}</p>
    </>
}

export async function getUsers(currWindow, number_of_records){
    const apiPromise = await fetch(`${API_URL}api/users?number_of_records=${number_of_records}&slide_number=${currWindow}`);
    if(apiPromise.ok){
        const userJson = await apiPromise.json()
        return userJson;
    }else{
        return null;
    }
}

export function LeaderboardPage(){

    const [loading, setLoading] = useState(true);

    const [currentUsers, setUsers] = useState({});

    //Make sure this is always pointing towards the next state of users.
    const [nextUsers, setNextUsers] = useState({empty:true});

    const [currWindow, setCurrWindow] = useState(0);
    const [direction, setDirection] = useState(true) // true -> forward. false -> backward

    useEffect(() => {
        setLoading(true)
        if(currWindow == 0){
            getUsers(currWindow, MAX_RECORDS_PER_PAGE).then(users => {
                setUsers(users);
                setLoading(false)
            });
            getUsers(currWindow + 1, MAX_RECORDS_PER_PAGE).then(users=>{
                console.log("NEXT USERS")
                console.log(users);
                setNextUsers(users);
            })
        }else if(direction){
          
            
            setUsers(nextUsers);
            setLoading(false);
            if(currWindow * MAX_RECORDS_PER_PAGE > MAX_LEADERBOARD_USERS){
                setNextUsers({empty:true});
            }else{
                getUsers(currWindow + 1, MAX_RECORDS_PER_PAGE).then(users=>{
                    setNextUsers(users);
                })
            }
        }else{

            //Going backwards
            getUsers(currWindow, MAX_RECORDS_PER_PAGE).then(users => {
                setUsers(users);
                setLoading(false)
            });
            getUsers(currWindow + 1, MAX_RECORDS_PER_PAGE).then(users=>{
                console.log("NEXT USERS")
                console.log(users);
                setNextUsers(users);
            })

        }
            
    }

    , [currWindow])


    return <>
    <NavigationBar />

    <div>
        {!loading && currentUsers.users.map(user => {
            return <LeaderboardCard key= {user._id} user={user} />
        })}
    </div>

    {currWindow != 0 && <button onClick={(e) => {
        setDirection(false);
        setCurrWindow(currWindow - 1);
    }}> Previous </button>}
    {!nextUsers.empty && <button onClick = {(e) => {
        setDirection(true);
        setCurrWindow(currWindow + 1);
    }}> Next </button>}
    </>

}