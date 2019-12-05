const asPairs = (input, size) => {
  const data = input.split('');
  const pairs = [];
  for(let index = 0; index < input.length; index++) {
    const subset = data.slice(index, index + size);
    if (subset.length !== size) {
      continue;
    }
    pairs.push(subset);
  }
  return pairs;
};

const findRepetitions = (input) => {
  const buckets = [];
  for(let start = 0; start < input.length; start++) {
    const bucket = [];
    const match = input[start];
    let end;
    for(end = start; end < input.length; end++) {
      const current = input[end];
      if (current !== match) {
        break;
      }
      bucket.push(current);
    }
    buckets.push(bucket);
    start = end - 1;
  }

  return buckets;

  return buckets.filter(bucket => bucket.length >= 2);
};

const firstStarValidators = [
  (input) => input.length === 6,
  (input) => asPairs(input, 2).some(([a, b, c]) => a === b),
  (input) => asPairs(input, 2).every(([a, b]) => b >= a),
];

const secondStarValidators = [
  (input) => input.length === 6,
  (input) => findRepetitions(input).some(arr => arr.length === 2),
  (input) => asPairs(input, 2).every(([a, b]) => b >= a),
];

const valid = (input, validators) => {
  for(const fn of validators) {
    if (!fn(input)) return false;
  }
  return true;
};

const combinations = (min, max, validators) => {
  let count = 0;
  for(let value = min; value <= max; value++) {
    if (valid(value.toString(), validators)) {
      count++;
    }
  }
  return count;
};

module.exports = {
  valid,
  combinations,
  firstStarValidators,
  secondStarValidators,
};
