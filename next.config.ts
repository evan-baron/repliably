import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          // --- XSS Protection ---
          // Tells browsers: "Only execute scripts/styles/images from sources I explicitly allow."
          // Without this, an attacker who injects <script>evil()</script> into your page
          // (via a form field, URL param, etc.) can steal user sessions, redirect to phishing
          // sites, or act as the user. CSP is the single most important security header.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com https://cdn.tiny.cloud",
              "style-src 'self' 'unsafe-inline' https://cdn.tiny.cloud",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https://cdn.tiny.cloud",
              "connect-src 'self' https://*.pusher.com wss://*.pusher.com https://*.auth0.com https://cdn.tiny.cloud https://sp.tinymce.com https://www.googleapis.com https://api.openai.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },

          // --- Clickjacking Protection ---
          // Tells browsers: "Never allow my site to be loaded inside an <iframe>."
          // Without this, an attacker can create a page that loads YOUR site in a hidden
          // iframe, then overlays fake buttons. When the user clicks what they think is
          // the attacker's page, they're actually clicking buttons on YOUR site — like
          // "Delete Account" or "Deactivate All Sequences." This is called clickjacking.
          // frame-ancestors in CSP does the same thing but X-Frame-Options is the fallback
          // for older browsers.
          {
            key: "X-Frame-Options",
            value: "DENY",
          },

          // --- MIME Sniffing Protection ---
          // Tells browsers: "Trust the Content-Type header I send you. Don't guess."
          // Without this, a browser might look at a file you serve (say, a user-uploaded
          // .txt file) and decide "this looks like HTML" and EXECUTE it. An attacker
          // uploads a file containing <script>steal_cookies()</script>, the browser
          // "sniffs" it as HTML, and now their script runs on your domain with access
          // to your users' cookies.
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },

          // --- HTTPS Enforcement ---
          // Tells browsers: "For the next 2 years, ALWAYS use HTTPS for my site.
          // Never even try HTTP." Without this, a user on public WiFi could be
          // intercepted during an HTTP request before the redirect to HTTPS happens.
          // The attacker sees the session cookie, auth tokens — everything.
          // includeSubDomains covers *.repliably.com too.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },

          // --- Referrer Control ---
          // Tells browsers: "When a user clicks a link from my site to another site,
          // only send my domain — not the full URL." Without this, if a user is on
          // /dashboard/contacts/42 and clicks an external link, the other site sees
          // the full URL in the Referer header, potentially leaking internal paths
          // and contact IDs.
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          // --- Browser Feature Restrictions ---
          // Tells browsers: "Don't let my site use the camera, microphone, geolocation,
          // etc." Even if an attacker injects code, they can't activate the webcam or
          // track location. You don't need these features for an email automation tool,
          // so lock them down.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
