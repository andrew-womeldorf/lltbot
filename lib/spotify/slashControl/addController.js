/**
*Search Spotify for the track, and respond based on how many items returned
0: sorry message
1: add to the playlist
2+: list up to 20.  ***Add more button?
If 2+, user can select one track by using the /select command.
----
todo:
clear stored tracks each time /add is called
add interactive message button to get the next page, and ~add~ that to the storage (don't replace)
*/
module.exports = function(controller, spotifyApi, localConfig, bot, message){
    console.log('--------------');
    console.log('/add');

    if (message.token !== localConfig.slackapp.verifyToken) return;
    console.log('token is fine');

    var track = message.text;
    console.log('Add Text: ' + track);

    if (track === '') {
        bot.replyPrivate(message,
            'I will add a track to the playlist for you.\n' +
            'If you have a Spotify Song ID, try typing `/add [song id]`\n' +
            "If you don't have the ID, try typing `/add [name of song]`");
        console.log('User did not use a term');
        return;
    }

    spotifyApi.searchTracks(track)
        .then(function(data){
            console.log('searched.  Returning data from Spotify');
            switch (data.body.tracks.items.length) {
                case 0:
                    bot.replyPrivate(message, "Sorry, I didn't find anything matching that :cry:");
                    console.log('No tracks found');
                    break;
                case 1:
                    console.log('Found one matching track.  trying to add.');
                    var item = data.body.tracks.items[0];
                    var addTrack = 'spotify:track:' + item.id;
                    bot.replyPrivate(message, 'Attempting to add ' + item.name + ' by ' + item.artists[0].name + ' [' + item.album.name + '] to the playlist.');
                    spotifyApi.addTracksToPlaylist(localConfig.spotify.userId, localConfig.spotify.playlistId, [addTrack])
                        .then(function(data){
                            console.log('Added track to playlist!');
                            bot.replyPrivate(message, 'I have added ' + item.name + ' by ' + item.artists[0].name + ' [' + item.album.name + '] to the playlist :thumbsup:')
                        }, function(err) {
                            bot.replyPrivate(message, 'Something went wrong.');
                            console.log('something went wrong...', err);
                        });
                    break;
                default:
                    console.log('Did not find 0 or 1 matching tracks.  Default switch');
                    var example = data.body.tracks.items[2];
                    var myRes = 'Choose a track, then type the id with the `/select` command:\n' +
                        'Example: `/select 2` will add ' + example.name + ' by ' + example.artists[0].name + ' (' + example.album.name + ')\n';
                    data.body.tracks.items.forEach(function(el, index, arr){
                        myRes += index + '. ' + el.name + ' by ' + el.artists[0].name + ' (' + el.album.name + ')\n';
                    });
                    console.log('Prepared message for the user');
                    controller.storage.users.get(message.user_id, function(err, user) {
                        console.log('Saving to the database');
                        isnew = false;
                        if (!user) {
                            isnew = true;
                            user = {
                                id: message.user_id,
                                team_id: message.team_id,
                                user: message.user,
                                tracks: data.body.tracks.items,
                            };
                            console.log('First Time user has added to database');
                        } else {
                            user.tracks = data.body.tracks.items;
                            console.log('User has added tracks to database before.  Updated');
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
