const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const Canvas = require("canvas");

module.exports.config = {
  name: "joinnoti",
  version: "2.9.0",
  credits: "Saiful Islam",
  description: "Welcome system with Bangla captions, sequential layout",
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

  // Images
  const bgURL = "https://drive.google.com/uc?export=download&id=1MFQIjy_mQsvalFF1XjyBKzGvzRqUHO22";
  const avatarURL = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
  const adderAvatarURL = `https://graph.facebook.com/${adderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

  const cacheDir = path.join(__dirname, "cache");
  fs.ensureDirSync(cacheDir);

  const bgPath = path.join(cacheDir, "bg.jpg");
  const avatarPath = path.join(cacheDir, `avt_${userID}.png`);
  const adderAvatarPath = path.join(cacheDir, `adder_${adderID}.png`);
  const outPath = path.join(cacheDir, `welcome_${userID}.png`);

  try {
    // Download images
    fs.writeFileSync(bgPath, Buffer.from((await axios.get(bgURL, { responseType: "arraybuffer" })).data));
    fs.writeFileSync(avatarPath, Buffer.from((await axios.get(avatarURL, { responseType: "arraybuffer" })).data));
    fs.writeFileSync(adderAvatarPath, Buffer.from((await axios.get(adderAvatarURL, { responseType: "arraybuffer" })).data));

    // Canvas
    const canvas = Canvas.createCanvas(800, 750);
    const ctx = canvas.getContext("2d");
    const background = await Canvas.loadImage(bgPath);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    let currentY = 30;

    // নতুন ইউজারের প্রোফাইল
    const avatarSize = 180;
    const avatarX = (canvas.width - avatarSize) / 2;
    const avatarY = currentY;

    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 8, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    const avatar = await Canvas.loadImage(avatarPath);
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    currentY += avatarSize + 20;

    // গ্রুপ নাম
    ctx.textAlign = "center";
    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "#00FFFF";
    ctx.fillText(groupName, canvas.width / 2, currentY);

    currentY += 40;

    // নতুন মেম্বারের নাম
    ctx.font = "bold 36px Arial";
    ctx.fillStyle = "#FFB6C1";
    ctx.fillText(userName, canvas.width / 2, currentY);

    currentY += 50;

    // মোট সদস্য সংখ্যা
    ctx.font = "bold 26px Arial";
    ctx.fillStyle = "#FFFF00";
    ctx.fillText(`মোট সদস্য: ${memberCount}`, canvas.width / 2, currentY);

    currentY += 60;

    // Added by প্রোফাইল
    const adderSize = 110;
    const adderX = (canvas.width - adderSize) / 2;
    const adderY = currentY;

    ctx.beginPath();
    ctx.arc(adderX + adderSize / 2, adderY + adderSize / 2, adderSize / 2 + 6, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    const adderAvatar = await Canvas.loadImage(adderAvatarPath);
    ctx.save();
    ctx.beginPath();
    ctx.arc(adderX + adderSize / 2, adderY + adderSize / 2, adderSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(adderAvatar, adderX, adderY, adderSize, adderSize);
    ctx.restore();

    currentY += adderSize + 30;

    // Added by নাম
    ctx.font = "bold 24px Arial";
    ctx.fillStyle = "#FF69B4";
    ctx.fillText(`👤 Added by ${adderName}`, canvas.width / 2, currentY);

    // Bot Owner সবসময় ডান পাশে নিচে
    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "#00FF00";
    ctx.textAlign = "right";
    ctx.fillText("👑 Bot Owner: Saiful Islam", canvas.width - 30, canvas.height - 30);

    fs.writeFileSync(outPath, canvas.toBuffer());

    const groupRules =
`📜 𝗚𝗥𝗢𝗨𝗣 𝗥𝗨𝗟𝗘𝗦 📜
১️⃣ সবাইকে সম্মান করবে 👥  
২️⃣ স্প্যাম বা লিংক দেওয়া নিষেধ 🚫  
৩️⃣ বাজে ভাষা ব্যবহার করা যাবে না ⚠️  
৪️⃣ ভুয়া তথ্য বা গুজব নয় ❌  
৫️⃣ অ্যাডমিনের সিদ্ধান্তই চূড়ান্ত 👑`;

    const message = {
      body:
`━━━━━━━━━━━━━━━━━━
🎉 স্বাগতম @${userName}! 🎉  

🏷️ গ্রুপ: ${groupName}  
🔢 তুমি এখন ${memberCount} নম্বর সদস্য  

👤 এড করেছেন: @${adderName}  
━━━━━━━━━━━━━━━━━━
💖 ধন্যবাদ @${adderName} 💖  
তোমার কারণে @${userName} এখন আমাদের সাথে! 🎊
━━━━━━━━━━━━━━━━━━
${groupRules}
━━━━━━━━━━━━━━━━━━
👑 𝐁𝐨𝐭 𝐎𝐰𝐧𝐞𝐫: 𝐒𝐚𝐢𝐟𝐮𝐥 𝐈𝐬𝐥𝐚𝐦
━━━━━━━━━━━━━━━━━━`,
      mentions: [
        { tag: `@${userName}`, id: userID },
        { tag: `@${adderName}`, id: adderID }
      ],
      attachment: fs.createReadStream(outPath)
    };

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
