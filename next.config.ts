import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Permite que /admin (sin extensión) cargue el index.html estático
      // de Decap CMS en public/admin/index.html.
      {
        source: "/admin",
        destination: "/admin/index.html",
      },
    ];
  },
};

export default nextConfig;
