const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const dotenv = require('dotenv');

// Load environment variables
const env = dotenv.config().parsed || {};

// Create a secure config object for the browser extension
const createSecureConfig = () => {
  return {
    INFURA_PROJECT_ID: env.INFURA_PROJECT_ID || '',
    ETHERSCAN_API_KEY: env.ETHERSCAN_API_KEY || '',
    ALCHEMY_API_KEY: env.ALCHEMY_API_KEY || '',
    COINGECKO_API_KEY: env.COINGECKO_API_KEY || '',
    OPENSEA_API_KEY: env.OPENSEA_API_KEY || ''
  };
};

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const secureConfig = createSecureConfig();

  return {
    mode: isProduction ? 'production' : 'development',
    entry: {
      popup: './src/popup/index.tsx',
      background: './src/background/index.ts',
      content: './src/content/index.ts',
      injected: './src/injected/index.ts',
      options: './src/options/index.tsx'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader'
          ]
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/,
          type: 'asset/resource'
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    plugins: [
      // Inject environment variables securely
      new webpack.DefinePlugin({
        'window.ENV_CONFIG': JSON.stringify(secureConfig),
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
      }),
      
      // Copy manifest and HTML files
      new CopyWebpackPlugin({
        patterns: [
          { from: 'manifest.json', to: 'manifest.json' },
          { from: 'src/popup/popup.html', to: 'popup.html' },
          { from: 'src/options/options.html', to: 'options.html' },
          { from: 'src/ui/popup.html', to: 'ui/popup.html' }
        ]
      }),
      
      // HTML plugins for popup and options
      new HtmlWebpackPlugin({
        template: './src/popup/popup.html',
        filename: 'popup.html',
        chunks: ['popup'],
        inject: false
      }),
      
      new HtmlWebpackPlugin({
        template: './src/options/options.html',
        filename: 'options.html',
        chunks: ['options'],
        inject: false
      }),
      
      // Extract CSS
      new MiniCssExtractPlugin({
        filename: '[name].css'
      })
    ],
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction
            }
          }
        })
      ],
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      }
    },
    devtool: isProduction ? false : 'cheap-module-source-map',
    watch: !isProduction,
    watchOptions: {
      ignored: /node_modules/
    }
  };
}; 