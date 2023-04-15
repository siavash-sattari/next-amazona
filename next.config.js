/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  images: {
    domains: ['res.cloudinary.com']
  }
};

module.exports = nextConfig;
