import { Outlet } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import CountdownTimer from "../components/Timer";

export default function AuthPage(){

    return  <>
    <NavigationBar />
    <CountdownTimer />
    <Outlet />
    </>
}