const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose')
const { createsocket } = require("./crashGameControllers/crashGameEngine.js");
require("dotenv").config();
require("./crashGameControllers/genarateHash")
require("./crashGameControllers/generate-seed")
// ========================= socket =============
const { createServer } = require("node:http");
// ============ Initilize the app ========================

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
const server = createServer(app);

async function main() {
  createsocket(server);
}
main();

app.get("/", (req, res)=>{
  res.send("Welcome to dotplayplay Live server")
})

// connect database
// const dbUri = `mongodb://localhost:27017/wager`
const dbUri = `mongodb+srv://valiantjoe:jspW8bJDiu5lnvc4@highscore.muku4gg.mongodb.net/wager?retryWrites=true&w=majority`
mongoose.connect(dbUri, { useNewUrlParser: true,  useUnifiedTopology: true })
    .then((result)=>  console.log('Database connected'))
    .catch((err)=> console.log(err))
server.listen(process.env.PORT, ()=>{
    console.log("Running on port "+ process.env.PORT)
})