require("dotenv").config();
const express = require("express");
const path = require("path");
const logger = require("morgan");
const http = require("http");
const routes = require("./routes/index");

const app = express();
const server = http.Server(app);

// load and attach socket.io to http server
const socketio = require('socket.io');
app.set("io", socketio);


// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.static(path.join(__dirname, "public")));

/********** ROUTERS/CONTROLLERS **********/
app.use("/", routes);

/********** LISTENER **********/
app.listen(process.env.PORT, () => {
    console.log('Server is listening on port 3000.');
});

module.exports = app;