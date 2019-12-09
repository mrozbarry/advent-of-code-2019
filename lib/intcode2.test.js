const test = require('ava');
const sinon = require('sinon');
const intcode = require('./intcode2');

const makeAdapter = (inputs = [], output = sinon.fake()) => {
  const iter = inputs[Symbol.iterator]();
  return {
    input: iter,
    output,
  }
};

test('addition sample', async (t) => {
  const adapter = makeAdapter();

  const { memory } = await intcode.run('1,0,0,0,99', adapter);
  t.deepEqual(
    memory,
    [2, 0, 0, 0, 99],
  );
});

test('multiplication sample', async (t) => {
  const adapter = makeAdapter();

  const { memory } = await intcode.run('2,3,0,3,99', adapter);
  t.deepEqual(
    memory,
    [2, 3, 0, 6, 99],
  );

});

test('multiplication sample 2', async (t) => {
  const adapter = makeAdapter();

  const { memory } = await intcode.run('2,4,4,5,99,0', adapter);
  t.deepEqual(
    memory,
    [2, 4, 4, 5, 99, 9801],
  );
});

test('run throws when there is an illegal opcode', (t) => {
  return t.throwsAsync((() => intcode.run('98')), 'Unrecognized opcode 98 at 0x0');
});

test('run throws error when there is no HALT/99 opcode', (t) => {
  return t.throwsAsync((() => intcode.run('1,0,0')), 'Program out of bounds');
});

test('run can handle user input', async (t) => {
  const v = 5 + Math.floor(Math.random() * 4);
  const inputs = [v];
  const adapter = {
    input: inputs[Symbol.iterator](),
    output: sinon.fake(),
    end: () => {},
  };

  const { memory } = await intcode.run('3,3,99,0', adapter);

  t.deepEqual(memory, [3, 3, 99, v]);
});

test('run can handle output', async (t) => {
  const inputs = [];

  const adapter = {
    input: inputs[Symbol.iterator](),
    output: sinon.fake(),
    end: () => {},
  };

  await intcode.run('4,3,99,420', adapter);

  t.deepEqual(adapter.output.firstCall.args, [420]);
});

const runProgram = async (t, code, inputValue, expectedOutput) => {
  const adapter = makeAdapter([inputValue]);

  await intcode.run(code, adapter);

  t.is(adapter.output.callCount, 1);
  t.deepEqual(
    adapter.output.lastCall.args,
    [expectedOutput],
  );
}

test('sample is 8', (t) => runProgram(t, '3,9,8,9,10,9,4,9,99,-1,8', 8, 1));
test('sample is !8', (t) => runProgram(t, '3,9,8,9,10,9,4,9,99,-1,8', 7, 0));
test('sample is <8', (t) => runProgram(t, '3,9,7,9,10,9,4,9,99,-1,8', 9, 0));
test('sample is !<8', (t) => runProgram(t, '3,9,7,9,10,9,4,9,99,-1,8', 3, 1));

test('sample jump test in position mode', async (t) => {
  const output = sinon.fake();
  const code = '3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9';

  await intcode.run(code, makeAdapter([0], output));
  t.deepEqual(output.lastCall.args, [0]);

  await intcode.run(code, makeAdapter([5], output));
  t.deepEqual(output.lastCall.args, [1]);
});

test('sample jump test in immediate mode', async (t) => {
  const output = sinon.fake();
  const code = '3,3,1105,-1,9,1101,0,0,12,4,12,99,1';

  await intcode.run(code, makeAdapter([0], output));
  t.deepEqual(output.lastCall.args, [0]);

  await intcode.run(code, makeAdapter([5], output));
  t.deepEqual(output.lastCall.args, [1]);
});

test('day 5 large input+jump example', async (t) => {
  const output = sinon.fake();
  const code = '3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99';

  await intcode.run(code, makeAdapter([0], output));
  t.deepEqual(output.lastCall.args, [999]);

  await intcode.run(code, makeAdapter([8], output));
  t.deepEqual(output.lastCall.args, [1000]);

  await intcode.run(code, makeAdapter([9], output));
  t.deepEqual(output.lastCall.args, [1001]);
});

test('relative mode example does the right thing', (t) => {
  const program = {
    memory: [2102, 1, -7, 5, 99, 0],
    relativeBase: 50,
  };
  program.memory[43] = 2;
  const value = intcode.addressRead(program, 2, intcode.MODES.RELATIVE);
  t.is(value, program.memory[43]);
});

test('day9 relative base 2000 sample', async (t) => {
  let program = { ...intcode.loadFromString('109,19,204,-34'), relativeBase: 2000 };
  program.memory[1985] = 789;
  const adapter = makeAdapter();

  program = await intcode.step(program, adapter);
  t.is(program.relativeBase, 2019);

  program = await intcode.step(program, adapter);
  t.deepEqual(adapter.output.lastCall.args, [789]);
});

test('custom relative mode test', async (t) => {
  let program = { ...intcode.loadFromString('22201,0,1,2,99,5,5,0'), relativeBase: 5 };
  const adapter = makeAdapter();
  program = await intcode.step(program, adapter);
  t.deepEqual(program.memory, [22201, 0, 1, 2, 99, 5, 5, 10]);
});

test('day9 sample 1 (make a copy of itself)', async (t) => {
  const code = '109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99';
  const expectation = code.split(',').map(Number);

  t.plan(expectation.length);

  const adapter = makeAdapter([], (v) => {
    if (expectation.length === 0) {
      t.fail('too many outputs');
    }
    const expectedV = expectation.shift();
    t.is(v, expectedV);
  });

  await intcode.run(code, adapter);
});

test('16 digit support', async (t) => {
  t.plan(1);

  const adapter = {
    output: (v) => {
      const numberOfDigits = v.toString().length;
      t.is(numberOfDigits, 16);
    },
    input: () => Promise.resolve(0),
  };

  await intcode.run('1102,34915192,34915192,7,4,7,99,0', adapter);
});

test('output 16 digit number', async (t) => {
  t.plan(1);

  const inputs = [0];

  const adapter = {
    output: (v) => {
      t.snapshot(v);
    },
    input: inputs[Symbol.iterator](),
  };

  await intcode.run('104,1125899906842624,99', adapter);
});
