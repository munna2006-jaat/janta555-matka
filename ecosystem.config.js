// PM2 Process Manager Configuration for GoldMatka Production
module.exports = {
  apps: [
    {
      name: 'goldmatka-backend',
      script: 'node_modules/.bin/tsx',
      args: 'server/src/index.ts',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5050
      }
    }
  ]
};
