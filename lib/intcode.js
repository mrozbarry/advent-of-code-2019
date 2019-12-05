const { read } = require('./file');

const MODES = {
  0: 'position',
  1: 'immediate',
};

const makeOpcode = (value, modes = []) => ({
  value: Number(value),
  modes: Array.from({ length: 3 }, (_, index) => modes[index] || 0),
});

const parseOpcode = (code, instructions = {}) => {
  if (instructions[code]) {
    return makeOpcode(code, [0, 0, 0]);
  }

  const instruction = code.toString();
  const rawOpcode = instruction.slice(-2);
  if (rawOpcode.length < 2 || rawOpcode[0] !== '0') {
    return makeOpcode(code);
  }
  const opcode = rawOpcode.replace(/^0+/, '');
  const modes = instruction.slice(0, -2).split('').reverse();

  return makeOpcode(opcode, modes.map(m => Number(m)));
};

const getValue = (memory, address, parameter) => {
  const instruction = memory[address];
  const value = memory[address + parameter].value;
  return instruction.modes[parameter] === 0
    ? memory[value].value
    : value;
}

const loadFromString = data => (
  data
    .split(',')
    .filter(v => v !== '')
    .map(code => Number(code.trim().replace(/^0+/, '')))
);

const loadFromFile = (file) => read(file).then(loadFromString);

const opcodeMath = (memory, addressOffset, fn) => {
  const a = getValue(memory, addressOffset, 1);
  const b = getValue(memory, addressOffset, 2);
  const outAddress = memory[addressOffset + 3].value;
  console.log('opcodeMath', addressOffset, memory, { a, b, outAddress });
  return [outAddress, fn(a, b)];
};

const OPCODES = {
  HALT: 99,
  ADD: 1,
  MULTIPLY: 2,
};

const add = (a, b) => a + b;
const multiply = (a, b) => a * b;

const INSTRUCTIONS = {
  [OPCODES.ADD]: (memory, address, _adapter) => {
    const [addr, value] = opcodeMath(
      memory,
      address,
      add,
    );
    const nextMemory = [...memory];
    nextMemory[addr] = makeOpcode(value);
    return [nextMemory, address + 4];
  },
  [OPCODES.MULTIPLY]: (memory, address, _adapter) => {
    const [addr, value] = opcodeMath(
      memory,
      address,
      multiply,
    );
    const nextMemory = [...memory];
    nextMemory[addr] = makeOpcode(value);
    return [nextMemory, address + 4];
  },
  [OPCODES.HALT]: (memory, address, _adapter) => [memory, address],
};

const step = (memory, address, adapter, instructions) => {
  const instruction = memory[address];
  const opcode = instruction.value;

  const fn = instructions[opcode];
  if (!fn) {
    throw new Error(`Illegal opcode ${opcode}`);
  }
  return fn(memory, address, adapter);
};

const nullAdapter = {
  input: () => {},
  output: () => {},
};

const run = (initialOpcodes) => {
  let memory = initialOpcodes.map(code => parseOpcode(code, INSTRUCTIONS));
  let address = 0;
  while (address < memory.length) {
    const prevMemory = [...memory];
    [memory, address] = step(memory, address, nullAdapter, INSTRUCTIONS);
    if (memory[address] && memory[address].value === 99) {
      return memory.map(v => v.value);
    }
  }
  throw new Error('Reached EOP without opcode 99');
}

module.exports = {
  MODES,
  OPCODES,
  INSTRUCTIONS,
  makeOpcode,
  parseOpcode,
  loadFromFile,
  loadFromString,
  step,
  run,
};
