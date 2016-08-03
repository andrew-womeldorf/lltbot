// rename this as "local-config.js" and change the information below to pertain to your app.

module.exports = {
    slackapp: {
        clientId: 'xxx.yyy',
        clientSecret: 'zzzz',
        loginUri: 'http://localhost:8888/login',
        redirectUri: 'http://localhost:8888/oauth',
        verifyToken: 'xxxx',

    },
    spotify: {
        clientId: 'xxxx',
        clientSecret: 'yyyy',
        redirectUri: 'http://localhost:8888/callback',
        userId: 'xxx',
        playlistId: 'xxx'
    }
}
