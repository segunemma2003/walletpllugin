const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { DefinePlugin } = require('webpack');

const config = {
  mode: 'production',
  entry: {
    popup: './src/popup/index.tsx',
    background: './src/background/index.ts',
    content: './src/content/index.ts',
    injected: './src/injected/index.ts',
    options: './src/options/index.tsx'
  },
  
  output: {
    path: path.resolve(__dirname, '../dist/chrome'),
    filename: '[name].js',
    clean: true
  },
  
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, '../src')
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
              transpileOnly: true
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      }
    ]
  },
  
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/manifest-v3.json',
          to: 'manifest.json'
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
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.BROWSER': JSON.stringify('chrome')
    })
  ],
  
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all'
        }
      }
    }
  }
};

webpack(config, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.error('Build failed:', err || stats.toString());
    process.exit(1);
  }
  
  console.log('Build completed successfully!');
  console.log('Output directory: dist/chrome/');
}); 