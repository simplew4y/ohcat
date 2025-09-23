module.exports = {
  apps: [{
    name: 'app-3002',
    script: 'npm',
    args: 'run start',
    cwd: '/opt/ohcat',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    }
  }]
}