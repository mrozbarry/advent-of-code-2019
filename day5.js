const readline = require('readline');
const path = require('path');

const intcode = require('./lib/intcode');

const firstProgram = path.resolve(__dirname, 'day5.program');

const adapter = {
  input: () => new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const ask = () => {
      rl.question('Integer?', (data) => {
        const integer = Number(data[0]);
        if (Number.isNaN(integer)) {
          return ask();
        }
        rl.close();
        resolve(integer);
      });
    };

    ask();
  }),
  output: v => {
    console.log(v);
  },
};

intcode.loadFromFile(firstProgram)
  .then(opcodes => intcode.run(opcodes, adapter));
