const { read } = require('./file');

// const debug = (...params) => console.log(...params);
const debug = () => {};

const loadFromString = data => data
  .split(',')
  .filter(v => v !== '')
  .map(code => code.trim().replace(/^0+/, ''))
  .map(Number);

const loadFromFile = (file) => read(file).then(loadFromString);

const PARAMETER_MODES = {
  POSITION: 0, // Value at address
  IMMEDIATE: 1, // Use value
  RELATIVE: 2, // Value at relative address
};

const opcodeInstruction = (memory) => {
  const initial = memory.toString();
  const code = initial.slice(-2);

  if (code.length === 1 || code[0] !== '0') {
    return {
      opcode: memory,
      modes: [
        PARAMETER_MODES.POSITION,
        PARAMETER_MODES.POSITION,
        PARAMETER_MODES.POSITION,
      ],
    };
  }

  const initialModes = initial.slice(0, -2).split('').reverse();
  const opcode = Number(code.replace(/^0+/, ''));
  const modes = Array.from(
    { length: 3 },
    (_, index) => Number(initialModes[index]) || PARAMETER_MODES.POSITION
  );

  return {
    opcode,
    modes,
  };
};

const get = (memory, address) => memory[address] || 0;

const getAddress = (memory, relativeBase, address, mode) => {
  switch (mode) {
    case PARAMETER_MODES.POSITION: return get(memory, address);
    case PARAMETER_MODES.IMMEDIATE: return address;
    case PARAMETER_MODES.RELATIVE: return relativeBase + get(memory, address);
    default: throw new Error(`Bad mode ${mode}`);
  }
};

const value = (memory, relativeBase, address, mode) => {
  const addr = getAddress(memory, relativeBase, address, mode);
  return memory[addr] || 0;
};

const getParameters = (readCount, writeCount, memory, relativeBase, address) => {
  const instruction = opcodeInstruction(memory[address]);
  let { modes } = instruction;
  if (writeCount > 0) {
    const a = modes.slice(0, readCount);
    const b = modes.slice(-writeCount).map(v => v === 0 ? 1 : v);
    modes = a.concat(b);
  }

  return Array.from({ length: readCount + writeCount }, (_, index) => {
    const addr = address + 1 + index;
    const mode = modes[index]
    return value(memory, relativeBase, addr, mode);
  });
}

const OPCODES = {
  HALT: 99,
  ADD: 1,
  MULTIPLY: 2,
  INPUT: 3,
  OUTPUT: 4,
  JMPIF: 5,
  JMPIFNOT: 6,
  LESSTHAN: 7,
  EQUAL: 8,
  RELATIVEBASE: 9,
};

const OPCODE_FNS = {
  [OPCODES.ADD]: (memory, address, relativeBase) => {
    const [a, b, outAddress] = getParameters(2, 1, memory, relativeBase, address);

    debug(a, '+', b, '=', a+b, '=>', `0x${outAddress}`);

    const nextMemory = [...memory];
    nextMemory[outAddress] = a + b;

    return [nextMemory, address + 4, relativeBase];
  },

  [OPCODES.MULTIPLY]: (memory, address, relativeBase) => {
    const [a, b, outAddress] = getParameters(2, 1, memory, relativeBase, address);

    debug(a, '*', b, '=', a*b , '=>', `0x${outAddress}`);

    const nextMemory = [...memory];
    nextMemory[outAddress] = a * b;

    return [nextMemory, address + 4, relativeBase];
  },

  [OPCODES.INPUT]: async (memory, address, relativeBase, adapter) => {
    const [addr] = getParameters(0, 1, memory, relativeBase, address);

    const userInput = await adapter.input();

    debug('Input', userInput, '=>', `0x${addr}`);

    const nextMemory = [...memory];
    nextMemory[addr] = Number(userInput);

    return [nextMemory, address + 2, relativeBase];
  },

  [OPCODES.OUTPUT]: (memory, address, relativeBase, adapter) => {
    const [value] = getParameters(1, 0, memory, relativeBase, address);
    adapter.output(value);
    debug('Output:', value);
    return [memory, address + 2, relativeBase];
  },

  [OPCODES.JMPIF]: (memory, address, relativeBase) => {
    const [isNotZero, addressIfNotZero] = getParameters(2, 0, memory, relativeBase, address);

    const nextAddress = isNotZero !== 0 ? addressIfNotZero : address + 3;
    debug('Jump if 0 !==', isNotZero, 'to', `0x${nextAddress}`);

    return [memory, nextAddress, relativeBase];
  },

  [OPCODES.JMPIFNOT]: (memory, address, relativeBase) => {
    const [isZero, addressIfZero] = getParameters(2, 0, memory, relativeBase, address);

    const nextAddress = isZero === 0 ? addressIfZero : address + 3;
    debug('Jump if 0 0==', isZero, 'to', `0x${nextAddress}`);

    return [memory, nextAddress, relativeBase];
  },

  [OPCODES.LESSTHAN]: (memory, address, relativeBase) => {
    const [a, b, outAddr] = getParameters(2, 1, memory, relativeBase, address);

    const nextMemory = [...memory];
    nextMemory[outAddr] = a < b ? 1 : 0;
    debug('Less than', a, '<', b, '=', nextMemory[outAddr], '=>', `0x${outAddr}`);

    return [nextMemory, address + 4, relativeBase]
  },

  [OPCODES.EQUAL]: (memory, address, relativeBase) => {
    const [a, b, outAddr] = getParameters(2, 1, memory, relativeBase, address);

    const nextMemory = [...memory];
    nextMemory[outAddr] = a === b ? 1 : 0;
    debug('Less than', a, '===', b, '=', nextMemory[outAddr], '=>', `0x${outAddr}`);

    return [nextMemory, address + 4, relativeBase]
  },

  [OPCODES.RELATIVEBASE]: (memory, address, relativeBase) => {
    const [offset] = getParameters(1, 0, memory, relativeBase, address);

    return [memory, address + 2, relativeBase + offset];
  },
};

const step = (memory, address, relativeBase, adapter) => {
  const data = memory[address];
  const { opcode } = opcodeInstruction(data);
  const fn = OPCODE_FNS[opcode];
  if (!fn) {
    throw new Error(`Illegal opcode ${opcode}`);
  }
  return Promise.resolve(fn(memory, address, relativeBase, adapter));
};

const nullAdapter = {
  input: () => Promise.resolve(undefined),
  output: () => {},
  end: () => {},
};

const run = async (initialOpcodes, adapter = nullAdapter) => {
  let memory = [...initialOpcodes];
  let address = 0;
  let relativeBase = 0;
  while (address < memory.length) {
    debug('run.loop', { memory: memory.join(','), address, relativeBase });
    [memory, address, relativeBase] = await step(memory, address, relativeBase, adapter);
    if (memory[address] === 99) {
      adapter.end();
      return memory;
    }
  }
  throw new Error('Reached EOP without opcode 99');
}

module.exports = {
  PARAMETER_MODES,
  opcodeInstruction,
  getAddress,
  value,
  loadFromFile,
  loadFromString,
  step,
  run,
};
