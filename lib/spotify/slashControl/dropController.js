/**
*Delete a track from the playlist
get: all tracks in playlist
regex: match trackSearch against list
check: number of matches
0: sorry message
1: delete from playlist
2+: list all matching tracks, then instruct how to delete one
aside: if 2+ matching tracks, and all tracks are the exact same name, delete all
----
todo:
clear the playlist (is that dangerous?)
*/

module.exports = function(controller, spotifyApi, localConfig, bot, message){
    if (message.token !== localConfig.slackapp.verifyToken) return;
    if (message.text === '' || message.text === 'help') {
        bot.replyPrivate(message,
            "I'll delete a song from the playlist.\n" +
            "Type `/drop [trackname]`.  You can type just a keyword, or the whole song name.");
        return;
    }
    var trackSearch = message.text;
    var trackSearchRegex = new RegExp(trackSearch, 'i');
    // get
    var matchingTracks = [];
    spotifyApi.getPlaylist(localConfig.spotify.userId, localConfig.spotify.playlistId)
        .then(function(data) {
            data.body.tracks.items.forEach(function (el){
                if (trackSearchRegex.test(el.track.name)) {
                    matchingTracks.push(el.track);
                }
            });
            switch (matchingTracks.length) {
                case 0:
                    bot.replyPrivate(message, 'There are no tracks matching that criteria.');
                    break;
                case 1:
                    var tracks = [{ uri : matchingTracks[0].uri }];
                    var options = { snapshot_id : data.body.snapshot_id };
                    spotifyApi.removeTracksFromPlaylist(localConfig.spotify.userId, localConfig.spotify.playlistId, tracks, options)
                        .then(function(data){
                            bot.replyPrivate(message, firstTrack + ' has been removed from the playlist!');
                            console.log(firstTrack + ' has been removed from the playlist!');
                        }, function(err){
                            bot.replyPrivate(message, 'Something went wrong!');
                            console.log('Something went wrong!', err);
                        });
                    break;
                default:
                    var allSame = true,
                        firstTrack = matchingTracks[0].name;
                    matchingTracks.forEach(function(el, index){
                        if (el.name !== firstTrack) {
                            allSame = false;
                        }
                    });
                    if (allSame) {
                        //delete all instances of that track.
                        var tracks = [{ uri : matchingTracks[0].uri }];
                        var options = { snapshot_id : data.body.snapshot_id };
                        spotifyApi.removeTracksFromPlaylist(localConfig.spotify.userId, localConfig.spotify.playlistId, tracks, options)
                            .then(function(data){
                                bot.replyPrivate(message, 'All instances of ' + firstTrack + ' have been removed from the playlist!');
                                console.log(matchingTracks.length + ' cases of ' + firstTrack + ' have been removed');
                            }, function(err){
                                bot.replyPrivate(message, 'Something went wrong!');
                                console.log('Something went wrong!', err);
                            });
                    }
                    else {
                        var myRes = 'There are multiple tracks matching that criteria.\n';
                        myRes += 'Try again with the full name of one of the following:\n';
                        matchingTracks.forEach(function(el){
                            myRes += el.name + '\n';
                        });
                        myRes += '_Example: `/drop ' + matchingTracks[0].name + '`_';
                        bot.replyPrivate(message, myRes);
                    }
            }
        }, function(err){
            console.log('Something went wrong!', err);
        });
}
