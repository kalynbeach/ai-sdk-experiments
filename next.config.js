/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = [
      ...config.externals,
      'chromadb'
    ]
    // config.resolve.fallback = {
    //   ...config.resolve.fallback,
    //   fs: false,
    //   path: false,
    //   http: false,
    //   https: false,
    //   'node:fs/promises': false
    // }
    return config
  }
}

module.exports = nextConfig
