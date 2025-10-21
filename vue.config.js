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
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                // 如果后端有 context-path，可在此重写
                pathRewrite: { '^/api': '/api' },
                ws: false,
                logLevel: 'debug'
            }
        }
    }
}
