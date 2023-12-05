const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose')
const { createsocket } = require("./crashGameControllers/crashGameEngine.js");
const seApp = require("./crashGameControllers/crashGameEngineSE");
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
const server = createServer(app)

async function main() {
  createsocket(server);
}
main()

app.get("/", (req, res)=>{
  res.send("Welcome to dotplayplay Live server")
})
app.use("/", seApp);
mongoose.set('strictQuery', false);
const dbUri = `mongodb://localhost:27017/dpp`
// const dbUri = `mongodb+srv://valiantjoe:jspW8bJDiu5lnvc4@highscore.muku4gg.mongodb.net/dotplayplay?retryWrites=true&w=majority`
mongoose.connect(dbUri, { useNewUrlParser: true,  useUnifiedTopology: true })
    .then((result)=>  console.log('Database connected'))
  .catch((err) => console.log(err))
const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=>{
    console.log("Running on port "+ PORT)
})
