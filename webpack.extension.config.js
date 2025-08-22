const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env) => {
  const browser = env.browser || 'chrome';
  
  return {
    mode: 'production',
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
      globalObject: 'this'
    },
    
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx']
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
          use: ['style-loader', 'css-loader', 'postcss-loader']
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
              manifest.name = 'PayCio Wallet';
              manifest.action.default_title = 'PayCio Wallet';
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
      })
    ],
    
    optimization: {
      minimize: false, // Disable minification for debugging
      splitChunks: false // Disable code splitting for extensions
    }
  };
}; 