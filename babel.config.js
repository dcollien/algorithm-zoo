module.exports = api => {
  api.cache(true);
  return {
    presets: ['@babel/preset-react', '@babel/preset-env'],
    plugins: ['@babel/plugin-proposal-class-properties'],
    overrides: [
      {
        test: /\.tsx?$/,
        presets: ["@babel/preset-typescript"]
      }
    ]
  };
};
