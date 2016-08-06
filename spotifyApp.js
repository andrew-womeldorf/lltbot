var Botkit = require('botkit');
var SpotifyWebApi = require('spotify-web-api-node');
var slashController = require('./lib/spotify/slashController');
var eventConfig = require('./config.js');
var localConfig = require('./local-config'); // object with my runtime info. git ignored.
var storage = require('./storage');
storage = storage({path: './db_lltbot'});
var port = process.env.port || 8888;

//▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// _slackApp Setup
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var slackClientId = process.env.slackClientId || localConfig.slackapp.clientId,
    slackClientSecret = process.env.slackClientSecret || localConfig.slackapp.clientSecret,
    slackVerifyToken = process.env.slackVerifyToken || localConfig.slackapp.verifyToken,
    slackScopes = ['commands', 'incoming-webhook', 'bot']

if (!slackClientId || !slackClientSecret || !slackVerifyToken) {
    console.log('Error: Specify slackClientId and slackClientSecret and slackVerifyToken in environment');
    process.exit(1);
}

var controller = Botkit.slackbot({
    storage: storage,
}).configureSlackApp(
    {
        clientId: slackClientId,
        clientSecret: slackClientSecret,
        scopes: slackScopes
    }
);

// just a simple way to make sure we don't
// connect to the RTM twice for the same team
var _bots = {};
function trackBot(bot) {
  _bots[bot.config.token] = bot;
}

controller.on('create_bot',function(bot,config) {
  if (_bots[bot.config.token]) {
    // already online! do nothing.
  } else {
    bot.startRTM(function(err) {
      if (!err) {
        trackBot(bot);
      }
    });
  }
});

//▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// _spotify Setup
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var spotifyClientId = process.env.spotifyClientId || localConfig.spotify.clientId,
    spotifyClientSecret = process.env.spotifyClientSecret || localConfig.spotify.clientSecret,
    spotifyRedirectUri = process.env.spotifyRedirectUri || localConfig.spotify.redirectUri,
    spotifyScopes = ['playlist-modify-public', 'playlist-modify-private'],
    spotifyState = 'any-state';

if (!spotifyClientId || !spotifyClientSecret || !spotifyRedirectUri) {
    console.log('Error: Specify clientId, clientSecret, and redirectUri in environment');
    process.exit(1);
}

storage.spotify.get(spotifyClientId, function(err, tokens){
    if (err) return;
    spotifyApi.setAccessToken(tokens.access_token);
    spotifyApi.setRefreshToken(tokens.refresh_token);
});

var spotifyApi = new SpotifyWebApi({
    clientId : spotifyClientId,
    clientSecret : spotifyClientSecret,
    redirectUri : spotifyRedirectUri
});

var authorizeURL = spotifyApi.createAuthorizeURL(spotifyScopes, spotifyState);


//▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// _express
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
controller.setupWebserver(port, function(err, webserver){ // webserver = express()
    controller.createWebhookEndpoints(controller.webserver);

    controller.createOauthEndpoints(controller.webserver, function(err, req, res){
        if (err) {
            res.status(500).send('ERROR: ' + err);
        } else {
            res.send('Success!');
        }
    })

    webserver.get('/', function(req, res){
        res.redirect(authorizeURL);
    });

    webserver.get('/callback', function(req, res){
        spotifyApi.authorizationCodeGrant(req.query.code)
            .then(function(data){
                spotifyApi.setAccessToken(data.body['access_token']);
                spotifyApi.setRefreshToken(data.body['refresh_token']);
                var storeMe = { // This may be a poor storage method.  Will look deeper when start looking into multiple spotify accounts per team.
                    id : spotifyApi._credentials.clientId,
                    clientId : spotifyApi._credentials.clientId,
                    clientSecret : spotifyApi._credentials.clientSecret,
                    redirectUri : spotifyApi._credentials.redirectUri,
                    access_token : data.body['access_token'],
                    refresh_token : data.body['refresh_token']
                }
                storage.spotify.save(storeMe, function(err, id) {
                    if (err) {
                        console.log('An error occurred while saving to Spotify: ', err);
                        res.status(500).send(err);
                    } else {
                        console.log('Saved Spotify tokens');
                    }
                });
                console.log('webserver is working!!!');
                res.send('Webserver is Working!');
            }, function(err){
                console.log('Something went wrong!', err);
            });
    });

});

//▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// _other
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
slashController(controller, spotifyApi);
