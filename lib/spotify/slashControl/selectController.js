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
    console.log('--------------');
    console.log('/select');

    if (message.token !== localConfig.slackapp.verifyToken) return;
    console.log('token is fine');

    console.log('Select Text: ' + message.text);
    if (message.text === '') {
        bot.replyPrivate(message,
            'Type the number of your selection after the slash command\n' +
            'Example: `/select 5` will select the fifth option');
        console.log('User did not select anything');
        return;
    }

    var trackSelect = parseInt(message.text, 10);
    console.log('User searched for: ' + trackSelect + '.  Reminder: this is a parseInt of searched term.');
    //check1
    if (isNaN(trackSelect)) {
        bot.replyPrivate(message, 'Please only enter numbers!');
        console.log('User did not search for a number');
        return;
    }

    //get
    controller.storage.users.get(message.user_id, function(err, user){
        console.log('get user storage');
        if (err) {
            bot.replyPrivate(message, 'Something went wrong');
            console.log('Encountered error trying to find user storage: ' + err);
            return;
        }

        //check2
        if (!user.tracks) {
            bot.replyPrivate(message,
                "It doesn't look like you've searched for anything!\n" +
                "Try adding a song first with `/add [trackname]`.\n" +
                "If you get a whole list from that, then try `/select` again.");
            console.log('user has no tracks');
            return;
        }
        //check3
        if (trackSelect < 0 || trackSelect > (user.tracks.length - 1)) {
            bot.replyPrivate(message, "Please enter a number between 0 and " + (user.tracks.length - 1));
            console.log('user typed in a number that does not fit constraints: ' + trackSelect);
            return;
        }
        var addTrack = user.tracks[trackSelect].uri;
        console.log('passed all checks.  will try to add ' + addTrack);
        //add
        spotifyApi.addTracksToPlaylist(localConfig.spotify.userId, localConfig.spotify.playlistId, [addTrack])
            .then(function(data){
                bot.replyPrivate(message, 'I have added ' + user.tracks[trackSelect].name + ' to the playlist :thumbsup:')
                console.log('Added ' + user.tracks[trackSelect].name + ' to playlist!');
            }, function(err) {
                bot.replyPrivate(message, 'Something went wrong....')
                console.log('something went wrong...', err);
            });
    });
}
