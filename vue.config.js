module.exports = {
    // 是否为生产环境构建生成 source map？
    productionSourceMap: false,
    configureWebpack: {
        externals: {
            "AMap": "AMap"
        }
    },
    chainWebpack: config => {
        // 添加对 SVG 使用 raw-loader
        config.module
            .rule('svg-raw')
            .test(/\.svg$/)
            .use('raw-loader')
            .loader('raw-loader')
            .end()
    },
    // webpack-dev-server 相关配置
    devServer: {
        // host: "localhost",
        open: true,
        port: 8001,
    }
}
