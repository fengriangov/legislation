module.exports = {
    apps : [{
        name: "fengri-legislation",
        script: "server.js",
        instances: "max",
        autorestart: true,
        watch: false,
        max_memory_restart: "500M",
        env_production: {
            NODE_ENV: "production"
        }
    }]
};