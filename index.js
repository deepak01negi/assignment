const express = require('express');
const app = express();
//const createConnection = require('./server');
const config = require('./config.json');

//createConnection();
app.use('/api/firstAPI', require('./src/api.controller'));

// start server
//add port in CONFIG FILE AND REMOVE CONNECCTION FROM HERE
const port = config.port;
app.listen(port, () => console.log('Server listening on port ' + port));
