const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { DefinePlugin } = require('webpack');

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
        '@': path.resolve(__dirname, 'src')
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
            from: 'src/popup/popup.html',
            to: 'popup.html'
          },
          {
            from: 'src/options/options.html',
            to: 'options.html'
          },
          {
            from: 'src/assets',
            to: 'assets'
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
        'process.env.WALLETCONNECT_PROJECT_ID': JSON.stringify(process.env.WALLETCONNECT_PROJECT_ID || '')
      })
    ],
    
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