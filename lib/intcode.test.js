const test = require('ava');
const intcode = require('./intcode');

test('run matches output from samples', (t) => {
  t.deepEqual(
    intcode.run(intcode.loadFromString('1,0,0,0,99')),
    [2, 0, 0, 0, 99],
  );

  t.deepEqual(
    intcode.run(intcode.loadFromString('2,3,0,3,99')),
    [2, 3, 0, 6, 99],
  );

  t.deepEqual(
    intcode.run(intcode.loadFromString('2,4,4,5,99,0')),
    [2, 4, 4, 5, 99, 9801],
  );
});

test('run throws when there is an illegal opcode', (t) => {
  t.throws((() => intcode.run([100])), 'Illegal opcode 100');
});

test('run throws EOP when there is no HALT/99 opcode', (t) => {
  t.throws((() => intcode.run([1, 0, 0])), 'Reached EOP without opcode 99');
});
