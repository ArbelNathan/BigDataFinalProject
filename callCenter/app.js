var mysql = require("mysql2");
const fs = require("fs");
const { get } = require("http");
var conn = mysql.createConnection({
  host: "localhost", // Replace with your host name
  user: "root", // Replace with your database username
  password: "root", // Replace with your database password
  database: "test", // // Replace with your database Name
  port: "3306",
});
conn.connect(function (err) {
  if (err) throw err;
  console.log("Database is connected successfully !");
});
const express = require("express");
const app = express();
var server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = 3000;

//------------ kafka------------
const kafka = require("./kafkaProduce");
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//------------

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => res.send("<a href='/send'>Send</a>"));
app.get("/send", (req, res) => res.render("sender"));
app.get("/sendData", async (req, res) => {
  conn.query(`SELECT * FROM calls`, function (err, result) {
    if (err) {
      throw err;
    }
    return res.send(result[Math.floor(Math.random() * result.length)]);
  });
});

//------------ Socket.io ----------------
io.on("connection", (socket) => {
  console.log("new user connected");
  socket.on("totalWaitingCalls", (msg) => {
    console.log(msg.totalWaiting);
  });
  socket.on("callDetails", (msg) => {
    console.log(msg);
    kafka.publish(msg);
  });
});

//------------------- kafka -----------
/* Kafka Producer Configuration */

//
//const client1 = new kafka.KafkaClient({kafkaHost: "localhost:9092"});

//------------------------------------

server.listen(port, () =>
  console.log(`Ariel app listening at http://localhost:${port}/send`)
);
