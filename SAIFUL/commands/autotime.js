const axios = require("axios");
const moment = require("moment-timezone");

module.exports.config = {
  name: "autotime",
  version: "8.5.1",
  hasPermssion: 2,
  credits: "rX Abdullah (fixed by ChatGPT)",
  description: "Auto send time & date every hour in all groups",
  commandCategory: "utility",
  cooldowns: 3
};

module.exports.run = async function ({ api }) {
  const githubUrl = "https://raw.githubusercontent.com/rummmmna21/rX-/main/autotime.json";
  const timezone = "Asia/Dhaka";

  async function sendToAllThreads() {
    try {
      const res = await axios.get(githubUrl);
      const data = Array.isArray(res.data.dates) ? res.data : { dates: [] };
      const now = moment().tz(timezone);

      const englishDate = now.format("dddd, DD MMMM YYYY");
      const hour = now.hour();
      let banglaPeriod;
      if (hour < 12) banglaPeriod = "সকাল";
      else if (hour < 18) banglaPeriod = "বিকাল";
      else banglaPeriod = "রাত";
      const time = now.format("hh:mm") + " " + banglaPeriod;

      const todayData = data.dates.find(d => d.english.includes(englishDate));

      const msg = `
╔═❖═❖═❖═❖═❖═❖═╗
 ⏰ 𝗧𝗜𝗠𝗘 & 𝗗𝗔𝗧𝗘 ⏰
╚═❖═❖═❖═❖═❖═❖═╝
       ╔═✪═🕒═✪═╗
          সময়: ${time}
       ╚════════╝
🗓️ English: ${todayData?.english || englishDate}
🗓️ বাংলা: ${todayData?.bangla || "N/A"}
🌙 হিজরি: ${todayData?.hijri || "N/A"}
🌍 টাইমজোন: ${timezone}
━━━━━━━━━━━━━━━━━━━━
✨ আল্লাহর নিকটে বেশি বেশি দোয়া করুন..! 
🙏 ৫ ওয়াক্ত নামাজ নিয়মিত পড়ুন..!
🤝 সকলের সাথে সদ্ভাব বজায় রাখুন..!
━━━━━━━━━━━━━━━━━━━━
🌸✨🌙🕊️🌼🌿🕌💖🌙🌸✨🌺

🌟 𝐂𝐫𝐞𝐚𝐭𝐨𝐫 ━ 𝐒𝐚𝐢𝐫𝐮𝐥 𝐈𝐬𝐥𝐚𝐦 🌟`;

      // শুধু নির্দিষ্ট group ID দিতে পারো GoatBot v2 তে
      const threadIDs = ["1000123456789", "1000987654321"]; // তোমার নিজের group IDs
      for (const id of threadIDs) {
        api.sendMessage(msg, id);
      }

    } catch (err) {
      console.error("AutoTime Error:", err);
    }
  }

  await sendToAllThreads();

  if (global.autotimeInterval) clearInterval(global.autotimeInterval);
  global.autotimeInterval = setInterval(sendToAllThreads, 60 * 60 * 1000);
};
