const test = require('ava');
const password = require('./password');

test('valid succeeds for all first star sample inputs', (t) => {
  t.truthy(password.valid('111111', password.firstStarValidators));
  t.falsy(password.valid('223450', password.firstStarValidators));
  t.falsy(password.valid('123789', password.firstStarValidators));
});

test.only('valid succeeds for all second star sample inputs', (t) => {
  t.truthy(password.valid('112233', password.secondStarValidators));
  t.falsy(password.valid('123444', password.secondStarValidators));
  t.truthy(password.valid('111122', password.secondStarValidators));
});
