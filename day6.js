const path = require('path');
const maybe = require('./lib/maybe');
const orbit = require('./lib/orbit');

const orbitFile = path.resolve(__dirname, 'day6.orbits');

orbit.loadFromFile(orbitFile)
  .then(orbit.count)
  .then(v => console.log('count: ', v));

const traverse = (prev, node, count) => {
  if (!node) return maybe.nothing();

  if (node.id === 'SAN') return maybe.just(count - 1);

  const targets = [
    node.parent,
    ...node.children,
  ].filter(n => n && n !== prev);

  for(const target of targets) {
    const maybeHit = traverse(node, target, count + 1)
    const result = maybe.match({
      [maybe.Just]: v => v
    }, maybeHit);
    if (typeof result !== 'undefined') {
      return maybe.just(result);
    }
  }

  return maybe.nothing();
}

orbit.loadFromFile(orbitFile)
  .then((nodes) => {
    const youOrbit = nodes.YOU.parent;
    return traverse(null, youOrbit, 0);
  })
  .then(count => console.log('Orbit traverses:', count));
