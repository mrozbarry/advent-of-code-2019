const path = require('path');

const intcode = require('./lib/intcode');
const intcodeSequence = require('./lib/intcode.sequence');

const program = path.resolve(__dirname, 'day7.program');

// Shamelessly borrowed from:
// https://stackoverflow.com/a/37580979
function* permute(permutation) {
  var length = permutation.length,
      c = Array(length).fill(0),
      i = 1, k, p;

  yield permutation.slice();
  while (i < length) {
    if (c[i] < i) {
      k = i % 2 && c[i];
      p = permutation[i];
      permutation[i] = permutation[k];
      permutation[k] = p;
      ++c[i];
      i = 1;
      yield permutation.slice();
    } else {
      c[i] = 0;
      ++i;
    }
  }
}

const part1 = async (memory) => {
  let max = 0;
  for(const sequence of permute([0, 1, 2, 3, 4])) {
    max = Math.max(max, await intcodeSequence.run(memory, sequence));
  }
  return max
};

const part2 = async (memory) => {
  let max = 0;
  for(const sequence of permute([5, 6, 7, 8, 9])) {
    max = Math.max(max, await intcodeSequence.loop(memory, sequence));
  }
  return max
};

intcode.loadFromFile(program)
  .then(async (memory) => {
    await part1(memory).then(max => console.log('max thrusters (no loop): ', max));
    await part2(memory).then(max => console.log('max thrusters (loop): ', max));
  })

