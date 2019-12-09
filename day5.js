const readline = require('readline');
const path = require('path');

const intcode = require('./lib/intcode2');

const firstProgram = path.resolve(__dirname, 'day5.program');

const makeAdapter = (inputs = [], prefix) => {
  const iter = inputs[Symbol.iterator]();
  return {
    input: iter,
    output: (v) => console.log(prefix, 'Output:', v),
  }
};

intcode.loadFromFile(firstProgram)
  .then(async (code) => {
    await intcode.run(code, makeAdapter([1], '[part1]'))
    await intcode.run(code, makeAdapter([5], '[part2]'))
  });
