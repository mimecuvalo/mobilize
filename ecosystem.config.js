module.exports = {
  _comment: 'This is used by pm2 on production.',
  apps: [
    {
      name: 'mobilize',
      script: 'npm run serve:prod',
    },
  ],
};
