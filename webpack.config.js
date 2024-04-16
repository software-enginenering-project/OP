const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/scripts/snake.js', // 请确保入口文件路径正确
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      // 你可能还需要其他的loader来处理CSS和图片等
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/snake.html',
      filename: 'index.html'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/images', to: 'images' },
        { from: 'src/css', to: 'css' },
        // 根据需要复制其他静态资源
      ]
    }),
    // 根据需要添加其他插件
  ],
  devServer: {
    contentBase: './dist',
    open: true // 如果你希望webpack-dev-server自动打开浏览器
  }
};
