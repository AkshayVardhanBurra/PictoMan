import {useState, useEffect} from "react";
import { Link } from "react-router-dom";
import API_URL from "../api_url";


const SEARCH_RESULTS_LIMIT = 6;
//returns json data of all the results based on starts with
async function getUserResults(startsWith){
    const fetchPromise = await fetch(`${API_URL}api/searchUsers?startsWith=${startsWith.trim()}&limit=${SEARCH_RESULTS_LIMIT}`);

    if(!fetchPromise.ok){
        return null;
    }else{
        const usersJson = await fetchPromise.json();

        return usersJson;
    }
}


function UserSearchBar(){
    const [userInput, setUserInput] = useState("");
    const [users, setUsers] = useState([]);
    const [exactUser, setExactUser] = useState(null);
    useEffect(() => {
        if(userInput.length > 0) {
            getUserResults(userInput).then(userJson => {
                if(userJson != null){
                setUsers(userJson.searchResults);
                setExactUser(userJson.exactUser)
                }else{
                    setUsers([]);
                    setExactUser(null);
                }
            })
        }else{
            setUsers([]);
            setExactUser(null);
        }
    }, [userInput])

    return <>
        <input type="text" value={userInput} onChange={(e) => {setUserInput(e.target.value)}}/>
        {
            userInput.trim().length > 0 && <UserSearchResults users={users} exactUser={exactUser} />
        }
        
    </>
}

function UserSearchResults({users, exactUser}){
    console.log(users);
    
    return <>
    <div>
        {
            exactUser != null && <><Link key={exactUser._id} to={"/users/" + exactUser.username}> {exactUser.username} </Link> <br></br></>
        }
        {
            users.length > 0 && users.map(user => {
                if(exactUser != null && user._id == exactUser._id){
                    return;
                }else{
                    return <><Link key={user._id} to={"/users/" + user.username}> {user.username}  </Link> <br></br></>
                }
            })
        }
        {users.length == 0 && <p> No users found! </p>}

        </div>
    </>


}

export default UserSearchBar;

//Create the search bar UI
//when the bar isn't empty, query the backend and show the bottom rectangle dialog with users
//each user is a link that will point to a user page.
//when the bar is empty, don't show the bottom rectangle dialog.