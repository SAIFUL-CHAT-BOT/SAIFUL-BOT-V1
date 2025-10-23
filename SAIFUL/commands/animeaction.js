const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "animeaction",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "Saiful Islam",
  description: "Send random anime action GIFs like hug, kiss, slap, dance, cry etc.",
  commandCategory: "fun",
  usages: "[hug | kiss | slap | dance | cry]",
  cooldowns: 3
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, mentions } = event;
  const type = args[0] ? args[0].toLowerCase() : null;

  if (!type) {
    return api.sendMessage(
      "❗ব্যবহার: !animeaction [hug | kiss | slap | dance | cry]\n\nউদাহরণ: !animeaction hug",
      threadID,
      messageID
    );
  }

  const apiUrl = `https://mahbub-ullash.cyberbot.top/api/animegif`;

  const actions = {
    hug: "🤗 একটা ভালোবাসার আলিঙ্গন দিলো!",
    kiss: "💋 ভালোবাসায় একটা চুমু দিলো!",
    slap: "👋 এক চড় খেয়ে ফেললে!",
    dance: "💃 আনন্দে নাচ শুরু করে দিলো!",
    cry: "😢 কাঁদছে হuhu..."
  };

  const message = actions[type] || "💫 র‍্যান্ডম anime GIF নিচে দেখো:";

  try {
    const res = await axios.get(apiUrl);

    // যদি API ঠিকভাবে data না দেয়
    if (!res.data || res.data.error) {
      const operator = res.data?.operator || "CYBER ULLASH";
      const errorMsg = res.data?.error || "Failed to fetch anime GIF";

      return api.sendMessage(
        `⚠️ Operator: ${operator}\n❌ Error: ${errorMsg}`,
        threadID,
        messageID
      );
    }

    const gifUrl = res.data.url || res.data;
    const path = __dirname + `/cache/${Date.now()}_anime.gif`;
    const gifData = (await axios.get(gifUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(path, Buffer.from(gifData, "utf-8"));

    let name = "";
    if (Object.keys(mentions).length > 0) {
      name = Object.values(mentions)[0].replace("@", "");
    }

    return api.sendMessage(
      {
        body: `${message} ${name ? `\n👉 ${name}` : ""}`,
        attachment: fs.createReadStream(path)
      },
      threadID,
      () => fs.unlinkSync(path),
      messageID
    );
  } catch (e) {
    console.log(e);
    // যদি পুরোপুরি error হয়, তখনও operator info পাঠাবে
    return api.sendMessage(
      `⚠️ Operator: CYBER ULLASH\n❌ Error: Failed to fetch anime GIF`,
      threadID,
      messageID
    );
  }
};
