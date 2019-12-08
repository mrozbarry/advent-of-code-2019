const intcode = require('./intcode');

const Noop = () => {};

const makeAdapter = (initialInputs = [], onEnd = Noop) => {
  const inputs = [...initialInputs];
  const outputs = [];

  const push = (value) => {
    inputs.push(value);
  };

  const input = () => new Promise((resolve) => {
    const nextInput = () => {
      if (inputs.length === 0) {
        return setTimeout(nextInput, 5);
      }
      resolve(inputs.shift());
    };
    nextInput();
  });

  const end = () => {
    onEnd(outputs);
  };

  const builder = (onOutput) => ({
    input,
    output: (value) => {
      outputs.push(value);
      onOutput(value);
    },
    end,
  });
  builder.push = push;

  return builder;
};

const loop = (memory, sequence) => new Promise(async (resolve) => {
  const a = makeAdapter([sequence[0], 0]);
  const b = makeAdapter([sequence[1]]);
  const c = makeAdapter([sequence[2]]);
  const d = makeAdapter([sequence[3]]);
  const e = makeAdapter([sequence[4]], (outputs) => {
    resolve(outputs[outputs.length - 1]);
  });

  await Promise.all([
    intcode.run(memory, a((v) => b.push(v))),
    intcode.run(memory, b((v) => c.push(v))),
    intcode.run(memory, c((v) => d.push(v))),
    intcode.run(memory, d((v) => e.push(v))),
    intcode.run(memory, e((v) => a.push(v))),
  ]);
})

const run = (memory, sequence, prev = 0) => {
  if (sequence.length === 0) return prev;

  const inputs = [sequence[0], prev];

  let next = null;

  const sequenceAdapter = {
    input: () => {
      const value = inputs.shift();
      return value;
    },
    output: (value) => {
      next = value;
    },
    end: () => {},
  };
  return intcode.run(memory, sequenceAdapter)
    .then(() => {
      return run(memory, sequence.slice(1), next);
    });
};

module.exports = {
  makeAdapter,
  loop,
  run,
};
