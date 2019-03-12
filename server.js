var express = require("express");
var path = require("path");
var logger = require("morgan");

var routes = require("./routes/index");

var app = express();
var server = http.createServer(app);

// load and attach socket.io to http server
var io = require('../io');
io.attach(server);


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