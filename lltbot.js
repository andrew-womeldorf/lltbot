/*░░░░░░░░░░░░░░░░░░░░░░░░

  DIRECTORY

    _TODO
    _Setup
    _PJ_Emoji
    _Conversation
    _Hears_Bot
    _Shutdown
    _Leave_Channel
    _Feature

  ░░░░░░░░░░░░░░░░░░░░░░░░*/

//▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// _TODO
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// TODO: figure out storage, including long term for if the bot shuts down.  I want to keep info even if bot is reset
// TODO: Slack buttons
// TODO: Integrate twitter feed into a channel with updates from Gitlab

//▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// _Setup
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var Botkit = require('botkit');
var localConfig = require('./local-config').lltbot;
var storage = require('./lib/storage');
storage = storage({path: './db_lltbot'});


var token = localConfig.token || process.env.token;

if (!token) { // Check that there is a token when called (not validated here)
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var controller = Botkit.slackbot({ // Create the controller, turn on debugging
    debug: true,
    storage: storage
});

controller.spawn({ // Validate token, start RTM, throw any errors
    token: token
}).startRTM(function(err){
    if (err) {
        throw new Error(err);
    }
});


/****************
testing zone
****************/

controller.on('ambient', function(bot, message){
    if (message.channel === 'G1SMXBBLY') {
        storage.channels.get(message.channel, function(err, data){
            if (err) return;

        });
        message.id = message.channel;
        storage.channels.save(message);
    }
});

/****************
END testing zone
****************/
//▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// _PJ_Emoji
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var peterjohn = new RegExp(/(:?P((e+[gjt]+\w*)|([gjy]\w*))\s?[gjy]*\w*:?)|((:?|\@?)p\s?j\w{2,}?:?)|((:?|\@?)pj:?)|(wh?e{2,}[gj]+)/ig);
var randReact = [
    'gran',
    'nuke',
    'pjj',
    'womans_hat',
    'pug',
    'bowtie',
    'hankey',
    '',
    'donkey',
    'daschund',
    'grumpycat',
    'poolparty',
    'facepalm',
    'surprised',
    'beard',
    'kitten',
    'lego',
    'coffee',
    'yoda',
    'shaking',
    'vader',
    'thats-shitty',
    'thefonz',
    'trooper',
    'nod',
    'pika',
    'squirrel',
    'mage-dance',
    'metal',
    'good-fin-luck',
    'henry',
    'lalala',
    'humping-monkey',
    'chemicalx',
    'dancing-taco',
    'dancing-tomato',
    'dancing-penguin',
    'computer-rage',
    'hitting-face-on-wall',
    'dance-banana',
    'aw-yeah'
];
controller.on('ambient,message_received,direct_message,mention', function(bot, message){//Any variation of peterjohn being used (see RegExp)
    var reactIndex = Math.floor(Math.random() * randReact.length);
    var shouldIReact = Math.floor(Math.random() * 4);
    if (peterjohn.test(message.text)) {
        if (shouldIReact === 1) {
            var timeOut = Math.random() * (20000-750) + 750;
            setTimeout(function(){
                bot.api.reactions.add({ //:peterjohn:
                    timestamp: message.ts,
                    channel: message.channel,
                    name: 'peterjohn',
                }, function(err, res){
                    if (err) {
                        bot.botkit.log('Failed to add peterjohn emoji reaction :/', err);
                    }
                });
                bot.api.reactions.add({ //:pj:
                    timestamp: message.ts,
                    channel: message.channel,
                    name: randReact[reactIndex],
                }, function(err, res){
                    if (err) {
                        bot.botkit.log('Failed to add pj emoji reaction :/', err);
                    }
                });
            }, timeOut);
        } else {
            var timeOut = Math.random() * (20000-750) + 750;
            setTimeout(function(){
                bot.api.reactions.add({ //:pj:
                    timestamp: message.ts,
                    channel: message.channel,
                    name: randReact[reactIndex],
                }, function(err, res){
                    if (err) {
                        bot.botkit.log('Failed to add pj emoji reaction :/', err);
                    }
                });
            }, timeOut);
        }
    }
})
controller.on('ambient', function(bot, message){ //if the real PeterJohn posts anything to the general channel or the GotLunch channel
    // console.log('NEW MESSAGE');
    // console.log(message);
    var reactIndex = Math.floor(Math.random() * randReact.length);
    var shouldIReact = Math.floor(Math.random() * 4);
    if (message.user == 'U079SK0TG' && (message.channel == 'C02T1HWQZ' || message.channel == 'G0E1HF5BR' || message.channel == 'G07ETKLJY') && shouldIReact === 1) {
        bot.api.reactions.add({ //:peterjohn:
            timestamp: message.ts,
            channel: message.channel,
            name: 'peterjohn',
        }, function(err, res){
            if (err) {
                bot.botkit.log('Failed to add peterjohn emoji reaction :/', err);
            }
        });
        bot.api.reactions.add({ //:pj:
            timestamp: message.ts,
            channel: message.channel,
            name: randReact[reactIndex],
        }, function(err, res){
            if (err) {
                bot.botkit.log('Failed to add peterjohn emoji reaction :/', err);
            }
        });
    } else if (message.user == 'U02T7T766' && message.channel == 'C02T1HWQZ' && shouldIReact === 1) {
        bot.api.reactions.add({
            timestamp: message.ts,
            channel: message.channel,
            name: randReact[reactIndex],
        }, function(err, res){
            if (err) {
                bot.botkit.log('Failed to add peterjohn emoji reaction :/', err);
            }
        });
    }
});

controller.on('ambient', function(bot, message){ //if the real PeterJohn posts anything to the general channel or the GotLunch channel
    // console.log('NEW MESSAGE');
    // console.log(message);
    var reactIndex = Math.floor(Math.random() * randReact.length);
    var shouldIReact = Math.floor(Math.random() * 4);
    if (message.user == 'U0A0F403T' && message.channel == 'G07EUCVM0') {
        bot.api.reactions.add({ //:peterjohn:
            timestamp: message.ts,
            channel: message.channel,
            name: 'no_entry_sign',
        }, function(err, res){
            if (err) {
                bot.botkit.log('Failed to add peterjohn emoji reaction :/', err);
            }
        });
        bot.api.reactions.add({ //:pj:
            timestamp: message.ts,
            channel: message.channel,
            name: 'ghost',
        }, function(err, res){
            if (err) {
                bot.botkit.log('Failed to add peterjohn emoji reaction :/', err);
            }
        });
    } 
});

//▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// _Conversation
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
controller.on('direct_message', function(bot, message){ // general message started
    // console.log(bot);
    // console.log(message);
    bot.startConversation(message, catchAll);
});
catchAll = function(response, convo){
    convo.say('Hello');
    // convo.say("I don't have much to say");
    // convo.say("Sorry. Try again soon.  Someone is working on me");
    convo.next();
}

//▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// _Hears_Bot
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
controller.hears('bot', 'direct_message,direct_mention,mention', function(bot, message){
    bot.startConversation(message, firstResponse);
});
firstResponse = function(response, convo){
    convo.say('Hello, yes.  I am a bot.');
    convo.say('I was created for the sole purpose of `:peterjohn:`ing as many things as are applicable.');
    convo.ask('i.e. Anytime "pj" or "peterjohn" is mentioned.  Would the *REAL* PeterJohn like to pipe in? :peterjohn:', function(response, convo){
        convo.say('I can do other things too!');
        convo.say("...Actually, I can't...");
        secondResponse(response, convo);
        convo.next();
    });
}
secondResponse = function(response, convo){
    convo.say('But I could be programmed to do something else, if someone takes the time to do so.');
    convo.say('I could be made to do something actually useful.');
    convo.ask('Do you have any ideas for my future work here at LLT Group?', function(response, convo){
        convo.say('NICE!  I like it. :peterjohn:');
        convo.say("I'll let my current developer know.");
        convo.say("BTW, if you have other feature requests, you can DM me.");
        // convo.say("Just tell me `feature` and I will walk you through the feature request form.");
        convo.next();
    });
}

//▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// _Shutdown
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
controller.hears('shutdown', 'direct_message,direct_mention,mention', function(bot, message){
    bot.startConversation(message, function(err, convo){
        convo.ask('Are you sure you want me to shutdown?', [
            {
                pattern: bot.utterances.yes,
                callback: function(response, convo){
                    convo.say('Well, okay.');
                    convo.say('If you say so.');
                    convo.say(':crying_cat_face:');
                    convo.next();
                    setTimeout(function(){
                        process.exit();
                    }, 3000);
                }
            },
            {
                pattern: bot.utterances.no,
                default: true,
                callback: function(response, convo){
                    convo.say(':peterjohn: I knew it :peterjohn:');
                    convo.next();
                }
            }
        ]);
    });
});

//▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
// _Feature
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// controller.hears('feature', 'direct_message', function(bot, message){
//     bot.startConversation(message, featureStart);
// });
// featureStart = function(response, convo){
//     convo.say('You said "feature".');
//     convo.ask('Would you like to submit a feature request?', [
//         {
//             pattern: bot.utterances.yes,
//             callback: function(response, convo){
//                 convo.say("Alright!  I'll walk you through what I need to know to get this ball rollin!");
//                 featureStep1();
//                 convo.next();
//             }
//         },
//         {
//             pattern: bot.utterances.no,
//             default: true,
//             callback: function(response, convo){
//                 convo.say(":sad: ok.  I will stay a mediocre bot, then.");
//                 convo.next();
//             }
//         }
//     ]);
// }
// featureStep1 = function(response, convo){ // name
//     convo.say('First question!');
//     convo.ask('If you were to give this new feature a name, what would you call it?', function(response, convo){
//         convo.say('Nice name!');
//         featureStep2();
//         convo.next();
//     });
// }
// featureStep2 = function(response, convo){ // purpose
//     convo.ask('Would you consider this to be for fun, or something that could be used by others as a tool?', function(response, convo){
//         convo.say('I see...');
//         featureStep3();
//         convo.next();
//     });
// }
// featureStep3 = function(response, convo){ // trigger
//     convo.ask('How would you like this feature to activate?  In other words, what will indicate to me that you want me to do this feature for you?', function(response, convo){
//         convo.say("Cool.  I think I see where you're going with this.");
//         featureStep4();
//         convo.next();
//     });
// }
// featureStep4 = function(response, convo){ // function
//     convo.say('Now the fun part.');
//     convo.ask('What would you like me to do in this feature?', function(response, convo){
//         convo.say('WOW!  That. Is. Cool.');
//         convo.say('I will pass this along to my developer, so he can start on it.');
//         convo.say("Also, I'll tell him to talk to you if he has any questions!");
//         convo.say('Bye!');
//         convo.next();
//     })
// }
