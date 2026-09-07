import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // La app es 100% cliente: se exporta como HTML/CSS/JS estático
  // para poder servirla desde un hosting por FTP, sin servidor Node.
  output: "export",
};

export default nextConfig;
