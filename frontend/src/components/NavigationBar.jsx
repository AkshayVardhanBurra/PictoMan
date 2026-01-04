
import styles from "./NavigationBar.module.css"


function NavigationBar(){
    return <>
    <nav className={styles.navBar}>
        <h1 className = {styles.logo}>PictoMan</h1>
        <div className = {styles.mover}>
            <ul className = {styles.navList}>
                
                <li className = {styles.navItem}> Home</li>
                <li className = {styles.navItem}> How To Play</li>
                <li className = {styles.navItem}> Login/Sign Up </li>
            </ul>
        </div>
    </nav>
    </>
}

export default NavigationBar;