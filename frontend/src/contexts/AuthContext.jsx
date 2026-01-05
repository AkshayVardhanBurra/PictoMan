import { createContext, useState } from "react";

export const UserAuthContext = createContext();



export function UserAuthFunction({children}){
   
    const [username, setUserName] = useState("");
    const [gamesWon, setGamesWon] = useState(0);



    return <>

        <UserAuthContext.Provider value={{username:username, gamesWon:gamesWon, setUsername:setUserName, setGamesWon: setGamesWon}}>
            {children}
        </UserAuthContext.Provider>
    </>


    
}
