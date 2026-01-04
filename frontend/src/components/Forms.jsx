
import { Link, useNavigate, useLocation } from "react-router-dom";
import styles from "../pages/login.module.css";
import { useContext, useState } from "react";
import { useEffect } from "react";
import { UserAuthContext } from "../contexts/AuthContext";

//returns true -> strong password or false -> weak password
function checkPasswordStrength(password){
    
    if(password.length < 7){
        return false
    }else{
        
        //checking if there are numbers
        let numberExists = false
        let specialCharacterExists = false;
        for(const ch of password){

            if(ch == ' '){
                return false
            }
            if(ch >= '0' && ch <= '9'){
                numberExists = true
            } if(!(ch >= 'A' && ch <= 'Z') && // A-Z
        !(ch >= 'a' && ch <= 'z') && // a-z
        !(ch >= '0' && ch <= '9')){
                specialCharacterExists = true;
            }
        }

        return numberExists && specialCharacterExists;

       

        
    }
}

async function checkUserExists(username){
    try{
        const userPromise = await fetch(`http://localhost:5050/auth/checkusername?username=${username}`)
        if(userPromise.ok){
            const userData = await userPromise.json()
            return userData.exists
        }else{
            return false
        }
        

    }catch(error){
        return false
    }
}

async function signUpUser(username, password){
    
    try{
        let p = await fetch("http://localhost:5050/auth/createaccount", {
            method:'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body:JSON.stringify({username:username, password:password})
        })

        let jsonData = await p.json();

        return jsonData;

        
    }catch(error){
        return ""
    }
}

function validUserName(username){
    return !username.includes(" ")
}
export function LoginForm() {
    
    const location = useLocation()
    const data = location.state;
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const authContext = useContext(UserAuthContext)
    const navigate = useNavigate();

    if(Object.hasOwn(data, 'username')){
        console.log(data)
        setUsername(data.username)
        location.state = {}
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if(username != "" && password.trim() != ""){
            //call login post request api 
            fetch("http://localhost:5050/auth/login", {
            method:'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body:JSON.stringify({username:username, password:password})
        }).then(pResp => {
            if(pResp.ok){
                return pResp.json()
            }else{
                setUsername("")
                setPassword("")
                alert("Wrong Password or Username!")
                return null
            }
        }).then(jsonResponse => {
            if(jsonResponse){
                authContext.setUsername(jsonResponse.username)
                authContext.setGamesWon(jsonResponse.games_won)
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

export function SignUpForm(){

        const [username, setUsername] = useState("");
        const [password, setPassword] = useState("");
        const [userExists, setUserExists] = useState(false);
        const [strongPassword, setStrongPassword] = useState(false);
        const [cpassword, setCPassword] = useState("");
        const navigate = useNavigate();
        console.log(username)

        useEffect(() => {
            console.log("in here!")
            checkUserExists(username).then(exists => {
                setUserExists(exists)
            });
        }, [username])

        useEffect(() => {
            setStrongPassword(checkPasswordStrength(password))
        }, [password])

        const handleSubmit = (e) => {
            e.preventDefault();

            

            if(password == cpassword && validUserName(username) && !userExists && strongPassword){
                

                signUpUser(username, password).then(result => {
                    navigate("/auth/login", {state: {_id: result._id, username:result.username}})
                })

            }
            
        };

        return <>
            <div className={styles["login-container"]}>
                <h1>Sign Up</h1>
                <form onSubmit={handleSubmit}>
                    
                    <div className={styles["form-group"]}>
                        <label htmlFor="username">Username:</label>
                        <input 
                            type="text" 
                            id="username" 
                            name="username" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value.trim())}
                            required 
                        />
                        {}
                        {userExists && <p style={{color: 'red'}}>Username already exists</p>}
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
                        {!strongPassword && <p style={{color: 'red'}}> Enter a strong password! Include numbers 0-9, and special characters. Length has to be 7 or more. No Spaces!</p>}
                    </div>

                    <div className={styles["form-group"]}>
                        <label htmlFor="cpassword"> Confirm Password:</label>
                        <input 
                            type="password" 
                            id="cpassword" 
                            name="cpassword" 
                            value={cpassword}
                            onChange={(e) => setCPassword(e.target.value.trim())}
                            required 
                        />
                        {password != cpassword && <p style={{color: 'red'}}> Passwords have to match! </p>}
                    </div>
                    <button type="submit">Sign Up</button>
                </form>
            </div>

            <p className={styles.createOrLogin}>
                Already Have An Account? <Link to="/auth/login"> Log In. </Link>
            </p>
        </>
}


