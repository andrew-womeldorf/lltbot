var Store = require('jfs');

module.exports = function(config) {

    if (!config) {
        config = {
            path: './',
        };
    }

    var spotify_db = new Store(config.path + '/spotify', {saveId: 'id'});
    var teams_db = new Store(config.path + '/teams', {saveId: 'id'});
    var users_db = new Store(config.path + '/users', {saveId: 'id'});
    var channels_db = new Store(config.path + '/channels', {saveId: 'id'});

    var objectsToList = function(cb) {
        return function(err, data) {
            if (err) {
                cb(err, data);
            } else {
                cb(err, Object.keys(data).map(function(key) {
                    return data[key];
                }));
            }
        };
    };

    var storage = {
        spotify: {
            get: function(spotify_id, cb) {
                spotify_db.get(spotify_id, cb);
            },
            save: function(spotify_data, cb) {
                spotify_db.save(spotify_data.id, spotify_data, cb);
            },
            all: function(cb) {
                spotify_db.all(objectsToList(cb));
            }
        },
        teams: {
            get: function(team_id, cb) {
                teams_db.get(team_id, cb);
            },
            save: function(team_data, cb) {
                teams_db.save(team_data.id, team_data, cb);
            },
            all: function(cb) {
                teams_db.all(objectsToList(cb));
            }
        },
        users: {
            get: function(user_id, cb) {
                users_db.get(user_id, cb);
            },
            save: function(user, cb) {
                users_db.save(user.id, user, cb);
            },
            all: function(cb) {
                users_db.all(objectsToList(cb));
            }
        },
        channels: {
            get: function(channel_id, cb) {
                channels_db.get(channel_id, cb);
            },
            save: function(channel, cb) {
                channels_db.save(channel.id, channel, cb);
            },
            all: function(cb) {
                channels_db.all(objectsToList(cb));
            }
        }
    };

    return storage;
};
