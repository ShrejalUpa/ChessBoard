const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");

const app = express();

const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();
let players = {};
var currentPlayer = "w";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index", {title: "Chess Game"});
});

io.on("connection", function(socket){
    console.log("connected");
    
    
    // Basic to know about the sockets
    // uniquesocket.on("churan", function(){
        //     // console.log("churan received");       eska matlab jab kisi bhi sockect se churan aaye tab ye method chala dena Esame ham bachend se churan bhej rahe hai aur frontend me recieve kar rahe hai
        //     io.emit("churan papadi")      //kyuki hame sabko msg bhejana hai 
        // })
        


    //And this is for discoonect

    // uniquesocket.on("disconnect", function(){
    //     console.log("disconnect")
    // })




    if (!players.white){
        players.white = socket.id;
        socket.emit("playerRole", "w")
    }
    else if (!players.black){
        players.black = socket.id;
        socket.emit("playersRole", "b")
    }
    else {
        socket.emit("spectatorRole");
    }

    socket.on("disconnect", function(){
        if(socket.id === players.white) {
            delete players.white;
        } else if (socket.id === players.black){
            delete players.black;
        }
    });


    socket.on("move", (move)=>{
        try{
            if (chess.turn() === 'w' && socket.id !== players.white) return;
            if (chess.turn() === 'b' && socket.id !== players.black) return;

            const result = chess.move(move);
            if(result){
                currentPlayer = chess.turn();
                io.emit("move", move);
                io.emit("boardState", chess.fen())     //fen hamare chess board ke location batata ki kaun sa pawn kaha hai

            }
            else{
                console.log("Invalid move :", move);
                socket.emit("InvalidMove", move);
            }
        }
        catch(err){
            console.log(err);
            socket.emit("Invalid move :", move);
        }

    })


})

server.listen(3000, function () {
    console.log("Listening on port 3000");
});

