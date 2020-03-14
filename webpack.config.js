const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRootPlugin = require("html-webpack-root-plugin");

module.exports = (env, argv) => {
  console.log(env, argv);
  return {
    mode: "development",
    entry: "./src/index.tsx",
    module: {
      rules: [
        {
          test: /\.(j|t)sx?$/,
          loader: "babel-loader",
          exclude: /[\\/]node_modules[\\/]/
        },
        {
            test: /\.(png|jpe?g|gif)$/i,
            use: [
                {
                loader: 'file-loader',
                },
            ],
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
              },
      ]
    },
    resolve: {
      extensions: [".ts", ".tsx", ".wasm", ".mjs", ".js", ".json"]
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: "Algorithm Zoo"
      }),
      new ReactRootPlugin()
    ]
  };
};
