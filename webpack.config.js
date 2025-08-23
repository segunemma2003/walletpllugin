const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin, ProvidePlugin } = require('webpack');

module.exports = (env) => {
  const browser = env.browser || 'chrome';

  return {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    devtool: process.env.NODE_ENV === 'production' ? false : 'inline-source-map',
    
    entry: {
      popup: './src/popup/index.tsx',
      background: './src/background/index.ts',
      content: './src/content/index.ts',
      injected: './src/injected/index.ts',
      options: './src/options/index.tsx'
    },
    
    output: {
      path: path.resolve(__dirname, `dist/${browser}`),
      filename: '[name].js',
      clean: true,
      publicPath: '',
      globalObject: 'this',
      chunkFilename: '[name].js' // Ensure consistent chunk naming
    },
    
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        'process/browser': require.resolve('process/browser')
      },
      fallback: {
        "buffer": require.resolve("buffer"),
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "util": require.resolve("util"),
        "process": require.resolve("process/browser"),
        "process/browser": require.resolve("process/browser"),
        "path": require.resolve("path-browserify"),
        "fs": false,
        "os": require.resolve("os-browserify/browser"),
        "url": require.resolve("url"),
        "querystring": require.resolve("querystring-es3"),
        "zlib": require.resolve("browserify-zlib"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "assert": require.resolve("assert"),
        "constants": require.resolve("constants-browserify"),
        "events": require.resolve("events"),
        "domain": false,
        "punycode": false,
        "tty": false,
        "vm": false,
        "worker_threads": false,
        "child_process": false,
        "cluster": false,
        "dgram": false,
        "dns": false,
        "net": false,
        "readline": false,
        "repl": false,
        "string_decoder": false,
        "sys": false,
        "timers": false,
        "tls": false,
        "v8": false
      }
    },
    
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: [
            {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
                compilerOptions: {
                  noEmit: false
                }
              }
            }
          ],
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader']
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name][ext]'
          }
                }

      ]
    },
    
    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/popup/popup.html',
        filename: 'popup.html',
        chunks: ['popup'],
        inject: 'body'
      }),
      new HtmlWebpackPlugin({
        template: 'src/options/options.html',
        filename: 'options.html',
        chunks: ['options'],
        inject: 'body'
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/manifest-v3.json',
            to: 'manifest.json',
            transform: (content) => {
              const manifest = JSON.parse(content.toString());
              
              // Browser-specific modifications
              if (browser === 'firefox') {
                manifest.manifest_version = 2;
                manifest.background = {
                  scripts: ['background.js'],
                  persistent: false
                };
                delete manifest.service_worker;
              }
              
              return JSON.stringify(manifest, null, 2);
            }
          },
          {
            from: 'src/assets',
            to: 'assets'
          },
          {
            from: 'src/popup/error-handler.js',
            to: 'error-handler.js'
          },
          {
            from: 'src/popup/process-polyfill.js',
            to: 'process-polyfill.js'
          }
        ]
      }),
      
      new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        'process.env.BROWSER': JSON.stringify(browser),
        'process.env.INFURA_PROJECT_ID': JSON.stringify(process.env.INFURA_PROJECT_ID || ''),
        'process.env.ETHERSCAN_API_KEY': JSON.stringify(process.env.ETHERSCAN_API_KEY || ''),
        'process.env.BSCSCAN_API_KEY': JSON.stringify(process.env.BSCSCAN_API_KEY || ''),
        'process.env.POLYGONSCAN_API_KEY': JSON.stringify(process.env.POLYGONSCAN_API_KEY || ''),
        'process.env.ALCHEMY_API_KEY': JSON.stringify(process.env.ALCHEMY_API_KEY || ''),
        'process.env.COINGECKO_API_KEY': JSON.stringify(process.env.COINGECKO_API_KEY || ''),
        'process.env.OPENSEA_API_KEY': JSON.stringify(process.env.OPENSEA_API_KEY || ''),
        'process.env.WALLETCONNECT_PROJECT_ID': JSON.stringify(process.env.WALLETCONNECT_PROJECT_ID || ''),
        'process.version': JSON.stringify('v16.0.0'),
        'process.platform': JSON.stringify('browser'),
        'process.browser': JSON.stringify(true),
        'global': {}
      }),
      new ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser'
      })
    ],
    
    externals: {
      'process/browser': 'process',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/592/erc20.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/592/erc20-hash.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/592/erc20-signatures.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/1101/erc20.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/1101/erc20-hash.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/1101/erc20-signatures.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/1284/erc20.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/1284/erc20-hash.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/1284/erc20-signatures.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/8453/erc20.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/8453/erc20-hash.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/8453/erc20-signatures.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/42161/erc20.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/42161/erc20-hash.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/42161/erc20-signatures.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/43114/erc20.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/43114/erc20-hash.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/43114/erc20-signatures.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/59144/erc20.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/59144/erc20-hash.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/59144/erc20-signatures.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/81457/erc20.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/81457/erc20-hash.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/81457/erc20-signatures.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/534352/erc20.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/534352/erc20-hash.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/534352/erc20-signatures.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/245022934/erc20.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/245022934/erc20-hash.json': '{}',
      '@ledgerhq/cryptoassets-evm-signatures/lib-es/data/evm/245022934/erc20-signatures.json': '{}'
    },
    
    optimization: {
      minimize: process.env.NODE_ENV === 'production',
      splitChunks: false,
      runtimeChunk: false,
      moduleIds: 'named',
      chunkIds: 'named'
    },
    
    stats: {
      errorDetails: false,
      warnings: false
    }
  };
}; 