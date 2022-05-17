require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const reportingService = require('./services/Reporting')

const app = express();
// Middlewares
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
// Authentication and Services Routes (URLs Checks, Reports)
app.use('/auth', authRoutes);
app.use('/service', serviceRoutes);
// Error Handling Middleware
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({message: message, data: data});
});
// Database Connection
mongoose
    .connect(
        process.env.DATABASE, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
    .then(result => {
        app.listen(process.env.PORT || 8080);
    })
    .catch(err => console.log(err));
reportingService.startMonitoring();
