var localConfig = require('../../local-config'),
    addController = require('./slashControl/addController'),
    selectController = require('./slashControl/selectController'),
    dropController = require('./slashControl/dropController');

module.exports = function(controller, spotifyApi){
    controller.on('slash_command', function (bot, message) {
        switch (message.command) {
            case '/add':
                addController(controller, spotifyApi, localConfig, bot, message);
                break;
            case '/select':
                selectController(controller, spotifyApi, localConfig, bot, message);
                break;
            case '/drop':
                dropController(controller, spotifyApi, localConfig, bot, message);
                break;
            default:
                bot.replyPrivate(message, "I'm afraid I don't know how to " + message.command + ' yet.');
        }
    });
}
