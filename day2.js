const path = require('path');
const intcode = require('./lib/intcode');

const firstProgram = path.resolve(__dirname, 'input.program');

const run = async (opcodes, noun, verb) => {
  opcodes[1] = noun;
  opcodes[2] = verb;
  const memory = await intcode.run(opcodes);
  return memory[0];
}

// Original (3931283)
intcode.loadFromFile(firstProgram)
  .then((opcodes) => run(opcodes, 12, 2))
  .then(console.log);

// // Part II (noun=69, verb=79)
// intcode.loadFromFile(firstProgram)
//   .then((opcodes) => {
//     const desiredOutput = 19690720;
//     for(let noun = 0; noun < opcodes.length; noun++) {
//       for(let verb = 0; verb < opcodes.length; verb++) {
//         if (run(opcodes, noun, verb) === desiredOutput) {
//           return {
//             noun,
//             verb,
//           };
//         }
//       }
//     }
//   })
//   .then(console.log);
