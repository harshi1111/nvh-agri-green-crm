import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Remove reactCompiler for now - we'll add it back if needed */
  // reactCompiler: true,
  
  /* Add image configuration for production */
  images: {
    unoptimized: true,
  },
  
  /* Remove experimental for production stability */
  // experimental: {
  //   turbo: {
  //     root: ".",
  //   },
  // },
};

export default nextConfig;