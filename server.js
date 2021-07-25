const express = require('express');
const app = express();
const config = require('./config.js');
var bodyParser = require('body-parser')
var soap = require('soap');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());

app.listen(8080)

const redis = require('redis');
const client = redis.createClient({
  host: config.redisUrl,
  port: 6379,
});

client.on('error', err => {
  console.log('error: ' + err);
});

client.set('foo', 'bar', (err, reply) => {
  if (err) throw err;
  console.log(reply);

  client.get('foo', (err, reply) => {
    if (err) throw err;
    console.log(reply);
  });
});

app.get('/getList', (req, res) => {
  console.log("loading list of dictionaries " + req.params.dictId);
  client.sort('dicts', "ALPHA", (err, reply) => {
    if (err) throw err;
    console.log("reply: " + reply);
    return res.json({dictionaries: reply});
  });
});

app.get('/load/:dictId', (req, res) => {
  const key = 'dicts:' + req.params.dictId;
  console.log("loading " + req.params.dictId);
  client.get(key, (err, reply) => {
    if (err) throw err;
    console.log("reply: " + reply);
    return res.json(reply);
  });
});

app.post('/save', (req, res) => { 
  console.log("saving dictionary");
  console.log(req.body);
  client.sadd("dicts", req.body.id, (err, reply) => {
    if (err) throw err;
    console.log("adding dictionary to dicts set: " + reply);

    client.set("dicts:" + req.body.id, req.body.environment, (err, reply) =>  {
      if (err) throw err;
      console.log("setting dicts:" + req.body.id + " => " + reply);
    })
  });
});

app.post('/step', (req, res) => { 
  soap.createClient(config.wsdlUrl, function(err, soapClient){
    if(err) {
      console.log(err);
      return res.status(500).json(err)
    } else {
      const foo = soapClient.EvalStep({'jsonEnvironment': JSON.stringify(req.body)}, (err, result) => {
        return res.json(result);
      });
    }
  });
});
