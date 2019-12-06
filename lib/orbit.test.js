const test = require('ava');
const orbit = require('./orbit');

const sampleData = `COM)B
B)C
C)D
D)E
E)F
B)G
G)H
D)I
E)J
J)K
K)L`;

test('can calculate direct and indirect orbits from sample', (t) => {
  const root = orbit.loadFromString(sampleData);
  t.is(orbit.count(root), 42);
});


test('sample data individual counts are correct', (t) => {
  const root = orbit.loadFromString(sampleData);
  const { COM, D, L } = root;

  t.deepEqual(orbit.countFromNode(D), {
    direct: 1,
    indirect: 2,
  });

  t.deepEqual(orbit.countFromNode(L), {
    direct: 1,
    indirect: 6,
  });

  t.deepEqual(orbit.countFromNode(COM), {
    direct: 0,
    indirect: 0,
  });
});
