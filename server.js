require("dotenv").config();
const express = require("express");
const path = require("path");
const logger = require("morgan");
const http = require("http");

const app = express();
const debug = require("debug")("realtime-socket-io:server");
const server = http.Server(app);
const io = require('./io');
io.attach(server);

// load and attach socket.io to http server
// const socketio = require('socket.io');


// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.static(path.join(__dirname, "public")));

// Connects sockets to the server and adds them to the request 
// app.set("io", socketio);
/********** ROUTERS/CONTROLLERS **********/
const routes = require("./routes/index");
app.use("/", routes);

/********** SOCKET **********/
// io.on('connection', function (socket) {
//     // Creates a new game room and notify the creator of game. 
//     socket.on('createGame', function (data) {
//         socket.join('room-' + ++rooms);
//         socket.emit('newGame', { name: data.name, room: 'room-' + rooms });
//     });

//     //Connects Player 2 to the room he/she requested. Show serror if room full.
//     socket.on('joinGame', function (data) {
//         var room = io.nsps['/'].adapter.rooms[data.room];
//         if (room && room.length == 1) {
//             socket.join(data.room);
//             socket.broadcast.to(data.room).emit('player1', {});
//             socket.emit('player2', { name: data.name, room: data.room })
//         }
//         else {
//             socket.emit('err', { message: 'Sorry, The room is full!' });
//         }
//     });

//     //Handle the turn played by either player and notify the other.
//     socket.on('playTurn', function (data) {
//         socket.broadcast.to(data.room).emit('turnPlayed', {
//             tile: data.tile,
//             room: data.room
//         });
//     });

//     //Notifys the players about the victor.
//     socket.on('gameEnded', function (data) {
//         socket.broadcast.to(data.room).emit('gameEnd', data);
//     });
// });

/********** LISTENER **********/
server.listen(process.env.PORT, () => {
    console.log('Server is listening on port 3000.');
});

module.exports = server;