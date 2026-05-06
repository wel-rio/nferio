module.exports = {
  apps: [
    {
      name: 'nferio-backend',
      script: 'xvfb-run',
      args: '--auto-servernum --server-args="-screen 0 1024x768x24" npm run dev',
      cwd: './backend',
      env: {
        NODE_ENV: 'production',
        PORT: 3333
      }
    },
    {
      name: 'nferio-frontend',
      script: 'npm',
      args: 'run dev',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 5173
      }
    }
  ]
};
