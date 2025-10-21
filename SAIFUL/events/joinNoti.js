const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const Canvas = require("canvas");

module.exports.config = {
  name: "joinnoti",
  version: "1.2.0",
  credits: "Maria + rX Abdullah + Saiful Islam + বাংলা Caption Edit by GPT-5",
  description: "Welcome system with Bangla captions for bot & members",
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

  // কে এড করলো
  const adderID = event.author;
  const adderName = (await Users.getNameUser(adderID)) || "Unknown";

  // সময়
  const timeString = new Date().toLocaleString("bn-BD", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  // ব্যাকগ্রাউন্ড + প্রোফাইল
  const bgURL = "https://i.postimg.cc/rmkVVbsM/r07qxo-R-Download.jpg";
  const newUserAvatar = `https://graph.facebook.com/${userID}/picture?width=512&height=512`;
  const adderAvatar = `https://graph.facebook.com/${adderID}/picture?width=512&height=512`;

  const cacheDir = path.join(__dirname, "cache");
  fs.ensureDirSync(cacheDir);

  const bgPath = path.join(cacheDir, "bg.jpg");
  const newUserPath = path.join(cacheDir, `new_${userID}.png`);
  const adderPath = path.join(cacheDir, `adder_${adderID}.png`);
  const outPath = path.join(cacheDir, `welcome_${userID}.png`);

  try {
    // 🖼️ ইমেজ ডাউনলোড
    const bgImg = (await axios.get(bgURL, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(bgPath, Buffer.from(bgImg));

    const userImg = (await axios.get(newUserAvatar, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(newUserPath, Buffer.from(userImg));

    const adderImg = (await axios.get(adderAvatar, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(adderPath, Buffer.from(adderImg));

    // 🎨 ক্যানভাস তৈরি
    const canvas = Canvas.createCanvas(800, 700);
    const ctx = canvas.getContext("2d");
    const background = await Canvas.loadImage(bgPath);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Helper ফাংশন রাউন্ড ইমেজের জন্য
    const drawRoundImage = async (path, x, y, size) => {
      const img = await Canvas.loadImage(path);
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, x, y, size, size);
      ctx.restore();
    };

    // 1️⃣ নতুন মেম্বারের প্রোফাইল পিক
    const userSize = 160;
    const userX = (canvas.width - userSize) / 2;
    const userY = 40;
    await drawRoundImage(newUserPath, userX, userY, userSize);

    ctx.textAlign = "center";

    // 2️⃣ নতুন মেম্বারের নাম
    ctx.font = "bold 36px Arial";
    ctx.fillStyle = "#FFD700";
    ctx.fillText(userName, canvas.width / 2, userY + userSize + 50);

    // 3️⃣ গ্রুপ নাম
    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "#00FFFF";
    ctx.fillText(groupName, canvas.width / 2, userY + userSize + 100);

    // 4️⃣ মোট সদস্য সংখ্যা
    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(`মোট সদস্য: ${memberCount}`, canvas.width / 2, userY + userSize + 150);

    // 5️⃣ এডার প্রোফাইল পিক
    const adderSize = 130;
    const adderX = (canvas.width - adderSize) / 2;
    const adderY = userY + userSize + 190;
    await drawRoundImage(adderPath, adderX, adderY, adderSize);

    // 6️⃣ এডারের নাম
    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "#ADFF2F";
    ctx.fillText(adderName, canvas.width / 2, adderY + adderSize + 40);

    // 7️⃣ Bot Owner নিচের ডান পাশে
    ctx.font = "bold 22px Arial";
    ctx.fillStyle = "#FF69B4";
    ctx.textAlign = "right";
    ctx.fillText("Bot Owner: Saiful Islam 💻", canvas.width - 20, canvas.height - 20);

    // চূড়ান্ত ইমেজ সেভ
    const finalBuffer = canvas.toBuffer();
    fs.writeFileSync(outPath, finalBuffer);

    // 📜 Group Rules
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
        body: `━━━━━━━━━━━━━━━━━━
🤖 𝐁𝐎𝐓 𝐎𝐍𝐋𝐈𝐍𝐄 🤖
━━━━━━━━━━━━━━━━━━
ধন্যবাদ ভাই @${adderName} আমাকে গ্রুপে এড করার জন্য 💖  
আমি এখন এই গ্রুপে একটিভ আছি 😎  

🛠️ লিখুন: help — সব কমান্ড দেখতে  
👑 Bot Owner : Saiful Islam 💻
━━━━━━━━━━━━━━━━━━`,
        mentions: [{ tag: `@${adderName}`, id: adderID }],
        attachment: fs.createReadStream(outPath)
      };
    } else {
      message = {
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
👑 𝐁𝐨𝐭 𝐎𝐰𝐧𝐞𝐫: 𝐒𝐚𝐢𝐟𝐮𝐥 𝐈𝐬𝐥𝐚𝐦
━━━━━━━━━━━━━━━━━━`,
        mentions: [
          { tag: `@${userName}`, id: userID },
          { tag: `@${adderName}`, id: adderID }
        ],
        attachment: fs.createReadStream(outPath)
      };
    }

    api.sendMessage(message, threadID, () => {
      fs.unlinkSync(bgPath);
      fs.unlinkSync(newUserPath);
      fs.unlinkSync(adderPath);
      fs.unlinkSync(outPath);
    });

  } catch (error) {
    console.error("Joinnoti error:", error);
    api.sendMessage("⚙️ দুঃখিত, ওয়েলকাম মডিউলে ত্রুটি ঘটেছে ⚙️", threadID);
  }
};
