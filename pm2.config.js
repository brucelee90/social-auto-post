module.exports = {
    apps: [
        {
            name: 'Express',
            script: 'npm run dev:remix',
            watch: ['build/index.js'],
            watch_options: {
                followSymlinks: false
            },
            env: {
                NODE_ENV: 'development'
            }
        },
        {
            name: 'Shopify',
            // script: 'npm run start -- --tunnel-url=https://0afc-2a01-5241-46d-bd00-00-c89f.ngrok-free.app:8080',
            script: 'npm run dev',
            ignore_watch: ['.'],
            env: {
                NODE_ENV: 'development'
            }
        }
    ]
};
