const test = require('ava');
const intcode = require('./intcode');
const intcodeSequence = require('./intcode.sequence');


const samples = [
  {
    sequence: [4, 3, 2, 1, 0],
    expected: 43210,
    code: [3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0]
  },
  {
    sequence: [0,1,2,3,4],
    expected: 54321,
    code: [3,23,3,24,1002,24,10,24,1002,23,-1,23,101,5,23,23,1,24,23,23,4,23,99,0,0]
  },
  {
    sequence: [1,0,4,3,2],
    expected: 65210,
    code: [3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,1002,33,7,33,1,33,31,31,1,32,31,31,4,31,99,0,0,0]
  },
];

for(const sample of samples) {
  test(`Sample with sequence ${sample.sequence.join(',')} should be ${sample.expected}`, (t) => {
    return intcodeSequence.run(sample.code, sample.sequence, 0)
      .then((output) => {
        t.is(output, sample.expected);
      });
  });
}

test('Sample with feedback loop 1', async (t) => {
  const program = intcode.loadFromString(
    '3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5',
  );

  t.is(await intcodeSequence.loop(program, [9, 8, 7, 6, 5]), 139629729);
});
