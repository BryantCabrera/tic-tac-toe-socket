var io = require("socket.io")();

io.on('connection', function (socket) {
    socket.on('move', function (data) {
        io.emit('move', data);
    });
});

module.exports = io;