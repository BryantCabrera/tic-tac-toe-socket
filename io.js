const io = require("socket.io")();

const connectCounter = 0;
let rooms = 0;

io.on('connection', function (socket) {
    // socket.on('connect', function () {
    //     connectCounter++;
    // });

    socket.on('new-game', function () {
        io.emit('new-game');
    });

    socket.on("move", function (data) {
      io.emit("move", data);
    });

    // socket.on("disconnect", function () {
    //   connectCounter--;
    // });

    // Creates a new game room and notify the creator of game. 
    socket.on('createGame', function (data) {
        socket.join('room-' + ++rooms);
        console.log(rooms, ' this is rooms');
        io.emit('newGame', { name: data.name, room: 'room-' + rooms });
    });

    // //Connects Player 2 to the room he/she requested. Show serror if room full.
    // socket.on('joinGame', function (data) {
    //    const room = io.nsps['/'].adapter.rooms[data.room];
    //     if (room && room.length == 1) {
    //         socket.join(data.room);
    //         socket.broadcast.to(data.room).emit('player1', {});
    //         socket.emit('player2', { name: data.name, room: data.room })
    //     }
    //     else {
    //         socket.emit('err', { message: 'Sorry, The room is full!' });
    //     }
    // });

    // //Handle the turn played by either player and notify the other.
    // socket.on('playTurn', function (data) {
    //     socket.broadcast.to(data.room).emit('turnPlayed', {
    //         tile: data.tile,
    //         room: data.room
    //     });
    // });

    // //Notifys the players about the victor.
    // socket.on('gameEnded', function (data) {
    //     socket.broadcast.to(data.room).emit('gameEnd', data);
    // });
});

module.exports = io;