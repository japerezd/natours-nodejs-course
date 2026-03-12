const express = require('express');
const morgan = require('morgan');

const userRoutes = require('./routes/userRoutes');
const tourRoutes = require('./routes/tourRoutes');

const app = express();
// 1. Middlewares
app.use(morgan('dev'));
app.use(express.json());

app.use((req, res, next) => {
  console.log('Hell from the middleware 👋🏽');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2. Routes
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);

// 4. Start server
module.exports = app;
