var localConfig = require('../local-config');

module.exports = function(controller, spotifyApi){
    controller.on('slash_command', function (slashCommand, message) {
        switch (message.command) {
            case '/add':
                if (message.token !== localConfig.slackapp.verifyToken) return; //just ignore it.
                if (message.text === '' || message.text === 'help') {
                    slashCommand.replyPrivate(message,
                        'I will add a track to the playlist for you.\n' +
                        'If you have a Spotify Song ID, try typing `/add [song id]`\n' +
                        "If you don't have the ID, try typing `/add [name of song]`");
                    return;
                } else {
                    var track = message.text;
                    spotifyApi.searchTracks(track)
                        .then(function(data){
                            console.log(data.body.tracks.items);
                            var myRes = 'Enter the number of the track you want:\n';
                            switch (data.body.tracks.items.length) {
                                case 0:
                                    slashCommand.replyPrivate(message, "Sorry, I didn't find anything matching that :cry:");
                                    break;
                                case 1:
                                    var item = data.body.tracks.items[0];
                                    var addTrack = 'spotify:track:' + item.id;
                                    slashCommand.replyPrivate(message, 'Attempting to add ' + item.name + ' by ' + item.artists[0].name + ' [' + item.album.name + '] to the playlist.');
                                    spotifyApi.addTracksToPlaylist(localConfig.spotify.userId, localConfig.spotify.playlistId, [addTrack])
                                        .then(function(data){
                                            console.log('Added track to playlist!');
                                            slashCommand.replyPrivate(message, 'I have added this to the playlist :thumbsup:')
                                        }, function(err) {
                                            console.log('something went wrong...', err);
                                        });
                                    break;
                                default:
                                    data.body.tracks.items.forEach(function(el, index, arr){
                                        myRes += index + '. ' + el.name + ' by ' + el.artists[0].name + ' (' + el.album.name + ')\n';
                                    });
                                    slashCommand.replyPrivate(message, myRes);
                            }
                        }, function(err){
                            slashCommand.replyPrivate('There was an error:\n' + err);
                            console.error(err);
                        });

                }
                break;
            case '/drop':
                if (message.token !== localConfig.slackapp.verifyToken) return; //just ignore it.
                if (message.text === '' || message.text === 'help') {
                    slashCommand.replyPrivate(message,
                        'test');
                    return;
                }
                break;
            default:
                slashCommand.replyPrivate(message, "I'm afraid I don't know how to " + message.command + ' yet.');
        }
    });
}
