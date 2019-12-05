const intcode = require('./intcode');

const OPCODES = {
  ...intcode.OPCODES,
  INPUT: 3,
  OUTPUT: 4,

  PARAMETER_MODE: Symbol('ParameterMode'),
};

const INSTRUCTIONS = {
  ...intcode.INSTRUCTIONS,
  [OPCODES.INPUT]: (memory, address, adapter) => {
    const nextMemory = [...memory];
    return adapter.input()
      .then((userInput) => {
        nextMemory[memory[address + 1].value] = intcode.makeOpcode(userInput);
        return [nextMemory, address + 2];
      });
  },
  [OPCODES.OUTPUT]: (memory, address, adapter) => {
    adapter.output(memory[memory[address + 1].value].value);
    return [memory, address + 2];
  },
};

const step = (initialMemory, initialAddress, adapter) => {
  console.log('intcode2.step', initialAddress, initialMemory);
  return Promise.resolve(intcode.step(initialMemory, initialAddress, adapter, INSTRUCTIONS))
    .then(([memory, address]) => {
      //console.log('step', {
        //initialAddress,
        //initialMemory: initialMemory.map(v => v.value ),
        //address,
        //memory: memory.map(v => v.value),
      //});
      if (memory[address] && memory[address].value === 99) {
        return memory.map(mem => mem.value);
      }

      if (!memory[address]) throw new Error('Program out of bounds');

      return step(memory, address, adapter);
    });
};

const run = (initialOpcodes, adapter) => {
  return step(initialOpcodes.map(intcode.parseOpcode), 0, adapter);
};

const dummyInOutAdapter = {
  input: () => 0, // maybe user input
  output: v => v, // maybe console.log
};

module.exports = {
  OPCODES,
  INSTRUCTIONS,
  step,
  run,
  loadFromString: intcode.loadFromString,
  loadFromFile: intcode.loadFromFile,
  dummyInOutAdapter,
};
