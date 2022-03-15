// this is a "front controller"
const express = require('express');
const app = express();
const mongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser')
require('dotenv/config');

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

// Import Routes
const postsRoute = require('./routes/mongoApi');
const KafkaConsumer = require('./module/kafkaConsume.js')

app.use('/posts', postsRoute);
app.use(express.static('public'))

//ROUTES
app.get('/', (req, res) => {
    var prod ={product: 3};
    res.render("pages/show", prod)
})

//Kafka consumer Routs
KafkaConsumer.on("data", function(m) {
  console.log(m.value.toString());
 });
KafkaConsumer.connect();

// connect To DB
mongoClient.connect(process.env.DB_CONNECTION, () =>
    console.log('connected to DB'))

//HOW DO WE START LISTENING
app.listen(3001);