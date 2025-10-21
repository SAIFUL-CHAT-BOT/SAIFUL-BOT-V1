const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const Canvas = require("canvas");

module.exports.config = {
  name: "joinnoti",
  version: "1.5.0",
  credits: "Maria + rX Abdullah + Saiful Islam + GPT-5 Layout Fix",
  description: "Welcome system showing only new member avatar, Bot Owner at bottom center",
  eventType: ["log:subscribe"],
  dependencies: {
    "canvas": "",
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async function ({ api, event, Users }) {
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

  const bgURL = "https://i.postimg.cc/rmkVVbsM/r07qxo-R-Download.jpg";
  const newUserAvatar = `https://graph.facebook.com/${userID}/picture?width=512&height=512`;

  const cacheDir = path.join(__dirname, "cache");
  fs.ensureDirSync(cacheDir);

  const bgPath = path.join(cacheDir, "bg.jpg");
  const newUserPath = path.join(cacheDir, `new_${userID}.png`);
  const outPath = path.join(cacheDir, `welcome_${userID}.png`);

  try {
    // 🖼️ ইমেজ ডাউনলোড
    const bgImg = (await axios.get(bgURL, { responseType: "arraybuffer" })).data;
    const userImg = (await axios.get(newUserAvatar, { responseType: "arraybuffer" })).data;

    fs.writeFileSync(bgPath, Buffer.from(bgImg));
    fs.writeFileSync(newUserPath, Buffer.from(userImg));

    // 🎨 ক্যানভাস তৈরি
    const canvas = Canvas.createCanvas(800, 600);
    const ctx = canvas.getContext("2d");
    const background = await Canvas.loadImage(bgPath);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Helper ফাংশন রাউন্ড ইমেজের জন্য
    const drawRoundImage = async (path, x, y, size) => {
      const img = await Canvas.loadImage(path);
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, x, y, size, size);
      ctx.restore();
    };

    // নতুন মেম্বারের প্রোফাইল পিক
    const userSize = 160;
    const userX = (canvas.width - userSize) / 2;
    const userY = 40;
    await drawRoundImage(newUserPath, userX, userY, userSize);

    ctx.textAlign = "center";

    // নতুন মেম্বারের নাম
    ctx.font = "bold 36px Arial";
    ctx.fillStyle = "#FFD700";
    ctx.fillText(userName, canvas.width / 2, userY + userSize + 50);

    // গ্রুপ নাম
    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "#00FFFF";
    ctx.fillText(groupName, canvas.width / 2, userY + userSize + 100);

    // মোট সদস্য সংখ্যা
    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(`মোট সদস্য: ${memberCount}`, canvas.width / 2, userY + userSize + 150);

    // Bot Owner নিচে সেন্টারে
    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#FF1493";
    ctx.fillText("Bot Owner: Saiful Islam 💻", canvas.width / 2, canvas.height - 30);

    // চূড়ান্ত ইমেজ সেভ
    const finalBuffer = canvas.toBuffer();
    fs.writeFileSync(outPath, finalBuffer);

    const groupRules =
`📜 𝗚𝗥𝗢𝗨𝗣 𝗥𝗨𝗟𝗘𝗦 📜
১️⃣ সবাইকে সম্মান করবে 👥  
২️⃣ স্প্যাম বা লিংক দেওয়া নিষেধ 🚫  
৩️⃣ বাজে ভাষা ব্যবহার করা যাবে না ⚠️  
৪️⃣ ভুয়া তথ্য বা গুজব নয় ❌  
৫️⃣ অ্যাডমিনের সিদ্ধান্তই চূড়ান্ত 👑`;

    let message = {
      body: `━━━━━━━━━━━━━━━━━━
🎉 স্বাগতম @${userName}! 🎉
━━━━━━━━━━━━━━━━━━
🏷️ গ্রুপ: ${groupName}  
🔢 তুমি এখন ${memberCount} নম্বর সদস্য  
👤 এড করেছেন: @${adderName}  
━━━━━━━━━━━━━━━━━━
💖 ধন্যবাদ @${adderName} 💖  
তোমার কারণে @${userName} এখন আমাদের সাথে! 🎊
━━━━━━━━━━━━━━━━━━
${groupRules}
━━━━━━━━━━━━━━━━━━
👑 Bot Owner: Saiful Islam 💻
━━━━━━━━━━━━━━━━━━`,
      mentions: [
        { tag: `@${userName}`, id: userID },
        { tag: `@${adderName}`, id: adderID }
      ],
      attachment: fs.createReadStream(outPath)
    };

    api.sendMessage(message, threadID, () => {
      fs.unlinkSync(bgPath);
      fs.unlinkSync(newUserPath);
      fs.unlinkSync(outPath);
    });

  } catch (error) {
    console.error("Joinnoti error:", error);
    api.sendMessage("⚙️ দুঃখিত, ওয়েলকাম মডিউলে ত্রুটি ঘটেছে ⚙️", threadID);
  }
};
