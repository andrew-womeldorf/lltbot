var localConfig = require('../local-config');

module.exports = function(controller, spotifyApi){
    controller.on('slash_command', function (bot, message) {
        switch (message.command) {

            case '/add':
                if (message.token !== localConfig.slackapp.verifyToken) return; //just ignore it.
                if (message.text === '' || message.text === 'help') {
                    bot.replyPrivate(message,
                        'I will add a track to the playlist for you.\n' +
                        'If you have a Spotify Song ID, try typing `/add [song id]`\n' +
                        "If you don't have the ID, try typing `/add [name of song]`");
                    return;
                } else {
                    var track = message.text;
                    spotifyApi.searchTracks(track)
                        .then(function(data){
                            // console.log(message);
                            var myRes = 'Enter the number of the track you want:\n';
                            switch (data.body.tracks.items.length) {
                                case 0:
                                    bot.replyPrivate(message, "Sorry, I didn't find anything matching that :cry:");
                                    break;
                                case 1:
                                    var item = data.body.tracks.items[0];
                                    var addTrack = 'spotify:track:' + item.id;
                                    bot.replyPrivate(message, 'Attempting to add ' + item.name + ' by ' + item.artists[0].name + ' [' + item.album.name + '] to the playlist.');
                                    spotifyApi.addTracksToPlaylist(localConfig.spotify.userId, localConfig.spotify.playlistId, [addTrack])
                                        .then(function(data){
                                            console.log('Added track to playlist!');
                                            bot.replyPrivate(message, 'I have added this to the playlist :thumbsup:')
                                        }, function(err) {
                                            console.log('something went wrong...', err);
                                        });
                                    break;
                                default:
                                    data.body.tracks.items.forEach(function(el, index, arr){
                                        myRes += index + '. ' + el.name + ' by ' + el.artists[0].name + ' (' + el.album.name + ')\n';
                                    });
                                    controller.storage.users.get(message.user_id, function(err, user) {
                                        isnew = false;
                                        if (!user) {
                                            isnew = true;
                                            user = {
                                                id: message.user_id,
                                                team_id: message.team_id,
                                                user: message.user,
                                                tracks: data.body.tracks.items,
                                            };
                                        } else {
                                            user.tracks = data.body.tracks.items;
                                        }
                                        controller.storage.users.save(user, function(err, id) {
                                            if (err) {
                                                controller.log.error('An error occurred while saving a user: ', err);
                                            } else {
                                                controller.log('Successfully saved user data');
                                            }
                                        });
                                    });

                                    bot.replyPrivate(message, myRes);
                            }
                        }, function(err){
                            bot.replyPrivate('There was an error:\n' + err);
                            console.error(err);
                        });

                }
                break;


            case '/select':
                if (message.token !== localConfig.slackapp.verifyToken) return;
                if (message.text === '' || message.text === 'help') {
                    bot.replyPrivate(message,
                        'Type the number of your selection after the slash command\n' +
                        'Example: `/select 5` will select the fifth option');
                    return;
                } else {
                    var trackSelect = message.text;
                    // check: user has stored data
                    // check: trackSelect is a number
                    // check: trackSelect is an existing index in the stored array
                        // get: uri (returns 'spotify.track:xxxxxxxxx')
                        // do action! utz utz utz.
                }
                break;


            case '/drop':
                if (message.token !== localConfig.slackapp.verifyToken) return; //just ignore it.
                if (message.text === '' || message.text === 'help') {
                    var reply = {
                        text: 'This is an interactive message from Andrews code',
                        attachments: [],
                    }
                    bot.replyInteractive(message, reply);

                    return;
                }
                break;


            default:
                bot.replyPrivate(message, "I'm afraid I don't know how to " + message.command + ' yet.');
        }
    });
}
/*
I could have the user do an /add [trackname].
If more than one, store the results in that user's json file.
The next time that user calls /select [tracknumber], check it against the array in that user's json file.
*/
