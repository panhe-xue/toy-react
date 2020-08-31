module.exports = {
  entry: {
    main: './main.js'
  },
  mode: 'development',
  modules: {
    rules: [
      {
        test: /\.js$/,
        use: [{
          loader: 'babel-loader'
        }]
      }
    ]
  },
  optimization: {
    minimize: false
  }

}