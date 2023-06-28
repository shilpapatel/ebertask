require('./config/config');
require('./db/db');
require('./model/admin.model')

const socketio = require('socket.io');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const configureSocket = require('./socket.js');
const cors = require('cors');

var app = express();
const server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false,}),)

const adminRoutes = require('./routes/admin.router');
const vehicletypeRoutes = require('./routes/vehicletype.router');
const countryRoutes = require('./routes/country.router');
const cityRoutes = require('./routes/city.router');
const usersRoutes = require('./routes/users.router');
const vehiclepricingRoutes = require('./routes/vehiclepricing.router');
const listRoutes = require('./routes/list.router');
const createrideRoutes = require('./routes/createride.router')
const settingsRoutes = require('./routes/settings.router')
const confirmridesRoutes = require('./routes/confirmrides.router')
const runningrequestRoutes = require('./routes/runningrequest.router')

app.use('/api', adminRoutes);
app.use('/api', vehicletypeRoutes);
app.use('/api', countryRoutes);
app.use('/api', usersRoutes);
app.use('/api', cityRoutes);
app.use('/api', vehiclepricingRoutes);
app.use('/api', listRoutes);
app.use('/api', createrideRoutes);
app.use('/api', settingsRoutes);
app.use('/api', confirmridesRoutes);
app.use('/api', runningrequestRoutes);
app.use('/public', express.static('public'))
app.get('/favicon.ico', (req, res) => res.status(204))
const io = socketio(server,{
    cors:{
        origin:["http://localhost:4200"]
    }
});
server.listen(process.env.PORT, () => console.log(`Server started at port : ${process.env.PORT}`));
configureSocket(io);