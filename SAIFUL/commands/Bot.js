/* WEBSITE LINK - https://rx-baby.netlify.app/

AUTHOR - rX ABDULLAH + Typing Effect Added by GPT-5 */

const axios = require("axios");
const fs = global.nodemodule["fs-extra"];

const apiJsonURL = "https://raw.githubusercontent.com/rummmmna21/rx-api/main/baseApiUrl.json";

module.exports.config = {
  name: "bot",
  version: "1.3.0",
  hasPermssion: 0,
  credits: "rX Abdullah + GPT-5",
  description: "Maria Baby-style chat system with typing effect like baby.js",
  commandCategory: "noprefix",
  usages: "bot / @mention",
  cooldowns: 3
};

// 🔹 Fetch RX API
async function getRxAPI() {
  try {
    const res = await axios.get(apiJsonURL);
    if (res.data && res.data.rx) return res.data.rx;
    throw new Error("rx key not found in JSON");
  } catch (err) {
    console.error("Failed to fetch RX API:", err.message);
    return null;
  }
}

// 🔹 Typing Effect Function
const __callTyping = async (apiObj, threadId, ms = 2000) => {
  try {
    const fn = apiObj["sendTypingIndicator"] || apiObj["typing"];
    if (typeof fn === "function") {
      await fn.call(apiObj, threadId, true);
      await new Promise(r => setTimeout(r, ms));
      await fn.call(apiObj, threadId, false);
    }
  } catch {}
};

// 🔹 Invisible marker for bot message tracking
const marker = "\u200B";
function withMarker(text) {
  return text + marker;
}

// 🔹 Main Event Handler
module.exports.handleEvent = async function({ api, event, Users }) {
  const { threadID, messageID, body, senderID, messageReply, mentions } = event;
  if (!body) return;

  const name = await Users.getNameUser(senderID);
  const TARGET_ID = "61560916929379"; // Change if needed

  // ─── 1️⃣ Trigger when user says "bot" or mentions bot ───
  if (
    body.trim().toLowerCase() === "bot" ||
    (mentions && Object.keys(mentions).includes(TARGET_ID))
  ) {
    const replies = [
      "বেশি Bot Bot করলে leave নিবো কিন্তু😒",
      "🥛-🍍👈 -লে খাহ্..!😒",
      "শুনবো না😼 তুমি আমাকে প্রেম করাই দাও নাই🥺",
      "আমি আবাল দের সাথে কথা বলি না😒",
      "এতো ডেকো না, প্রেমে পরে যাবো 🙈",
      "বার বার ডাকলে মাথা গরম হয়ে যায়😑",
      "𝐓𝐨𝐫 𝐧𝐚𝐧𝐢𝐫 𝐮𝐢𝐝 𝐦𝐚𝐧𝐞 𝐚𝐦𝐚𝐫 𝐝𝐞𝐤𝐡𝐚𝐢 𝐝𝐢 😏",
      "এতো ডাকছিস কেন? গালি শুনবি নাকি? 🤬"
    ];

    const message = 
`╭──────•◈•──────╮
   Hᴇʏ Xᴀɴ I’ᴍ Mᴀʀɪᴀ Bᴀʙʏ✨   

 ❄ Dᴇᴀʀ, ${name}
 💌 ${replies[Math.floor(Math.random() * replies.length)]}

╰──────•◈•──────╯`;

    await __callTyping(api, threadID, 2500);
    return api.sendMessage(withMarker(message), threadID, messageID);
  }

  // ─── 2️⃣ When someone replies to bot message ───
  if (
    messageReply &&
    messageReply.senderID === api.getCurrentUserID() &&
    messageReply.body?.includes(marker)
  ) {
    const replyText = body.trim();
    if (!replyText) return;

    const rxAPI = await getRxAPI();
    if (!rxAPI)
      return api.sendMessage("❌ Failed to load RX API.", threadID, messageID);

    try {
      await __callTyping(api, threadID, 2500);

      const res = await axios.get(
        `${rxAPI}/simsimi?text=${encodeURIComponent(replyText)}&senderName=${encodeURIComponent(name)}`
      );

      const responses = Array.isArray(res.data.response)
        ? res.data.response
        : [res.data.response];

      for (const reply of responses) {
        await __callTyping(api, threadID, 2000);
        await new Promise(resolve => {
          api.sendMessage(withMarker(reply), threadID, () => resolve(), messageID);
        });
      }
    } catch (err) {
      console.error(err);
      return api.sendMessage(`| Error in RX API: ${err.message}`, threadID, messageID);
    }
  }
};

module.exports.run = function() {};
