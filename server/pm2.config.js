module.exports = {
  apps: [{
    name: "Summit Reviews",
    script: "./server.js",
    env_production: {
      NODE_ENV: "production",
    },
    instances: "max",
    exec_mode: "cluster",
    log_date_format: "YYYY-MM-DD HH:mm Z",
    error_file: "../logs/pm2-error.log",
    out_file: "../logs/pm2-out.log",
    merge_logs: true
  }]
}