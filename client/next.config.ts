import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed 'output: export' to enable SSR for AWS Amplify deployment
  // AWS Amplify natively supports Next.js SSR with dynamic routes
};

export default nextConfig;
