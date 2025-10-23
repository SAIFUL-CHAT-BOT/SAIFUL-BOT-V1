const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "animeaction",
    version: "1.2.3",
    hasPermssion: 0,
    credits: "Saiful Islam",
    description: "Send random anime action GIFs like hug, kiss, slap, dance, cry etc.",
    commandCategory: "fun",
    usages: "[hug | kiss | slap | dance | cry]",
    cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, mentions } = event;
    const type = args[0] ? args[0].toLowerCase() : null;

    if (!type) {
        return api.sendMessage(
            "❗ব্যবহার: !animeaction [hug | kiss | slap | dance | cry]\n\nউদাহরণ: !animeaction hug",
            threadID,
            messageID
        );
    }

    const actions = {
        hug: "🤗 একটা ভালোবাসার আলিঙ্গন দিলো!",
        kiss: "💋 ভালোবাসায় একটা চুমু দিলো!",
        slap: "👋 এক চড় খেয়ে ফেললে!",
        dance: "💃 আনন্দে নাচ শুরু করে দিলো!",
        cry: "😢 কাঁদছে হuhu..."
    };

    const message = actions[type] || "💫 র‍্যান্ডম anime GIF নিচে দেখো:";

    try {
        // API কল করা
        const res = await axios.get("https://mahbub-ullash.cyberbot.top/api/animegif");
        const gifUrl = res.data?.url || res.data;

        if (!gifUrl) {
            return api.sendMessage(
                "💫 Sorry, couldn't fetch an anime GIF right now 😢",
                threadID,
                messageID
            );
        }

        // GIF ডাউনলোড করে temp ফাইলে রাখা
        const filePath = path.join(__dirname, "cache", `${Date.now()}_anime.gif`);
        const gifData = (await axios.get(gifUrl, { responseType: "arraybuffer" })).data;
        await fs.outputFile(filePath, Buffer.from(gifData));

        // Mentioned user থাকলে তার নাম যোগ করা
        let name = "";
        if (Object.keys(mentions).length > 0) {
            name = Object.values(mentions)[0].replace("@", "");
        }

        // Messenger এ পাঠানো
        return api.sendMessage(
            {
                body: `${message} ${name ? `\n👉 ${name}` : ""}`,
                attachment: fs.createReadStream(filePath)
            },
            threadID,
            async () => await fs.remove(filePath),
            messageID
        );

    } catch (e) {
        console.error(e);
        return api.sendMessage(
            "💫 Sorry, couldn't fetch an anime GIF right now 😢",
            threadID,
            messageID
        );
    }
};
