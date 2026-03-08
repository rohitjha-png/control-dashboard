module.exports = {
  apps: [
    {
      name: "control-dashboard",
      script: "node_modules/.bin/next",
      args: "start -p 3001",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
    },
  ],
};
