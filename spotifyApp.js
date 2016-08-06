var Botkit = require('botkit');
var SpotifyWebApi = require('spotify-web-api-node');
var slashController = require('./lib/spotify/slashController');
var eventConfig = require('./config.js');
var localConfig = require('./local-config'); // object with my runtime info. git ignored.
var storage = require('./storage');
var port = process.env.port || 8888;


//▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// _slackApp Setup
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var slackClientId = localConfig.slackapp.clientId || process.env.slackClientId,
    slackClientSecret = localConfig.slackapp.clientSecret || process.env.slackClientSecret,
    slackVerifyToken = localConfig.slackapp.verifyToken || process.env.slackVerifyToken,
    slackScopes = ['commands', 'incoming-webhook', 'bot']

if (!slackClientId || !slackClientSecret || !slackVerifyToken) {
    console.log('Error: Specify slackClientId and slackClientSecret and slackVerifyToken in environment');
    process.exit(1);
}

var controller = Botkit.slackbot({
    // json_file_store: './db_slackbutton_slash_command/',
    storage: storage({path: './db_lltbot'}),
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
    //   bot.startPrivateConversation({user: config.createdBy},function(err,convo) {
    //     if (err) {
    //       console.log(err);
    //     } else {
    //       convo.say('I am a bot that has just joined your team');
    //       convo.say('You must now /invite me to a channel so that I can be of use!');
    //     }
    //   });
    });
  }
});

// Handle events related to the websocket connection to Slack
controller.on('rtm_open',function(bot) {
  console.log('** The RTM api just connected!');
});

controller.on('rtm_close',function(bot) {
  console.log('** The RTM api just closed');
  // you may want to attempt to re-open
});


//▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// _spotify Setup
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var spotifyClientId = localConfig.spotify.clientId || process.env.spotifyClientId,
    spotifyClientSecret = localConfig.spotify.clientSecret || process.env.spotifyClientSecret,
    spotifyRedirectUri = localConfig.spotify.redirectUri || process.env.spotifyRedirectUri,
    spotifyScopes = ['playlist-modify-public', 'playlist-modify-private'],
    spotifyState = 'any-state';

if (!spotifyClientId || !spotifyClientSecret || !spotifyRedirectUri) {
    console.log('Error: Specify clientId, clientSecret, and redirectUri in environment');
    process.exit(1);
}

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
                // webserver.emit(eventConfig.CODERECEIVED);
                console.log('webserver is working!!!');
                // res.redirect(localConfig.slackapp.loginUri);
                res.send('Webserver is Working!');
            }, function(err){
                console.log('Something went wrong!', err);
            });
        // res.send('Hello, and welcome to the callback page');
    });

});

//▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// _other
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
slashController(controller, spotifyApi);
