/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "blessingapi.ebslonserver3.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "blessingadmin.ebslonserver3.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3059",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
