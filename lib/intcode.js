const { read } = require('./file');

const loadFromString = data => {
  const opcodes = data
    .split(',')
    .filter(v => v !== '')
    .map(code => Number(code.trim()));

  return opcodes;
};

const loadFromFile = (file) => read(file).then(loadFromString);

const opcodeMath = (memory, addressOffset, fn) => {
  const [addrA, addrB, addrOut] = memory.slice(addressOffset, addressOffset + 3);
  const nextOpcodes = [...memory];
  nextOpcodes[addrOut] = fn(memory[addrA], memory[addrB]);
  return nextOpcodes;
};

const OPCODES = {
  HALT: 0,
  ADD: 1,
  MULTIPLY: 2,
};

const OPCODE_FNS = {
  [OPCODES.ADD]: (memory, address) => {
    const nextOpcodes = opcodeMath(
      memory,
      address + 1,
      (a, b) => a + b,
    );
    return [nextOpcodes, address + 4];
  },
  [OPCODES.MULTIPLY]: (memory, address) => {
    const nextOpcodes = opcodeMath(
      memory,
      address + 1,
      (a, b) => a * b,
    );
    return [nextOpcodes, address + 4];
  },
};

const step = (memory, address) => {
  const opcode = memory[address];
  const fn = OPCODE_FNS[opcode];
  if (!fn) {
    throw new Error(`Illegal opcode ${opcode}`);
  }
  return fn(memory, address);
};

const run = (initialOpcodes) => {
  let memory = [...initialOpcodes];
  let address = 0;
  while (address < memory.length) {
    [memory, address] = step(memory, address);
    if (memory[address] === 99) {
      return memory;
    }
  }
  throw new Error('Reached EOP without opcode 99');
}

module.exports = {
  loadFromFile,
  loadFromString,
  run,
};
