import { Configuration, DefinePlugin, ResolvePluginInstance, WebpackPluginInstance } from 'webpack';
import { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserJSPlugin from 'terser-webpack-plugin';
import { ConsoleRemotePlugin } from '@openshift-console/dynamic-plugin-sdk-webpack';

const NODE_ENV: Configuration['mode'] = process.env.NODE_ENV === 'production' ? 'production' : 'development';

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
  plugins: [
    new CopyPlugin({
      patterns: [{ from: '../../libs/i18n/locales', to: 'locales' }],
    }),
    // Plugin uses react-router-dom 5.3.x and Console provides 5.3.x at runtime.
    // When building the app, the ConsoleRemotePlugin sees the package from root node_modules that has v6.x
    // We disable validation to avoid build errors.
    new ConsoleRemotePlugin({ validateSharedModules: false }),
  ] as unknown as WebpackPluginInstance[],
  resolve: {
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, './tsconfig.json'),
      }),
    ] as unknown as ResolvePluginInstance[],
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
    ] as unknown as WebpackPluginInstance[],
  };
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
      'window.FCTL_API_PORT': '9000',
    }),
  );
}

export default config;
