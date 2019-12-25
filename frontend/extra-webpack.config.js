const webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        SHA: JSON.stringify(process.env.GITHUB_SHA),
      },
    }),
  ],
};
