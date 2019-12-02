const test = require('ava');
const sinon = require('sinon');
const fs = require('fs');
const file = require('./file');

let readFileSpy = null;

test.afterEach(() => {
  sinon.restore();
});

test.serial('it uses fs.readFile', (t) => {
  const f = 'test.foo';

  readFileSpy = sinon.replace(
    fs,
    'readFile',
    sinon.fake((a, b, fn) => {
      fn(null, '');
    }),
  );

  return file.read(f)
    .then(() => {
      t.truthy(readFileSpy.calledWith(
        f,
        { encoding: 'utf8' },
        sinon.match.any,
      ));
    });
});

test.serial('it catches exceptions', (t) => {
  const err = new Error();
  const readFileSpy = sinon.replace(
    fs,
    'readFile',
    sinon.fake((a, b, fn) => {
      fn(err);
    }),
  );

  const f = 'test.foo';

  return file.read(f)
    .catch((error) => {
      t.is(error, err);
    });
});
