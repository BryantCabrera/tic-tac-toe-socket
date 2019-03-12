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

/********** LISTENER **********/
server.listen(process.env.PORT, () => {
    console.log('Server is listening on port 3000.');
});

module.exports = server;