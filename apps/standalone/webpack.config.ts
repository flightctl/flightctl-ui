import { Configuration, DefinePlugin, ResolvePluginInstance, WebpackPluginInstance } from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserJSPlugin from 'terser-webpack-plugin';
import * as dotenv from 'dotenv';

dotenv.config();

const BG_IMAGES_DIRNAME = 'bgimages';
const ASSET_PATH = process.env.ASSET_PATH || '/';

const NODE_ENV: Configuration['mode'] =
  process.env.NODE_ENV === 'production' ? 'production' : 'development';

const config: Configuration & {
  devServer?: WebpackDevServerConfiguration;
} = {
  mode: NODE_ENV,
  devtool: 'eval-source-map',
  devServer: {
    host: 'localhost',
    port: 9000,
    historyApiFallback: true,
    open: true,
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    client: {
      overlay: true,
    },
    devMiddleware: {
      writeToDisk: true,
      index: process.env.IS_RHEM ? 'index-rhem.html' : 'index.html',
    },
  },
  module: {
    rules: [
      {
        test: /\.(jsx?|tsx?)$/,
        exclude: /node_modules\/(?!@flightctl)/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              allowTsInNodeModules: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(svg|ttf|eot|woff|woff2)$/,
        type: 'asset/resource',
        // only process modules with this loader
        // if they live under a 'fonts' or 'pficon' directory
        include: [
          path.resolve(__dirname, 'node_modules/patternfly/dist/fonts'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/styles/assets/fonts'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/styles/assets/pficon'),
          path.resolve(__dirname, 'node_modules/@patternfly/patternfly/assets/fonts'),
          path.resolve(__dirname, 'node_modules/@patternfly/patternfly/assets/pficon'),
        ],
      },
      {
        test: /\.svg$/,
        type: 'asset/inline',
        include: (input) => input.indexOf('background-filter.svg') > 1,
        use: [
          {
            options: {
              limit: 5000,
              outputPath: 'svgs',
              name: '[name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        // only process SVG modules with this loader if they live under a 'bgimages' directory
        // this is primarily useful when applying a CSS background using an SVG
        include: (input) => input.indexOf(BG_IMAGES_DIRNAME) > -1,
        type: 'asset/inline',
      },
      {
        test: /\.svg$/,
        // only process SVG modules with this loader when they don't live under a 'bgimages',
        // 'fonts', or 'pficon' directory, those are handled with other loaders
        include: (input) =>
          input.indexOf(BG_IMAGES_DIRNAME) === -1 &&
          input.indexOf('fonts') === -1 &&
          input.indexOf('background-filter') === -1 &&
          input.indexOf('pficon') === -1,
        use: {
          loader: 'raw-loader',
          options: {},
        },
      },
      {
        test: /\.(jpg|jpeg|png|gif)$/i,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'src/assets/images'),
          path.resolve(__dirname, '../../libs/ui-components/assets'),
          path.resolve(__dirname, 'node_modules/patternfly'),
          path.resolve(__dirname, 'node_modules/@patternfly/patternfly/assets/images'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-styles/css/assets/images'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/styles/assets/images'),
          path.resolve(
            __dirname,
            'node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css/assets/images',
          ),
          path.resolve(
            __dirname,
            'node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css/assets/images',
          ),
          path.resolve(
            __dirname,
            'node_modules/@patternfly/react-inline-edit-extension/node_modules/@patternfly/react-styles/css/assets/images',
          ),
        ],
        type: 'asset/inline',
      },
    ],
  },
  output: {
    filename: '[name].bundle-[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: ASSET_PATH,
    chunkFilename: '[name].bundle-[contenthash].js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'index.html'),
      filename: 'index.html',
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'index-rhem.html'),
      filename: 'index-rhem.html',
    }),
    new CopyPlugin({
      patterns: [{ from: './src/assets/images/', to: 'images' }],
    }),
    new CopyPlugin({
      patterns: [{ from: '../../libs/i18n/locales', to: 'locales' }],
    }),
  ] as unknown as WebpackPluginInstance[],
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.jsx'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, './tsconfig.json'),
      }),
    ] as unknown as ResolvePluginInstance[],
    symlinks: false,
    cacheWithContext: false,
  },
  watchOptions: {
    followSymlinks: true,
  },
  snapshot: {
    managedPaths: [],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
};

/* Production settings */
if (NODE_ENV === 'production') {
  (config.optimization || {}).minimizer = [
    new TerserJSPlugin({}),
    new CssMinimizerPlugin({
      minimizerOptions: {
        preset: ['default', { mergeLonghand: false }],
      },
    }),
  ] as unknown as WebpackPluginInstance[];
  config.plugins?.push(
    new MiniCssExtractPlugin({
      filename: '[name]-[contenthash].css',
      chunkFilename: '[name].bundle-[contenthash].css',
    }) as unknown as WebpackPluginInstance,
  );
  config.devtool = 'source-map';
} else {
  config.plugins?.push(
    new DefinePlugin({
      'window.API_PORT': JSON.stringify(process.env.API_PORT) || '3001',
    }),
  );
}

export default config;
