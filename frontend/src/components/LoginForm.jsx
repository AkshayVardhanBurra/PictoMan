import {useState, useContext} from "react";
import { useLocation, Link} from "react-router-dom";
import { UserAuthContext } from "../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import styles from "../pages/login.module.css";
import API_URL from "../api_url.js";

export function LoginForm() {
    
    const location = useLocation()
    const data = location.state;
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const authContext = useContext(UserAuthContext)
    const navigate = useNavigate();

    if(location.state && Object.hasOwn(data, 'username')){
        console.log(data)
        setUsername(data.username)
        location.state = {}
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if(username != "" && password.trim() != ""){
            //call login post request api 
            fetch(API_URL + "auth/login", {
            method:'POST',
            headers: {
                'Content-Type':'application/json'
            },
            credentials: "include",
            body:JSON.stringify({username:username, password:password})
        }).then(pResp => {
            if(pResp.ok){
                return pResp.json()//At this point, the cookie is saved to the device.
            }else{
                setUsername("")
                setPassword("")
                alert("Wrong Password or Username!")
                return null
            }
        }).then(jsonResponse => {
            if(jsonResponse){
                console.log(jsonResponse);
                authContext.setUsername(jsonResponse.username)
                authContext.setGamesWon(jsonResponse.games_won)
                authContext.setId(jsonResponse._id);
                navigate("/")
            }
        })
        }
    };

    return <>
        <div className={styles["login-container"]}>
            <h1>Log In</h1>
            <form onSubmit={handleSubmit}>
                <div className={styles["form-group"]}>
                    <label htmlFor="username">Username:</label>
                    <input 
                        type="username" 
                        id="username" 
                        name="username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value.trim())}
                        required 
                    />
                </div>
                <div className={styles["form-group"]}>
                    <label htmlFor="password">Password:</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value.trim())}
                        required 
                    />
                </div>
                
                <button type="submit">Log In</button>
            </form>
        </div>

        <p className={styles.createOrLogin}>
            Don't have an account? <Link to="/auth/createaccount"> Create One.</Link>
        </p>
    </>
}