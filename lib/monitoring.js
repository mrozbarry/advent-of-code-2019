const loadFromString = map => {
  return map.split('\n').reduce((asteroids, line, y) => {
    return [
      ...asteroids,
      ...line.split('').reduce((asteroidLine, text, x) => {
        const asteroid = text === '#'
          ? [{ x, y }]
          : []

        return [...asteroidLine, ...asteroid];
      }, [])
    ];
  }, []);
}

module.exports = {
  loadFromString,
};
