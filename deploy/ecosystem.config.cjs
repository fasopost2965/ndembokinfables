module.exports = {
  apps: [
    {
      name: 'ndembo-crm-api',
      script: 'src/index.js',
      cwd: '/var/www/ndembo-crm/crm-api',
      instances: 1,
      exec_mode: 'fork',
      node_args: '--experimental-vm-modules',
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: '/var/log/pm2/crm-api-error.log',
      out_file: '/var/log/pm2/crm-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      watch: false,
      max_memory_restart: '256M',
      restart_delay: 3000,
    },
  ],
};
