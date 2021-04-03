require('dotenv').config()
const helmet = require('helmet')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const express = require('express')
const app = express()
var cors = require('cors')

var whitelist = ['http://example1.com', 'http://example2.com']
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}
 
const consulta = require('./controller/consulta_extracto');
const procesar = require('./controller/procesar');
const anular = require('./controller/anular');

// log definition
app.use(morgan('combined'));
app.use(bodyParser.json())
app.use(helmet())

app.post('/WSBancard/service', cors(corsOptionsDelegate), (req, res) => consulta.consulta(req, res));

app.post('/WSBancard/procesar', cors(corsOptionsDelegate), (req, res) => procesar.procesarPago(req, res));

app.post('/WSBancard/anular', cors(corsOptionsDelegate), (req, res) => anular.anularPago(req, res));

app.listen(process.env.PORT, () => {
  console.log(`Electromax is listening at http://localhost:${process.env.PORT}`)
});