// https://www.cloudkarafka.com/ הפעלת קפקא במסגרת ספק זה

const uuid = require("uuid");
const Kafka = require("node-rdkafka");

const kafkaConf = {
  "group.id": "cloudkarafka",
  "metadata.broker.list":
    "tricycle-01.srvs.cloudkafka.com:9094,tricycle-02.srvs.cloudkafka.com:9094,tricycle-03.srvs.cloudkafka.com:9094".split(
      ","
    ),
  "socket.keepalive.enable": true,
  // "security.protocol": "SASL_SSL",
  "sasl.mechanisms": "SCRAM-SHA-256",
  "sasl.username": "bo4lxb97",
  "sasl.password": "LxAJNWji_ew_dvGIVejulDFaBoMb-yM6",
  debug: "generic,broker,security",
};

const prefix = "bo4lxb97-";
const topic = `${prefix}default`;
const producer = new Kafka.Producer(kafkaConf);

const genMessage = (m) => new Buffer.alloc(m.length, m);

producer.on("ready", function (arg) {
  console.log(`producer Ariel is ready.`);
});
producer.connect();

module.exports.publish = function (msg) {
  m = JSON.stringify(msg);
  producer.produce(topic, -1, genMessage(m), uuid.v4());
  //producer.disconnect();
};
