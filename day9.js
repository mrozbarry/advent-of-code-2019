const path = require('path');

const intcode = require('./lib/intcode2');

const code = path.resolve(__dirname, 'day9.program');

const makeAdapter = (name, inputs) => ({
  input: inputs[Symbol.iterator](),
  output: v => console.log('[OUTPUT] ', name, v),
});

intcode.loadFromFile(code).then(async (program) => {
  await intcode.run(program, makeAdapter('part1', [1]));
  await intcode.run(program, makeAdapter('part2', [2]));
});
