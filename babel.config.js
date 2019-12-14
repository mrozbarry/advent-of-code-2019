module.exports = {
  presets: [
    ['env', {
      targets: {
        browsers: [
          'last 2 Chrome versions',
        ],
      },
    }],
  ],
  plugins: [
    ['@babel/transform-runtime', {
      corejs: 2,
      regenerator: true,
    }],
  ],
};
