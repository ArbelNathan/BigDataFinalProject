// https://www.cloudkarafka.com/ הפעלת קפקא במסגרת ספק זה
var MongoClient = require('mongodb').MongoClient;
const Kafka = require("node-rdkafka");

const kafkaConf = {
  "group.id": "cloudkarafka-example",
  "metadata.broker.list": "tricycle-01.srvs.cloudkafka.com:9094,tricycle-02.srvs.cloudkafka.com:9094,tricycle-03.srvs.cloudkafka.com:9094".split(","),
  "socket.keepalive.enable": true,
  "security.protocol": "SASL_SSL",
  "sasl.mechanisms": "SCRAM-SHA-256",
  "sasl.username": "bo4lxb97",
  "sasl.password": "LxAJNWji_ew_dvGIVejulDFaBoMb-yM6",
  "debug": "generic,broker,security"
};

const prefix = "bo4lxb97-";
const topic = `${prefix}default`;

const topics = [topic];
const consumer = new Kafka.KafkaConsumer(kafkaConf, {
  "auto.offset.reset": "beginning"
});

consumer.on("error", function(err) {
  console.error(err);
});
consumer.on("ready", function(arg) {
  console.log(`Consumer ${arg.name} ready`);
  consumer.subscribe(topics);
  consumer.consume();
});

consumer.on("data", function(m) {
  MongoClient.connect(process.env.DB_CONNECTION, function (err, db) {
      if (err) throw err;
      var dbo = db.db("rest");
      var myobj = JSON.parse(m.value.toString());
      console.log(myobj)
      dbo.collection("posts").insertOne(myobj, function (err, response) {
          if (err) throw err;
          console.log("1 document inserted");
          db.close();
          console.log(response);
      });
  });
});
consumer.on("disconnected", function(arg) {
  process.exit();
});
consumer.on('event.error', function(err) {
  console.error(err);
  process.exit(1);
});
consumer.on('event.log', function(log) {});

module.exports = consumer;
