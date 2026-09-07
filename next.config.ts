import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // La app dejó de ser estática: necesita servidor para la autenticación,
  // la cuota por usuario y la llamada a OpenRouter con la clave del servidor.
  serverExternalPackages: ["pg"],
};

export default nextConfig;
