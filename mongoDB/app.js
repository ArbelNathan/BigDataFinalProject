// this is a "front controller"
const express = require('express');
const app = express();
const mongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser')
var server = require('http').createServer(app);
const io = require("socket.io")(server)
require('dotenv/config');
var AsyncLock = require('async-lock');
const fs = require('fs');
const port = 3001

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Import Routes
const postsRoute = require('./routes/mongoApi');
const KafkaConsumer = require('./module/kafkaConsume.js')
const bigMlIntegration = require('./module/bigMlIntegration');
var lock = new AsyncLock();

// ROUTES
app.get('/', (req, res) => {
  res.render("pages/prediction")
})

//Kafka consumer Routs
KafkaConsumer.on("data", function (m) {
  console.log(m.value.toString());
});
KafkaConsumer.connect();

// connect To DB
mongoClient.connect(process.env.DB_CONNECTION, () =>
  console.log('connected to DB'))

io.on("connection", (socket) => {
  console.log("new user connected");
  socket.on("createModel", () => {
    postsRoute.publish(lock);
    bigMlIntegration.createModelFromCSV(lock);
  });
  socket.on("predict", (msg) => {
    console.log(msg);
    bigMlIntegration.createPredictionFromModel(msg, lock)
    lock.acquire('bigml', function (done) {
      console.log("newdata")
      fs.readFile('./data/prediction.json', 'utf-8', (err, data) => {
        if (err) {
          throw err;
        }
        const prediction = JSON.parse(data.toString());
        io.emit('newdata', prediction.prediction);
        done()
      });
    });
  });
});

//HOW DO WE START LISTENING
server.listen(port, () => console.log(`listening at http://localhost:${port}`));

