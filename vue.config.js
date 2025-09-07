module.exports = {
    // 是否为生产环境构建生成 source map？
    productionSourceMap: false,
    configureWebpack: {
        externals: {
            "AMap": "AMap"
        }
    },
    // webpack-dev-server 相关配置
    devServer: {
        // host: "localhost",
        open: true,
        port: 8001,
    }
}
