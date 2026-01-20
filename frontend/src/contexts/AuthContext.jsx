import { createContext, useState } from "react";

export const UserAuthContext = createContext();



export function UserAuthFunction({children}){
   
    const [username, setUserName] = useState("");
    const [gamesWon, setGamesWon] = useState(0);
    const [_id, setId] = useState("");



    return <>

        <UserAuthContext.Provider value={{_id: _id, username:username, gamesWon:gamesWon, setUsername:setUserName, setGamesWon: setGamesWon, setId:setId}}>
            {children}
        </UserAuthContext.Provider>
    </>


    
}
