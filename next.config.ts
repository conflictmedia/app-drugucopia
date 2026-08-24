import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";

if (isGithubActions) {
  const required = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.warn(
      `[next.config] WARNING: Missing Firebase env vars in GitHub Actions: ${missing.join(", ")}. ` +
        "Firebase sync will be broken in this build. Check repository secrets.",
    );
  } else {
    console.log(
      "[next.config] Firebase env vars present for build:",
      required.join(", "),
    );
  }
}

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: "",
  },
  // NOTE: `redirects()` was previously returned here for /dxm-calculator and
  // /kratom-calculator, but with `output: "export"` there is no Next.js
  // server at runtime, so those redirects were silently ignored and the
  // legacy links 404'd. The redirects are now real static pages under
  // src/app/dxm-calculator/ and src/app/kratom-calculator/ that emit a
  // build-time HTML redirect instead.
};

export default nextConfig;
