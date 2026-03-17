const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(DB, {
    dbName: process.env.DATABASE_NAME,
  })
  .then(() => {
    console.log('DB connected successfully');
  });

const app = require('./app');

const port = process.env.port || 3000;
app.listen(port, () => {
  console.log(`App running on ${port} port...`);
});
