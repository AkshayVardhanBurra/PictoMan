import { Outlet } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import CountdownTimer from "../components/Timer";
import { useEffect } from "react";
import { clearHeartBeat } from "./GamePageLogic";

export default function AuthPage(){
    useEffect(() => {
            clearHeartBeat();
        }, [])
    return  <>
    <NavigationBar />
    <CountdownTimer />
    <Outlet />
    </>
}