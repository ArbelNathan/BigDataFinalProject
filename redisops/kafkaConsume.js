// https://www.cloudkarafka.com/ הפעלת קפקא במסגרת ספק זה

const uuid = require("uuid");
const Kafka = require("node-rdkafka");
const { MongoBulkWriteError, MongoClient } = require("mongodb");
//11/7
var server = require('http').createServer(Kafka.KafkaConsume);
const io = require("socket.io")(server)

const kafkaConf = {
  "group.id": "cloudkarafka-example",
  "metadata.broker.list": "dory-01.srvs.cloudkafka.com:9094,dory-02.srvs.cloudkafka.com:9094,dory-03.srvs.cloudkafka.com:9094".split(","),
  "socket.keepalive.enable": true,
  "security.protocol": "SASL_SSL",
  "sasl.mechanisms": "SCRAM-SHA-256",
  "sasl.username": "ixylgbeh",
  "sasl.password": "N-a_kLcPk1vTSfMqyBEN8gVmPg4XFwid",
  "debug": "generic,broker,security"
};

const prefix = "ixylgbeh-";
const topic = `${prefix}new`;
const producer = new Kafka.Producer(kafkaConf);

const genMessage = m => new Buffer.alloc(m.length,m);
//const prefix = process.env.CLOUDKARAFKA_USERNAME;

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

var AsyncLock = require('async-lock');
var lock = new AsyncLock();

function operation(id,m) {  //lock code- for Sync
  lock.acquire(id, function(done) {
      console.log(id + " Running operation")
      setTimeout(function() { 
      const DbHelper = require ('../mongo/Mongo'); // import all file and name it DbHelper
      check(m.value.toString());  //we send the message to mongo db

      var redis = require('../redis/RedisForArielSender')
      sendredis(m.value.toString());
          done();
      }, 3000)
  }, function(err, ret) {
  }, {});
}


consumer.on("data", function(m) {
  operation('key1',m)

 
});


consumer.on("disconnected", function(arg) {
  process.exit();
});
consumer.on('event.error', function(err) {
  console.error(err);
  process.exit(1);
});
// consumer.on('event.log', function(log) {
//   console.log(log);
// });
consumer.connect();