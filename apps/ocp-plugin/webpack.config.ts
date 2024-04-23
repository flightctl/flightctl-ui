import { Configuration } from 'webpack';
import { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';
import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserJSPlugin from 'terser-webpack-plugin';
import { ConsoleRemotePlugin } from '@openshift-console/dynamic-plugin-sdk-webpack';

const NODE_ENV = (process.env.NODE_ENV || 'development') as Configuration['mode'];

const config: Configuration & {
  devServer?: WebpackDevServerConfiguration;
} = {
  mode: NODE_ENV,
  entry: {},
  devServer: {
    host: 'localhost',
    port: 9001,
    historyApiFallback: true,
    open: ['http://localhost:9000'],
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    client: {
      overlay: true,
    },
    devMiddleware: {
      writeToDisk: true,
    },
  },
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.(jsx?|tsx?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'tsconfig.json'),
            },
          },
        ],
      },
      {
        test: /\.s?(css)$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff2?|ttf|eot|otf)(\?.*$|$)/,
        loader: 'file-loader',
        options: {
          name: 'assets/[name].[ext]',
        },
      },
    ],
  },
  output: {
    filename: '[name].bundle-[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    chunkFilename: '[name].bundle-[contenthash].js',
  },
  plugins: [new ConsoleRemotePlugin()],
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.jsx'],
    symlinks: false,
    cacheWithContext: false,
  },
  watchOptions: {
    followSymlinks: true,
  },
  snapshot: {
    managedPaths: [],
  },
};

/* Production settings */
if (NODE_ENV === 'production') {
  config.optimization = {
    minimizer: [
      new TerserJSPlugin({}),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: ['default', { mergeLonghand: false }],
        },
      }),
    ],
  };
  config.plugins?.push(
    new MiniCssExtractPlugin({
      filename: '[name]-[contenthash].css',
      chunkFilename: '[name].bundle-[contenthash].css',
    }),
  );
  config.devtool = 'source-map';
}

export default config;
