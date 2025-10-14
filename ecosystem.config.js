module.exports = {
    apps: [{
        name: 'shinkan',
        script: './src/index.js',
        watch: false,
        instances: 1,
        autorestart: true,
        max_memory_restart: '200M',
        env: {
            NODE_ENV: 'production'
        },
        error_file: './logs/error.log',
        out_file: './logs/output.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }]
};
