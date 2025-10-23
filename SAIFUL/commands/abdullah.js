const fs = require("fs");
module.exports.config = {
	name: "abdullah",
    version: "1.0.1",
	hasPermssion: 0,
	credits: "𝐫𝐗", 
	description: "hihihihi",
	commandCategory: "no prefix",
	usages: "abdullah",
    cooldowns: 5, 
};

module.exports.handleEvent = function({ api, event, client, __GLOBAL }) {
	var { threadID, messageID } = event;
	if (event.body.indexOf("rx")==0 || event.body.indexOf("Saiful")==0 || event.body.indexOf("Saiful Islam")==0 || event.body.indexOf("Jannat")==0) {
		var msg = {
				body: "◌⑅⃝●♡⋆♡𝐫𝐗 𝐀𝐛𝐝𝐮𝐥𝐥𝐚𝐡♡⋆♡●⑅⃝◌",
				attachment: fs.createReadStream(__dirname + `/noprefix/wednesday.mp4`)
			}
			api.sendMessage(msg, threadID, messageID);
    api.setMessageReaction("⚡", event.messageID, (err) => {}, true)
		}
	}
	module.exports.run = function({ api, event, client, __GLOBAL }) {

  }
