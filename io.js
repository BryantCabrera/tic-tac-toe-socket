const io = require("socket.io")();

const connectCounter = 0;

io.on('connection', function (socket) {
    socket.on('connect', function () {
        connectCounter++;
    });

    socket.on('new-game', function () {
        io.emit('new-game');
    });

    socket.on("move", function (data) {
      io.emit("move", data);
    });

    socket.on("disconnect", function () {
      connectCounter--;
    });
});

module.exports = io;