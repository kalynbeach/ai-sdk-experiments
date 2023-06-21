/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = [...config.externals, 'hnswlib-node']
    // config.resolve.fallback = {
    //   fs: false,
    //   path: false,
    //   http: false,
    //   https: false
    // }
    return config
  }
}

module.exports = nextConfig
