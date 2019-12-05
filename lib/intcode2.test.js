const test = require('ava');
const sinon = require('sinon');

const intcode = require('./intcode2');

const makeAdapter = (inputValue, outputFunction) => ({
  input: () => Promise.resolve(inputValue),
  output: v => outputFunction(v),
});

test('new opcodes 3 and 4 work', (t) => {
  t.plan(2);

  const outputFn = sinon.fake();
  const value = Math.round(Math.random() * 100);
  const adapter = makeAdapter(value, outputFn);

  return intcode.run(intcode.loadFromString('3,0,4,0,99'), adapter)
    .then((memory) => {
      t.deepEqual(memory, [value, 0, 4, 0, 99]);
      t.deepEqual(outputFn.firstCall.args, [value]);
    });
});

test.only('negative math', (t) => {
  const adapter = makeAdapter(0, () => {});
  return intcode.run(intcode.loadFromString('1101,100,-1,4,0'), adapter)
    .then((memory) => {
      return t.deepEqual(memory, [1101, 100, -1, 4, 0]);
    });
});

test('new instructions with modes work', (t) => {
  const outputFn = sinon.fake();
  const adapter = makeAdapter(1, outputFn);

  return intcode.run(intcode.loadFromString('1002,4,3,4,33'), adapter)
    .then((memory) => {
      t.deepEqual(memory, []);
    });
});
