const { read } = require('./file');

const loadFromString = data => data
  .split(',')
  .filter(v => v !== '')
  .map(code => code.trim().replace(/^0+/, ''))
  .map(Number);

const loadFromFile = (file) => read(file).then(loadFromString);

const opcodeInstruction = (opcode) => {
  const initial = opcode.toString();
  const code = initial.slice(-2);
  if (code.length === 1 || code[0] !== '0') {
    return {
      opcode,
      modes: [0, 0, 0],
    };
  }

  const initialModes = initial.slice(0, -2).split('').reverse();
  const modes = Array.from({ length: 3 }, (_, index) => Number(initialModes[index]) || 0);

  return {
    opcode: Number(code.replace(/^0+/, '')),
    modes,
  };
};

const value = (memory, value, mode) => {
  return mode === 0
    ? memory[value]
    : value;
};

const opcodeMath = (memory, addressOffset, fn) => {
  const instruction = opcodeInstruction(memory[addressOffset]);
  const [addrA, addrB, addrOut] = memory.slice(addressOffset + 1, addressOffset + 4);

  const a = value(memory, addrA, instruction.modes[0]);
  const b = value(memory, addrB, instruction.modes[1]);

  const nextOpcodes = [...memory];
  nextOpcodes[addrOut] = fn(a, b);
  return nextOpcodes;
};

const OPCODES = {
  HALT: 0,
  ADD: 1,
  MULTIPLY: 2,
  INPUT: 3,
  OUTPUT: 4,
  JMPIF: 5,
  JMPIFNOT: 6,
  LESSTHAN: 7,
  EQUAL: 8,
};

const OPCODE_FNS = {
  [OPCODES.ADD]: (memory, address) => {
    const nextOpcodes = opcodeMath(
      memory,
      address,
      (a, b) => a + b,
    );
    return [nextOpcodes, address + 4];
  },

  [OPCODES.MULTIPLY]: (memory, address) => {
    const nextOpcodes = opcodeMath(
      memory,
      address,
      (a, b) => a * b,
    );
    return [nextOpcodes, address + 4];
  },

  [OPCODES.INPUT]: async (memory, address, adapter) => {
    const instruction = opcodeInstruction(memory[address]);
    const addr = value(memory, address + 1, instruction.modes[0]);
    const userInput = await adapter.input();

    const nextMemory = [...memory];

    nextMemory[addr] = Number(userInput);

    return [nextMemory, address + 2];
  },

  [OPCODES.OUTPUT]: (memory, address, adapter) => {
    adapter.output(memory[memory[address + 1]]);
    return [memory, address + 2];
  },

  [OPCODES.JMPIF]: (memory, address) => {
    const { opcode, modes } = opcodeInstruction(memory[address]);

    const a = value(memory, memory[address + 1], modes[0]);
    const b = value(memory, memory[address + 2], modes[1]);

    const nextAddress = a !== 0 ? b : address + 3;

    return [memory, nextAddress]
  },

  [OPCODES.JMPIFNOT]: (memory, address) => {
    const { modes } = opcodeInstruction(memory[address]);

    const a = value(memory, memory[address + 1], modes[0]);
    const b = value(memory, memory[address + 2], modes[1]);

    const nextAddress = a === 0 ? b : address + 3;

    return [memory, nextAddress]
  },

  [OPCODES.LESSTHAN]: (memory, address) => {
    const { modes } = opcodeInstruction(memory[address]);

    const a = value(memory, memory[address + 1], modes[0]);
    const b = value(memory, memory[address + 2], modes[1]);
    const c = memory[address + 3];

    const nextMemory = [...memory];
    nextMemory[c] = a < b ? 1 : 0;

    return [nextMemory, address + 4]
  },

  [OPCODES.EQUAL]: (memory, address) => {
    const { modes } = opcodeInstruction(memory[address]);

    const a = value(memory, memory[address + 1], modes[0]);
    const b = value(memory, memory[address + 2], modes[1]);
    const c = memory[address + 3];

    const nextMemory = [...memory];
    nextMemory[c] = a === b ? 1 : 0;

    return [nextMemory, address + 4]
  },
};

const step = (memory, address, adapter) => {
  const data = memory[address];
  const { opcode } = opcodeInstruction(data);
  const fn = OPCODE_FNS[opcode];
  if (!fn) {
    throw new Error(`Illegal opcode ${opcode}`);
  }
  return Promise.resolve(fn(memory, address, adapter));
};

const nullAdapter = {
  input: () => Promise.resolve(undefined),
  output: () => {},
  end: () => {},
};

const run = async (initialOpcodes, adapter = nullAdapter) => {
  let memory = [...initialOpcodes];
  let address = 0;
  while (address < memory.length) {
    [memory, address] = await step(memory, address, adapter);
    if (memory[address] === 99) {
      adapter.end();
      return memory;
    }
  }
  throw new Error('Reached EOP without opcode 99');
}

module.exports = {
  opcodeInstruction,
  loadFromFile,
  loadFromString,
  run,
};
