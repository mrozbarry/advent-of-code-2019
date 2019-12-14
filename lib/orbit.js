const { read } = require('./file');

const loadFromString = (string) => string
  .trim()
  .split('\n')
  .map(line => line.split(')'))
  .reduce((currBuffer, [a, b]) => add(a, b, currBuffer), {});

const loadFromFile = file => read(file).then(loadFromString);


const getNode = (id, buffer) => {
  if (!id) {
    // throw new Error('Cannot create a node with an empty id');
    console.warn('Cannot create a node with an empty id');
  }
  if (!buffer[id]) {
    buffer[id] = { id, children: [], parent: null };
  }
  return buffer[id];
};

const add = (a, b, buffer) => {
  const node = getNode(a, buffer);
  const child = getNode(b, buffer);
  node.children.push(child);
  child.parent = node;
  return buffer;
};

const getParent = node => node && node.parent;

const countFromNode = (fromNode) => {
  if (!fromNode) return 0;
  const direct = fromNode.parent ? 1 : 0;
  let indirect = 0;
  let node = getParent(getParent(fromNode));
  while (node) {
    indirect++;
    node = getParent(node);
  }

  return { direct, indirect };
}

const count = (buffer) => {
  return Object.keys(buffer).reduce((sum, nodeKey) => {
    const { direct, indirect } = countFromNode(buffer[nodeKey]);
    return sum + direct + indirect;
  }, 0);
};

module.exports = {
  count,
  countFromNode,
  loadFromString,
  loadFromFile,
};
