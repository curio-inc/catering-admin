/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      // 開発中のチャンク参照ズレ（Cannot find module './522.js'）を防ぐ
      config.cache = false
    }
    return config
  },
}

export default nextConfig
