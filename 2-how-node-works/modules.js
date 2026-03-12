// console.log(arguments);
// console.log(require('module').wrapper);

// module.exports
const C = require('./test-module-1');
const calc1 = new C()
console.log(calc1.multiply(5, 4))
console.log(calc1.add(5, 4))

// exports
// const calc2 = require('./test-module-2');
const { multiply, divide } = require('./test-module-2');
console.log(multiply(5, 4))
console.log(divide(10, 4))

// caching
require('./test-module-3')()
require('./test-module-3')()
require('./test-module-3')()