const path = require("path");
const webpack = require("webpack");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//   .BundleAnalyzerPlugin;
module.exports = {
  outputDir: path.resolve(__dirname, "../wwwroot"),
  chainWebpack: (config) => {
    // lazyload 한번에 리소스를 다운받기보다는 해당라우터에서 필요한 리로스만 다운받을수있도록
    config.plugins.delete("prefetch");
  },
  configureWebpack: {
    // 배포를 할때 여러개의 chunk css와js를 하나로 압축함, 빌드된 js의 용량크기를 줄여줌
    // 한개로 축소하는대신 각 컴포넌트의 scss 파일을 minify하는데 충돌이 얼어남(import 순서에따라서... warning 나오는순서대로 맞춰주기)
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      // 번들된 파일들의 용량을 보여주는 ui 플러그인
      // new BundleAnalyzerPlugin(),
    ],
    // 웹펙이 추천해주는 힌트 제거
    performance: {
      hints: false,
    },
    resolve: {
      alias: {
        "@": path.join(__dirname, "src/"),
      },
    },
  },
  runtimeCompiler: true,
  filenameHashing: false,
  productionSourceMap: false,
};
