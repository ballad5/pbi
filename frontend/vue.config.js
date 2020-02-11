/* tslint:disable */
module.exports = {
    devServer: {
        port: 8080,
        proxy: {
            '^/api': {
                changeOrigin: true,
                target: 'http://localhost:1340'
            }
        }
    }
}
