const fs = require('fs');

const read = file => new Promise((resolve, reject) => (
  fs.readFile(file, { encoding: 'utf8' }, (err, content) => (
    err ? reject(err) : resolve(content)
  ))
));

module.exports = {
  read,
};
