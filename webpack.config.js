const path              = require('path')
const webpack           = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const extractSass = new ExtractTextPlugin('tippy/tippy.css');

module.exports = {
  entry: ['./app.js'],
  output: {
    path: path.join(__dirname, 'docs/testing'),
    filename: 'tippy/tippy.js'
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
          options: {
            presets: ['es2015'],
            plugins: ['transform-object-rest-spread']
          }
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
