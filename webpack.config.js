// Webpack version 5.59.1

require("dotenv").config();
const path = require("path");
const publicPath = path.join(__dirname, "public");

// Plugins
const { ProvidePlugin, IgnorePlugin } = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");
const safePostCssParser = require("postcss-safe-parser");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const InterpolateHtmlPlugin = require("interpolate-html-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
// Descomentar la linea de abajo para utilizar analisis de bundle
// const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const JsonMinimizerPlugin = require("json-minimizer-webpack-plugin");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = function (env) {
  const isEnvProduction = env.NODE_ENV === "production";
  const isEnvDevelopment = env.NODE_ENV === "development";
  return {
    mode: env.NODE_ENV,
    entry: {
      bundle: "./src/index.js",
    },
    output: {
      path: path.resolve(__dirname, "./build"),
      filename: isEnvProduction
        ? "static/js/[name].[chunkhash:8].js"
        : isEnvDevelopment && "[name].js",
      chunkFilename: "static/js/[chunkhash:8].chunk.js",
    },
    optimization: Object.assign(
      {},
      isEnvProduction && {
        minimizer: [
          new TerserJSPlugin({
            parallel: true,
          }),
          new UglifyJsPlugin(),
          new CompressionPlugin(),
          new JsonMinimizerPlugin(),
          new CssMinimizerPlugin({
            parallel: true,
          }),
          new OptimizeCSSAssetsPlugin({
            cssProcessorOptions: {
              parser: safePostCssParser,
              map: {
                inline: false,
                annotation: true,
              },
            },
            cssProcessorPluginOptions: {
              preset: [
                "default",
                { minifyFontValues: { removeQuotes: false } },
              ],
            },
          }),
        ],
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            default: false,
            vendors: false,
            styles: {
              name: "styles",
              test: /\.s?css$/,
              minChunks: 1,
            },
          },
        },
        runtimeChunk: {
          name: function (entrypoint) {
            return `runtime-${entrypoint.name}`;
          },
        },
      }
    ),
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
    resolve: {
      alias: {
        // Instalar preact si se desea usar en vez de react
        // react: "preact/compat",
        // "react-dom": "preact/compat",
        // Define tus rutas absolutas, puedes usar una ruta absoluta de esta manera: import MyComponent from "@components/MyComponent". Ejemplos en las 3 lineas de abajo.
        // "@root": __dirname,
        // "@assets": path.resolve(__dirname, "public/assets/"),
        // "@components": path.resolve(__diranme, "src/components/")
      },
      extensions: [".js", ".jsx", ".json"],
    },
    devServer: {
      port: 3000,
      compress: true,
      historyApiFallback: true,
      static: {
        directory: publicPath,
      },
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "swc-loader",
              options: {
                minify: true,
                jsc: {
                  parser: {
                    syntax: "ecmascript",
                    jsx: true,
                  },
                },
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: isEnvDevelopment
                ? "style-loader"
                : isEnvProduction && MiniCssExtractPlugin.loader,
            },
            {
              loader: "css-loader",
              options: {
                url: false,
              },
            },
          ],
        },
        {
          test: [/\.bmp$/, /\.gif$/, /\.jpg?g$/, /\.png$/, /\.webp$/],
          loader: "url-loader",
          options: {
            limit: 10000,
            name: "static/media/[hash:8].[ext]",
          },
        },
      ],
    },
    plugins: [
      new ProvidePlugin({ React: "react" }),
      new HtmlWebpackPlugin(
        Object.assign(
          {},
          {
            inject: false,
            template: path.join(__dirname, "public/index.html"),
          },
          isEnvProduction
            ? {
                minify: {
                  removeComments: true,
                  collapseWhitespace: true,
                  removeRedundantAttributes: true,
                  useShortDoctype: true,
                  removeEmptyAttributes: true,
                  removeStyleLinkTypeAttributes: true,
                  keepClosingSlash: true,
                  minifyJS: true,
                  minifyCSS: true,
                  minifyURLs: true,
                },
              }
            : undefined
        )
      ),
      isEnvProduction
        ? new MiniCssExtractPlugin({
            filename: "static/css/[contenthash:8].css",
            chunkFilename: "static/css/[contenthash:8].chunk.css",
          })
        : function () {
            return;
          },
      new InterpolateHtmlPlugin({
        PUBLIC_URL: process.env.PUBLIC_URL ?? "",
      }),
      new CopyPlugin({
        patterns: [
          {
            from: "public",
            to: path.join(__dirname, "build"),
            globOptions: {
              ignore: ["**/index.html"],
            },
          },
        ],
      }),
      new IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      }),
      new WebpackManifestPlugin({
        fileName: "asset-manifest.json",
        publicPath: publicPath,
      })
      // isEnvDevelopment
      //   ? new BundleAnalyzerPlugin()
      //   : function () {
      //       return;
      //     },
    ],
  };
};
