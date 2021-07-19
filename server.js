const express = require('express');
const app = express();
const config = require('./config.js');
var bodyParser = require('body-parser')
var soap = require('soap');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());

app.listen(8080)

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
