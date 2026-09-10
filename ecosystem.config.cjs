/**
 * pm2 process definition for the production server.
 *
 * nginx (aaPanel) terminates TLS and reverse-proxies to this process, so Next
 * binds to loopback only — port 3000 never needs to be open in the firewall.
 *
 * Deploy:
 *   npm ci
 *   npx prisma migrate deploy
 *   npm run build
 *   pm2 startOrReload ecosystem.config.cjs
 */
const fs = require("node:fs");
const path = require("node:path");

const LOG_DIR = process.env.SPLIZO_LOG_DIR || path.join(__dirname, "logs");

// pm2 will not start if it cannot open its log files.
fs.mkdirSync(LOG_DIR, { recursive: true });

module.exports = {
  apps: [
    {
      name: "splizo",
      cwd: __dirname,
      // Call Next's bin directly rather than `npm start` so pm2 supervises the
      // server itself instead of an npm wrapper that swallows signals.
      script: path.join(__dirname, "node_modules/next/dist/bin/next"),
      args: "start -H 127.0.0.1 -p 3000",
      interpreter: "node",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_memory_restart: "600M",
      kill_timeout: 5000,
      // .env is read by Next itself at startup; keep only what pm2 must set.
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      error_file: path.join(LOG_DIR, "splizo-error.log"),
      out_file: path.join(LOG_DIR, "splizo-out.log"),
      time: true,
    },
  ],
};
