import express from "express";
import cors from "cors";
import { connectDB } from "./db.js"; //when referring to your own files, always use ".js" at the end.
import router from "./routes/auth.route.js";
const PORT = process.env.PORT || 5050;
const app = express();

//Use cors to let this be used as an api by the front end.
app.use(cors());


app.use(express.json());
app.use("/auth", router);


app.listen(PORT, () => {
    connectDB();
    console.log(`Server listening on port ${PORT}`);
})

