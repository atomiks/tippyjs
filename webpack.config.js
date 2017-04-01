const path              = require('path')
const webpack           = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const extractSass = new ExtractTextPlugin({
  filename: "tippy.css",
  disable: process.env.NODE_ENV === "development"
});

module.exports = {
  entry: ['./app.js'],
  output: {
    path: path.join(__dirname, 'js'),
    filename: 'tippy.js'
  },
  module: {
    rules: [{
      test: /\.scss$/,
      use: extractSass.extract({
        use: [
          {
            loader: "css-loader",
            options: {
              minimize: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                require('autoprefixer')({ browsers: ['>0.5%'] })
              ]
            }
          },
          {
            loader: "sass-loader"
          }
        ],
        fallback: "style-loader"
      })
    }, {
      test: /\.js$/,
      use: [
        {
          loader: 'babel-loader',
          options: { presets: ['es2015'] }
        }
      ],
      exclude: /node_modules/
    }]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false,
      },
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    extractSass
  ]
}
