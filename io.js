var io = require("socket.io")();

io.on('connection', function (socket) {
    socket.on('move', function (data) {
        io.emit('move', data);
    });

    socket.on('new-game', function () {
        io.emit('new-game');
    })
});

module.exports = io;