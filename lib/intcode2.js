const { read } = require('./file');

let debug = () => {};
//debug = (
  //(instruction, ...args) => (void console.log(
    //`0x${instruction.address}`, 
    //...args,
    //JSON.stringify(instruction.segment),
  //))
//);

const loadFromString = (code) => {
  const memory = code.trim().split(',').map(s => Number(s.trim()));
  return {
    memory,
    address: 0,
    relativeBase: 0,
  };
};

const loadFromFile = (file) => read(file).then(data => data.trim());

const MODES = {
  POSITION: 0, // Value at address
  IMMEDIATE: 1, // Use value
  RELATIVE: 2, // Value at relative address
};

const MODES_STR = {
  [MODES.POSITION]: 'position',
  [MODES.IMMEDIATE]: 'immediate',
  [MODES.RELATIVE]: 'relative',
};
const modeToStr = mode => MODES_STR[mode];

const INSTRUCTIONS = {
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
}

const INSTRUCTIONS_STR = {
  [INSTRUCTIONS.HALT]: 'halt',
  [INSTRUCTIONS.ADD]: 'add',
  [INSTRUCTIONS.MULTIPLY]: 'multiply',
  [INSTRUCTIONS.INPUT]: 'input',
  [INSTRUCTIONS.OUTPUT]: 'output',
  [INSTRUCTIONS.JMPIF]: 'jump if',
  [INSTRUCTIONS.JMPIFNOT]: 'jump if not',
  [INSTRUCTIONS.LESSTHAN]: 'less than',
  [INSTRUCTIONS.EQUAL]: 'equal',
  [INSTRUCTIONS.RELATIVEBASE]: 'relative base',
};
const opcodeToStr = opcode => INSTRUCTIONS_STR[opcode];

const makeOpcode = (reads, writes, fn) => ({
  reads,
  writes,
  args: reads + writes,
  fn,
});

const addressWrite = (program, address, value, mode) => {
  const memory = [...program.memory];
  // Problem: parseInstruciton already handles relative/non relative offsetting, so we don't need to here...
  // const offset = mode === MODES.RELATIVE ? program.relativeBase : 0;
  const offset = 0;
  memory[offset + address] = value;
  return { ...program, memory };
};

const resolveAddressOf = (program, address, mode) => {
  //debug({ address, segment: [] }, 'resolveAddressOf', {
    //address,
    //mode, relativeBase: program.relativeBase,
  //});
  switch (mode) {
    case MODES.POSITION: {
      return program.memory[address];
    }

    case MODES.IMMEDIATE: {
      return address;
    }

    case MODES.RELATIVE: {
      return program.relativeBase + program.memory[address];
    }

    default: throw new Error(`Unrecognized address mode ${mode} for address 0x${address}`);
  }
}

const addressRead = (program, address, mode) => {
  const addr = resolveAddressOf(program, address, mode);
  return program.memory[addr] || 0;
};

const mathOpcode = (sign, mathFn) => makeOpcode(2, 1, (program, instruction) => {
  const [a, b, addr] = instruction.params;
  const result = mathFn(a, b);

  // debug(instruction, `write(${a} ${sign} ${b} = ${result}, 0x${addr})`)

  const nextProgram = addressWrite(program, addr, result, instruction.modes[2]);

  return {
    ...nextProgram,
    address: program.address + 4,
  }
});

const jumpOpcode = (op, conditionFn) => makeOpcode(2, 0, (program, instruction) => {
  const [value, ifTrueAddr] = instruction.params;
  const shouldJump = conditionFn(value);
  const ifFalseAddr = program.address + 3;
  const nextAddress = shouldJump ? ifTrueAddr : ifFalseAddr;
  // debug(instruction, `jumpToAddress((${value} ${op} = ${shouldJump.toString()} ? 0x${ifTrueAddr} : 0x${ifFalseAddr}) = 0x${nextAddress})`);
  return {
    ...program,
    address: nextAddress,
  };
});

const boolOpcode = (op, conditionFn) => makeOpcode(2, 1, (program, instruction) => {
  const [a, b, addr] = instruction.params;
  const shouldWrite = conditionFn(a, b);
  const writeValue = shouldWrite ? 1 : 0;
  // debug(instruction, `write(${a} ${op} ${b} ? 1 : 0 = ${writeValue} ? , 0x${addr})`);
  return {
    ...addressWrite(
      program,
      addr,
      writeValue,
      instruction.modes[2],
    ),
    address: program.address + 4,
  };
});

const OPCODES = {
  [INSTRUCTIONS.ADD]: mathOpcode('+', (a, b) => a + b),
  [INSTRUCTIONS.MULTIPLY]: mathOpcode('*', (a, b) => a * b),
  [INSTRUCTIONS.INPUT]: makeOpcode(0, 1, async (program, instruction, adapter) => {
    const [addr] = instruction.params;
    const input = await adapter.input.next().value;
    debug(instruction, 'Got input', input, 'writing to', `0x${addr}`);
    return ({
      ...addressWrite(
        program,
        addr,
        input,
        instruction.modes[0],
      ),
      address: program.address + 2,
    });
  }),
  [INSTRUCTIONS.OUTPUT]: makeOpcode(1, 0, async (program, instruction, adapter) => {
    debug(instruction, 'Will output', instruction.params[0], 'from', `0x${program.address + 1}`);
    await adapter.output(instruction.params[0]);
    return {
      ...program,
      address: program.address + 2,
    };
  }),
  [INSTRUCTIONS.JMPIF]: jumpOpcode('!== 0', (a) => a !== 0),
  [INSTRUCTIONS.JMPIFNOT]: jumpOpcode('=== 0', (a) => a === 0),
  [INSTRUCTIONS.LESSTHAN]: boolOpcode('<', (a, b) => a < b),
  [INSTRUCTIONS.EQUAL]: boolOpcode('===', (a, b) => a === b),
  [INSTRUCTIONS.RELATIVEBASE]: makeOpcode(1, 0, (program, instruction) => {
    const relativeBase = program.relativeBase + instruction.params[0];
    debug(instruction, 'Adjust relative base; ', program.relativeBase, '+', instruction.params[0], '=', relativeBase);
    return {
      ...program,
      address: program.address + 2,
      relativeBase,
    };
  }),
};

const parseInstruction = (program) => {
  const code = program.memory[program.address];
  let modes = [MODES.POSITION, MODES.POSITION, MODES.POSITION];
  let opcode = OPCODES[code];
  let opcodeNum = code;
  if (!opcode) {
    const codeStr = code.toString();

    const opcodeStr = codeStr.slice(-2)
    opcodeNum = opcodeStr.replace(/^0+/, '');
    opcode = OPCODES[opcodeNum];
    if (!opcode) {
      throw new Error(`Unrecognized opcode ${code} at 0x${program.address}`);
    }
    const modeParts = codeStr.slice(0, -2).padStart(3, '0');
    modes = modeParts.split('').reverse().map(Number);
  }

  modes = modes.slice(0, opcode.args);

  const readParams = modes.slice(0, opcode.reads).map((mode, index) => {
    return addressRead(program, program.address + 1 + index, mode);
  });
  const writeParams = modes.slice(opcode.reads).map((mode, index) => {
    return resolveAddressOf(program, program.address + 1 + opcode.reads + index, mode);
  });

  const segment = program.memory.slice(program.address, program.address + opcode.args + 1);

  const allParams = readParams.concat(writeParams);
  return {
    ...opcode,
    source: code,
    opcodeNum,
    relativeBase: program.relativeBase,
    name: opcodeToStr(opcodeNum),
    address: program.address,
    segment,
    modes,
    params: allParams,
    annotatedParams: allParams.map((param, index) => {
      const address = resolveAddressOf(program, program.address + 1 + index, modes[index]);
      const mapping = modes[index] === MODES.IMMEDIATE
        ? allParams[index]
        : [`0x${program.memory[address]}`, param].join('=>');
      return `${modeToStr(modes[index]).padStart(8, ' ')}(0x${address})::${mapping}`;
    }),
  }
};

const step = (program, adapter) => {
  const instruction = parseInstruction(program);

  return instruction.fn(program, instruction, adapter);
};

const isProgramDone = (program) => {
  if (program.address >= program.memory.length) {
    throw new Error('Program out of bounds');
  }
  return program.memory[program.address] === 99;
}

const run = async (code, adapter) => {
  let program = loadFromString(code);
  while (!isProgramDone(program)) {
    program = await step(program, adapter);
  }
  return program;
};

module.exports = {
  MODES,
  loadFromString,
  loadFromFile,
  addressRead,
  step,
  isProgramDone,
  parseInstruction,
  run,
};
