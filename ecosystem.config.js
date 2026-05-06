module.exports = {
  apps: [
    {
      name: 'nferio-fiscal-service',
      script: 'xvfb-run',
      args: '--auto-servernum --server-args="-screen 0 1024x768x24" npx ts-node src/fiscal-server.ts',
      cwd: './backend',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
