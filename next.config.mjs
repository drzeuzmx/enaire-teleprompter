/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Vercel sets VERCEL_GIT_COMMIT_SHA automatically at build time. Exposing
    // it lets the UI show a small build stamp so it's obvious whether you're
    // looking at the latest deploy or a cached/older one.
    NEXT_PUBLIC_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA || "local",
  },
};

export default nextConfig;
