const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = merge(require('./webpack.base'), {
    context: __dirname,

    entry: {
        'index': './src/index.js',
        'index.min': './src/index.js',
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: 'videoembedder',
        libraryTarget: 'umd',
    },

    externals: [
        "bootstrap-sass",
        "fontawesome",
        "jquery",
        "lodash",
        "moment",
        "simplemde",
        "vue",
    ],

    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            minimize: true,
        }),
        new ExtractTextPlugin("css/[name].css"),
        // new CopyWebpackPlugin([
        //     {from:'src/fonts',to:'fonts'}
        // ]),
    ],
});
