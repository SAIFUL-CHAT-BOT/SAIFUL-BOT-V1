const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const Canvas = require("canvas");

module.exports.config = {
  name: "joinnoti",
  version: "2.4.0",
  credits: "Saiful Islam + Updated by GPT-5",
  description: "Welcome system with Bangla captions, adder photo & galaxy background",
  eventType: ["log:subscribe"],
  dependencies: {
    "canvas": "",
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID, logMessageData } = event;
  const added = logMessageData.addedParticipants?.[0];
  if (!added) return;

  const userID = added.userFbId;
  const userName = added.fullName;
  const botID = api.getCurrentUserID();

  const threadInfo = await api.getThreadInfo(threadID);
  const groupName = threadInfo.threadName;
  const memberCount = threadInfo.participantIDs.length;

  const adderID = event.author;
  const adderName = (await Users.getNameUser(adderID)) || "Unknown";

  // 🔭 নতুন গ্যালাক্সি ব্যাকগ্রাউন্ড
  const bgURL = "https://i.ibb.co/VVPCV3C/galaxy-bg.jpg"; // 🌌 তোমার পাঠানো ছবির লিংক হিসেবে এইটা ইউজ করা হয়েছে
  // তুমি চাইলে সরাসরি তোমার ছবিটা এই লিংকে আপলোড করে বদলে দিতে পারো

  const avatarURL = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
  const adderAvatarURL = `https://graph.facebook.com/${adderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

  const cacheDir = path.join(__dirname, "cache");
  fs.ensureDirSync(cacheDir);

  const bgPath = path.join(cacheDir, "bg.jpg");
  const avatarPath = path.join(cacheDir, `avt_${userID}.png`);
  const adderAvatarPath = path.join(cacheDir, `adder_${adderID}.png`);
  const outPath = path.join(cacheDir, `welcome_${userID}.png`);

  try {
    // 🖼️ ইমেজ ডাউনলোড
    const bgImg = (await axios.get(bgURL, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(bgPath, Buffer.from(bgImg));

    const avatarImg = (await axios.get(avatarURL, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(avatarPath, Buffer.from(avatarImg));

    const adderImg = (await axios.get(adderAvatarURL, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(adderAvatarPath, Buffer.from(adderImg));

    // 🎨 ক্যানভাস তৈরি
    const canvas = Canvas.createCanvas(800, 550);
    const ctx = canvas.getContext("2d");
    const background = await Canvas.loadImage(bgPath);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // ✨ প্রোফাইল ফ্রেম (নতুন স্টাইল)
    const avatarSize = 180;
    const avatarX = (canvas.width - avatarSize) / 2;
    const avatarY = 100;

    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 10, 0, Math.PI * 2);
    ctx.strokeStyle = "#00FFFF";
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.closePath();

    const avatar = await Canvas.loadImage(avatarPath);
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // 🪐 এডার ফ্রেম
    const adderSize = 110;
    const adderX = (canvas.width - adderSize) / 2;
    const adderY = 350;

    ctx.beginPath();
    ctx.arc(adderX + adderSize / 2, adderY + adderSize / 2, adderSize / 2 + 8, 0, Math.PI * 2);
    ctx.strokeStyle = "#FF69B4";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.closePath();

    const adderAvatar = await Canvas.loadImage(adderAvatarPath);
    ctx.save();
    ctx.beginPath();
    ctx.arc(adderX + adderSize / 2, adderY + adderSize / 2, adderSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(adderAvatar, adderX, adderY, adderSize, adderSize);
    ctx.restore();

    // 🌈 টেক্সট ডিজাইন
    ctx.textAlign = "center";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 10;

    ctx.font = "bold 38px Arial";
    ctx.fillStyle = "#FFD700";
    ctx.fillText(`🌟 ${userName} 🌟`, canvas.width / 2, avatarY + avatarSize + 50);

    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "#00FFFF";
    ctx.fillText(`🏷️ ${groupName}`, canvas.width / 2, avatarY + avatarSize + 95);

    ctx.font = "bold 26px Arial";
    ctx.fillStyle = "#FF69B4";
    ctx.fillText(`🔢 সদস্য সংখ্যা: ${memberCount}`, canvas.width / 2, avatarY + avatarSize + 135);

    ctx.font = "bold 24px Arial";
    ctx.fillStyle = "#ADFF2F";
    ctx.fillText(`👤 Added by ${adderName}`, canvas.width / 2, adderY + adderSize + 40);

    const finalBuffer = canvas.toBuffer();
    fs.writeFileSync(outPath, finalBuffer);

    // 📜 গ্রুপ রুলস
    const groupRules = 
`📜 𝗚𝗥𝗢𝗨𝗣 𝗥𝗨𝗟𝗘𝗦 📜
১️⃣ সবাইকে সম্মান করবে 👥  
২️⃣ স্প্যাম বা লিংক দেওয়া নিষেধ 🚫  
৩️⃣ বাজে ভাষা ব্যবহার করা যাবে না ⚠️  
৪️⃣ ভুয়া তথ্য বা গুজব নয় ❌  
৫️⃣ অ্যাডমিনের সিদ্ধান্তই চূড়ান্ত 👑`;

    let message;

    if (userID == botID) {
      message = {
        body: 
`🤖 𝐁𝐎𝐓 𝐎𝐍𝐋𝐈𝐍𝐄 🤖
━━━━━━━━━━━━━━━━━━
ধন্যবাদ 💖 @${adderName}  
আমাকে গ্রুপে যুক্ত করার জন্য 🥰  

আমি এখন তুমাদের সাথে একটিভ আছি 😎  

🛠️ লিখুন: /help — সব কমান্ড দেখতে
━━━━━━━━━━━━━━━━━━
👑 𝐁𝐨𝐭 𝐎𝐰𝐧𝐞𝐫: 𝐒𝐚𝐢𝐟𝐮𝐥 𝐈𝐬𝐥𝐚𝐦`,
        mentions: [{ tag: `@${adderName}`, id: adderID }],
        attachment: fs.createReadStream(outPath)
      };
    } else {
      message = {
        body:
`━━━━━━━━━━━━━━━━━━
🌌 স্বাগতম @${userName}! 🌌

🏷️ গ্রুপ: ${groupName}  
🔢 তুমি এখন ${memberCount} নম্বর সদস্য  
👤 এড করেছেন: @${adderName}  
━━━━━━━━━━━━━━━━━━
💖 ধন্যবাদ @${adderName} 💖  
তোমার কারণে @${userName} এখন আমাদের সাথে!
━━━━━━━━━━━━━━━━━━
${groupRules}
━━━━━━━━━━━━━━━━━━
👑 𝐁𝐨𝐭 𝐎𝐰𝐧𝐞𝐫: 𝐒𝐚𝐢𝐟𝐮𝐥 𝐈𝐬𝐥𝐚𝐦`,
        mentions: [
          { tag: `@${userName}`, id: userID },
          { tag: `@${adderName}`, id: adderID }
        ],
        attachment: fs.createReadStream(outPath)
      };
    }

    api.sendMessage(message, threadID, () => {
      fs.unlinkSync(bgPath);
      fs.unlinkSync(avatarPath);
      fs.unlinkSync(adderAvatarPath);
      fs.unlinkSync(outPath);
    });

  } catch (error) {
    console.error("Joinnoti Error:", error);
    api.sendMessage("⚙️ দুঃখিত, ওয়েলকাম মডিউলে ত্রুটি ঘটেছে ⚙️", threadID);
  }
};
