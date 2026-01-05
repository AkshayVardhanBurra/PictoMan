import express from "express";
import cors from "cors";
import { connectDB } from "./db.js"; //when referring to your own files, always use ".js" at the end.
import router from "./routes/auth.route.js";
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser";
const PORT = process.env.PORT || 5050;
const app = express();


//Use cors to let this be used as an api by the front end.



app.use(express.json());
app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}));
app.use(cookieParser());

app.use("/auth", router);


app.listen(PORT, () => {
    connectDB();
    console.log(`Server listening on port ${PORT}`);
})

