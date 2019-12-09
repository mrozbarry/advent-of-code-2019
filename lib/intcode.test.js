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

test('value does the right thing based on mode', (t) => {
  const memory = [100, 2, 300, 400, 500];

  t.is(intcode.value(memory, 0, 1, intcode.PARAMETER_MODES.POSITION), 300);
  t.is(intcode.value(memory, 0, 0, intcode.PARAMETER_MODES.IMMEDIATE), 100);
  t.is(intcode.value(memory, 0, 1, intcode.PARAMETER_MODES.RELATIVE), 300);
  t.is(intcode.value(memory, 1, 1, intcode.PARAMETER_MODES.RELATIVE), 400);
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

test('day9 sample 1 (make a copy of itself)', async (t) => {
  let buffer = [];
  const adapter = {
    output: (v) => {
      buffer = buffer.concat(v);
    },
    input: () => Promise.resolve(inputValue),
    end: () => {},
  };

  const memory = intcode.loadFromString('109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99');
  await intcode.run(memory, adapter);

  t.deepEqual(memory, buffer);
});

test('16 digit support', async (t) => {
  t.plan(2);

  const adapter = {
    output: (v) => {
      const numberOfDigits = v.toString().length;
      t.is(numberOfDigits, 16);
    },
    input: () => Promise.resolve(0),
    end: () => {
      t.pass();
    },
  };

  const memory = intcode.loadFromString('1102,34915192,34915192,7,4,7,99,0');

  await intcode.run(memory, adapter);
});

test('output 16 digit number', async (t) => {
  t.plan(2);

  const adapter = {
    output: (v) => {
      t.is(v, 1125899906842624);
    },
    input: () => Promise.resolve(0),
    end: () => {
      t.pass();
    },
  };

  const memory = intcode.loadFromString('104,1125899906842624,99');

  await intcode.run(memory, adapter);
});
