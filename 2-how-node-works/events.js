const EventEmitter = require('node:events');
const http = require('http');

class Sales extends EventEmitter {
  constructor() {
    super();
  }
}

const myEmitter = new Sales();

myEmitter.on('newSale', () => {
  console.log('There was a new sale!');
});

myEmitter.on('newSale', () => {
  console.log('Costumer name: Jorge');
});

myEmitter.on('newSale', (stock) => {
  console.log(`There are now ${stock} items left in stock.`);
});

// This has to be after the listeners
myEmitter.emit('newSale', 9);

////////////////////////////
const server = http.createServer();

server.on('request', (req, res) => {
  console.log('Request received');
  res.end('Request received');
});

// server.on('request', (req, res) => {
//   res.end('Another Request');
// });

server.on('close', () => {
  console.log('Server closed');
});

server.listen(8000, 'localhost', () => {
  console.log('Waiting for requests...');
});
