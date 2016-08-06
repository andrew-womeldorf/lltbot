/**
*Choose from one of the searched tracks from /add
*Only applicable if the user has used the /add command, and that returned 2+ results
check1: trackSelect is a number --- it's always going to be a string.  should I convert?
check2: user has stored data
check3: trackSelect is an existing index in the stored array
--
get: track uri (returns 'spotify:track:xxxxxxx')
add: spotify.Api.addTracksToPlaylist
----
todo:
*/

module.exports = function(controller, spotifyApi, localConfig, bot, message){
    if (message.token !== localConfig.slackapp.verifyToken) return;

    if (message.text === '' || message.text === 'help') {
        bot.replyPrivate(message,
            'Type the number of your selection after the slash command\n' +
            'Example: `/select 5` will select the fifth option');
        return;
    }
    var trackSelect = parseInt(message.text, 10);
    //check1
    if (isNaN(trackSelect)) {
        bot.replyPrivate(message, 'Please only enter numbers!');
        return;
    }
    //get
    controller.storage.users.get(message.user_id, function(err, user){
        var addTrack = user.tracks[trackSelect].uri;
        //check2
        if (!user.tracks) {
            bot.replyPrivate(message,
                "It doesn't look like you've searched for anything!\n" +
                "Try adding a song first with `/add [trackname]`.\n" +
                "If you get a whole list from that, then try `/select` again.");
            return;
        }
        //check3
        if (trackSelect < 0 || trackSelect > user.tracks.length - 1) {
            bot.replyPrivate(message, "Please enter a number between 0 and " + user.tracks.length - 1);
            return;
        }
        //add
        spotifyApi.addTracksToPlaylist(localConfig.spotify.userId, localConfig.spotify.playlistId, [addTrack])
            .then(function(data){
                console.log('Added track to playlist!');
                bot.replyPrivate(message, 'I have added this to the playlist :thumbsup:')
            }, function(err) {
                console.log('something went wrong...', err);
            });
    });
}
