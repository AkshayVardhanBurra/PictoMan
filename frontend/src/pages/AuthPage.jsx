import { Outlet } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";

export default function AuthPage(){

    return  <>
    <NavigationBar />
    <Outlet />
    </>
}