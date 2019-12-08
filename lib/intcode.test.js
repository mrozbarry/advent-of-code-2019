const test = require('ava');
const sinon = require('sinon');
const intcode = require('./intcode');

test('run matches output from samples', async (t) => {
  t.deepEqual(
    await intcode.run(intcode.loadFromString('1,0,0,0,99')),
    [2, 0, 0, 0, 99],
  );

  t.deepEqual(
    await intcode.run(intcode.loadFromString('2,3,0,3,99')),
    [2, 3, 0, 6, 99],
  );

  t.deepEqual(
    await intcode.run(intcode.loadFromString('2,4,4,5,99,0')),
    [2, 4, 4, 5, 99, 9801],
  );
});

test('run throws when there is an illegal opcode', (t) => {
  return t.throwsAsync((() => intcode.run([98])), 'Illegal opcode 98');
});

test('run throws EOP when there is no HALT/99 opcode', (t) => {
  return t.throwsAsync((() => intcode.run([1, 0, 0])), 'Reached EOP without opcode 99');
});

test('opcodeInstruction can parse an opcode and modes', (t) => {
  t.deepEqual(intcode.opcodeInstruction(1002), {
    opcode: 2,
    modes: [0, 1, 0],
  });

  t.deepEqual(intcode.opcodeInstruction(2), {
    opcode: 2,
    modes: [0, 0, 0],
  });
});

test('run can handle user input', async (t) => {
  const v = 5 + Math.floor(Math.random() * 4);
  const adapter = {
    input: () => Promise.resolve(v),
    output: sinon.fake(),
    end: () => {},
  };

  const memory = await intcode.run(intcode.loadFromString('3,3,99,0'), adapter);

  t.deepEqual(memory, [3, 3, 99, v]);
});

test('run can handle output', async (t) => {
  const adapter = {
    input: () => Promise.resolve(v),
    output: sinon.fake(),
    end: () => {},
  };

  await intcode.run(intcode.loadFromString('4,3,99,420'), adapter);

  t.deepEqual(adapter.output.firstCall.args, [420]);
});

const runProgram = async (t, code, inputValue, expectedOutput, desc) => {
  const output = sinon.fake();

  await intcode.run(intcode.loadFromString(code), {
    output,
    input: () => Promise.resolve(inputValue),
    end: () => {},
  });

  t.deepEqual(
    output.lastCall.args,
    [expectedOutput],
  );
}

test('sample is 8', (t) => runProgram(t, '3,9,8,9,10,9,4,9,99,-1,8', 8, 1));
test('sample is !8', (t) => runProgram(t, '3,9,8,9,10,9,4,9,99,-1,8', 7, 0));
test('sample is <8', (t) => runProgram(t, '3,9,7,9,10,9,4,9,99,-1,8', 9, 0));
test('sample is !<8', (t) => runProgram(t, '3,9,7,9,10,9,4,9,99,-1,8', 3, 1));
