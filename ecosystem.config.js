module.exports = {
  apps: [
    {
      name: 'nferio-backend',
      script: 'npm',
      args: 'run dev', // Ou 'start' se você já estiver usando a pasta /dist
      cwd: './backend',
      env: {
        NODE_ENV: 'production',
        PORT: 3333
      }
    },
    {
      name: 'nferio-frontend',
      script: 'npm',
      args: 'run dev', // Ou 'start' se estiver usando o build
      cwd: './frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 5173
      }
    }
  ]
};
