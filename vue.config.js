var path = require('path')
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
module.exports = {
    configureWebpack: {
        performance: {
            maxEntrypointSize: 512000,
            maxAssetSize: 512000,
            hints: process.env.NODE_ENV === 'production' ? 'warning' : false
        },
        resolve: {
            alias: {
                'CanvasKitInit': path.resolve('node_modules', '@2dimensions/flare-js/canvaskit/canvaskit.js'),
                '~': path.resolve('src', ''),
            },
        },
        plugins: [
            new CopyPlugin([
                { from: path.resolve('node_modules', '@2dimensions/flare-js/canvaskit/canvaskit.wasm')}
            ]),
            new webpack.ProvidePlugin({
                CanvasKitInit: 'CanvasKitInit',
                'window.CanvasKitInit': 'CanvasKitInit'
            })
        ]
    },
    chainWebpack: config => {
        // console.info(process.env.NODE_ENV)
        config.optimization.minimize(process.env.NODE_ENV === 'production')
    }
}
