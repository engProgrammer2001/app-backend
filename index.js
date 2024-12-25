import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from 'body-parser';
import path from "path";
import { fileURLToPath } from 'url';
import dbConnection from "./config/dbConfig.js";
import AdminRoutes from "./routes/AdminRoutes.js"
import UserRoutes from "./routes/UserRoutes.js"
import "./config/IncomeCron.js"

dotenv.config();

dbConnection();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);





const app = express();
app.use(express.json());


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());


app.use("", express.static(path.join(__dirname, "")));

app.use("/api/admin", AdminRoutes)
app.use("/api/user", UserRoutes)


app.get("/", (req, res) => {
    res.sendFile(__dirname + '/src/view/index.html');
})


const port = process.env.PORT || 3000;




app.listen(port, () => {
    console.log(`server is running on ${port}`);
});


