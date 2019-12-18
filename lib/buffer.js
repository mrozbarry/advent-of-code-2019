const make = (size) => ({ size, data: [] });

const append = (callback, value, buffer) => {
  const data = buffer.data.concat(value);
  if (data.length === buffer.size) {
    callback(data);
    return make(buffer.size);
  }
  return { ...buffer, data };
};

module.exports = {
  make,
  append,
};
