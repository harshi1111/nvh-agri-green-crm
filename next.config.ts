import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Add image configuration for production */
  images: {
    unoptimized: true,
  },
  
  /* Skip linting and type checking during build */
  experimental: {
    esmExternals: true, // This helps with external packages
  },
  
  /* Add webpack config to handle html2canvas/jspdf during build */
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude client-side libraries from server build
      config.externals = [...(config.externals || []), 
        'html2canvas', 
        'jspdf',
        'canvas'
      ];
    }
    
    return config;
  },
};

export default nextConfig;