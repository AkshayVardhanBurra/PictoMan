import express from "express";
import cors from "cors";
import { connectDB } from "./db.js"; //when referring to your own files, always use ".js" at the end.
import router from "./routes/auth.route.js";
import {router as userDataRouter} from "./routes/userdata.route.js";
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser";
const app = express();


//Use cors to let this be used as an api by the front end.



app.use(express.json());
app.use(cors({
    origin:'https://pictoman.netlify.app',
    credentials:true
}));
app.use(cookieParser());

app.use("/auth", router);
app.use("/api", userDataRouter);



const PORT = process.env.PORT || 10000; // Render uses 10000 by default

app.listen(PORT, '0.0.0.0', () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
})

