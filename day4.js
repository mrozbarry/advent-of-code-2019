const password = require('./lib/password');

const inputs = [236491, 713787];

console.log(
  'First star:',
  password.combinations(...inputs, password.firstStarValidators),
);

console.log(
  'Second star:',
  password.combinations(...inputs, password.secondStarValidators),
);
