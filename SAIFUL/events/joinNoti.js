const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const Canvas = require("canvas");

module.exports.config = {
  name: "joinnoti",
  version: "2.5.0",
  credits: "Saiful Islam + Fixed by GPT-5",
  description: "Bangla welcome system with galaxy background",
  eventType: ["log:subscribe"],
};

module.exports.run = async function({ api, event, Users }) {
  try {
    const { threadID, logMessageData } = event;
    const added = logMessageData.addedParticipants?.[0];
    if (!added) return;

    const userID = added.userFbId;
    const userName = added.fullName || "New User";
    const botID = api.getCurrentUserID();

    const threadInfo = await api.getThreadInfo(threadID);
    const groupName = threadInfo.threadName || "এই গ্রুপে";
    const memberCount = threadInfo.participantIDs.length;
    const adderID = event.author;
    const adderName = (await Users.getNameUser(adderID)) || "Unknown";

    // 🌌 Galaxy background (your image)
    const bgURL = "https://i.ibb.co/VVPCV3C/galaxy-bg.jpg";

    // Profile pictures
    const avatarURL = `https://graph.facebook.com/${userID}/picture?width=512&height=512`;
    const adderAvatarURL = `https://graph.facebook.com/${adderID}/picture?width=512&height=512`;

    const cacheDir = path.join(__dirname, "cache");
    fs.ensureDirSync(cacheDir);
    const bgPath = path.join(cacheDir, "bg.jpg");
    const avatarPath = path.join(cacheDir, `avt_${userID}.png`);
    const adderAvatarPath = path.join(cacheDir, `adder_${adderID}.png`);
    const outPath = path.join(cacheDir, `welcome_${userID}.png`);

    // 🧩 Helper function: safe download
    async function downloadImage(url, dest) {
      try {
        const img = (await axios.get(url, { responseType: "arraybuffer" })).data;
        fs.writeFileSync(dest, Buffer.from(img));
        return true;
      } catch {
        return false;
      }
    }

    // Download all images safely
    const gotBG = await downloadImage(bgURL, bgPath);
    const gotUser = await downloadImage(avatarURL, avatarPath);
    const gotAdder = await downloadImage(adderAvatarURL, adderAvatarPath);

    // Canvas তৈরি
    const canvas = Canvas.createCanvas(800, 550);
    const ctx = canvas.getContext("2d");

    if (gotBG) {
      const background = await Canvas.loadImage(bgPath);
      ctx.drawImage(background, 0, 0, 800, 550);
    } else {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, 800, 550);
    }

    // ইউজার অ্যাভাটার
    const avatarSize = 180;
    const avatarX = (800 - avatarSize) / 2;
    const avatarY = 100;

    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 10, 0, Math.PI * 2);
    ctx.strokeStyle = "#00FFFF";
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.closePath();

    if (gotUser) {
      const avatar = await Canvas.loadImage(avatarPath);
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();
    }

    // এডার অ্যাভাটার
    const adderSize = 110;
    const adderX = (800 - adderSize) / 2;
    const adderY = 350;

    ctx.beginPath();
    ctx.arc(adderX + adderSize / 2, adderY + adderSize / 2, adderSize / 2 + 6, 0, Math.PI * 2);
    ctx.strokeStyle = "#FF69B4";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.closePath();

    if (gotAdder) {
      const adderAvatar = await Canvas.loadImage(adderAvatarPath);
      ctx.save();
      ctx.beginPath();
      ctx.arc(adderX + adderSize / 2, adderY + adderSize / 2, adderSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(adderAvatar, adderX, adderY, adderSize, adderSize);
      ctx.restore();
    }

    // টেক্সট
    ctx.textAlign = "center";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 8;

    ctx.font = "bold 38px Arial";
    ctx.fillStyle = "#FFD700";
    ctx.fillText(`🌟 ${userName} 🌟`, 400, avatarY + avatarSize + 50);

    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "#00FFFF";
    ctx.fillText(`${groupName}`, 400, avatarY + avatarSize + 95);

    ctx.font = "bold 26px Arial";
    ctx.fillStyle = "#FF69B4";
    ctx.fillText(`সদস্য সংখ্যা: ${memberCount}`, 400, avatarY + avatarSize + 135);

    ctx.font = "bold 24px Arial";
    ctx.fillStyle = "#ADFF2F";
    ctx.fillText(`👤 Added by ${adderName}`, 400, adderY + adderSize + 40);

    const finalBuffer = canvas.toBuffer();
    fs.writeFileSync(outPath, finalBuffer);

    // গ্রুপ রুলস
    const groupRules = 
`📜 𝗚𝗥𝗢𝗨𝗣 𝗥𝗨𝗟𝗘𝗦 📜
১️⃣ সবাইকে সম্মান করবে 👥  
২️⃣ স্প্যাম বা লিংক দেওয়া নিষেধ 🚫  
৩️⃣ বাজে ভাষা নয় ⚠️  
৪️⃣ গুজব নয় ❌  
৫️⃣ অ্যাডমিনের সিদ্ধান্তই চূড়ান্ত 👑`;

    let message;

    if (userID == botID) {
      message = {
        body: 
`🤖 𝐁𝐎𝐓 𝐎𝐍𝐋𝐈𝐍𝐄 🤖
━━━━━━━━━━━━━━━━━━
ধন্যবাদ 💖 @${adderName}  
আমাকে গ্রুপে যুক্ত করার জন্য 🥰  

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

    await api.sendMessage(message, threadID);
    // Cleanup
    [bgPath, avatarPath, adderAvatarPath, outPath].forEach(p => {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    });

  } catch (err) {
    console.error("Joinnoti Fatal Error:", err);
    return api.sendMessage("⚙️ দুঃখিত, ওয়েলকাম মডিউলে ত্রুটি ঘটেছে ⚙️", event.threadID);
  }
};
