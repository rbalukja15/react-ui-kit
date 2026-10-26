/** @type {import('next').NextConfig} */
const nextConfig = {
  // A static export, so the demo can be hosted next to Storybook on GitHub
  // Pages. Every page is still rendered on the server at build time.
  output: 'export',
  // `/react-ui-kit/demo` on GitHub Pages; empty locally.
  basePath: process.env.DEMO_BASE_PATH || '',
  trailingSlash: true,
};

export default nextConfig;
