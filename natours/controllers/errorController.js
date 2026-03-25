const AppError = require('../utils/appError');

const handleCastErrorDB = (error) => {
  const errorMessage = `Invalid ${error.path}: ${error.value}`;
  return new AppError(errorMessage, 400);
};

const handleDuplicateFieldsDB = (error) => {
  const value = error.keyValue.name;
  const errorMessage = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(errorMessage, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // ¨Programming or other unknown error: don't leak error details
  } else {
    // Log error
    console.error('ERROR', err);

    // Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

module.exports = (err, _req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // This copies all the properties of the err object and its prototypes
    let error = Object.create(err);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    sendErrorProd(error, res);
  }
};
