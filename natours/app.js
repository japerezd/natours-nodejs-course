const express = require('express');
const morgan = require('morgan');

const userRoutes = require('./routes/userRoutes');
const tourRoutes = require('./routes/tourRoutes');

const app = express();
// 1. Middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

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

// all -> GET, POST, DELETE, PUT
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// 4. Start server
module.exports = app;
