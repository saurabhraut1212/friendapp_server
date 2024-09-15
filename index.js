import express from "express";
import cors from "cors";
import "dotenv/config";

import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";

const app = express();

connectDB();

app.use(express.json());
app.use(cors());


app.get("/", (req, res) => {
    res.send("Server started")
})

app.use("/auth", userRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})