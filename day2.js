const path = require('path');
const intcode = require('./lib/intcode2');

const firstProgram = path.resolve(__dirname, 'day2.program');

const addNounVerb = (code, noun, verb) => {
  const opcodes = code.split(',');
  opcodes[1] = noun;
  opcodes[2] = verb;
  return opcodes.join(',');
};

intcode.loadFromFile(firstProgram)
  .then(async (code) => {
    const part1 = await intcode.run(addNounVerb(code, 12, 2));
    console.log('part 1:', part1.memory[0]);

    const opcodes = code.split(',').map(Number);
    const desiredOutput = 19690720;
    for(let noun = 0; noun < opcodes.length; noun++) {
      for(let verb = 0; verb < opcodes.length; verb++) {
        const output = await intcode.run(addNounVerb(code, noun, verb));
        if (output.memory[0] === desiredOutput) {
          console.log('part 2:', {
            noun,
            verb,
          }, (100 * noun) + verb);
          return;
        }
      }
    }
  })

