const path = require('path');
const moons = require('./lib/moons');

const clone = json => JSON.parse(JSON.stringify(json));

const leastCommonMultiplier = (...numbers) => {
  let lcm = Math.abs(numbers[0]);
  for(let i = 1; i < numbers.length; i++) {
    let number = Math.abs(numbers[i]);
    let prev = lcm;
    while (number && lcm) {
      if (lcm > number) {
        lcm %= number;
      } else {
        number %= lcm;
      }
    }
    lcm = Math.abs(prev * numbers[i]) / (lcm + number);
  }
  return lcm;
}


const part1 = (input) => {
  let data = input;
  for(let i = 0; i < 1000; i++) {
    data = moons.step(data);
  }
  const energy = moons.calculateEnergy(data);
  console.log('part1:', { data, energy });
};

const part2 = (input) => {
  const result = moons.calculateTotalPeriod(input);
  console.log('part2:', result);
}

moons.fromFile(path.resolve(__dirname, 'day12.moons'))
  .then((input) => {
    part1(clone(input));
    part2(clone(input));
  });
