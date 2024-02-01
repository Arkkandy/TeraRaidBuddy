const { merge } = require('webpack-merge');
const common = require('./webpack.config.js');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  //devtool: 'source-map',
  /*module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: './tsconfig.prod.json' // Specify your prod-specific TS config file
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },*/
  optimization: {
    minimizer: [new TerserPlugin()],
  },
});