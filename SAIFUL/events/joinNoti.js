const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const Canvas = require("canvas");

module.exports.config = {
  name: "joinnoti",
  version: "2.2.0",
  credits: "Maria + rX Abdullah + Saiful Islam + বাংলা Font Fix by GPT-5",
  description: "Welcome system with Bangla name font support",
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

  const bgURL = "https://i.postimg.cc/rmkVVbsM/r07qxo-R-Download.jpg";
  const avatarURL = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
  const adderAvatarURL = `https://graph.facebook.com/${adderID}/picture?width=256&height=256&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

  const cacheDir = path.join(__dirname, "cache");
  fs.ensureDirSync(cacheDir);

  const bgPath = path.join(cacheDir, "bg.jpg");
  const avatarPath = path.join(cacheDir, `avt_${userID}.png`);
  const adderAvatarPath = path.join(cacheDir, `adder_${adderID}.png`);
  const outPath = path.join(cacheDir, `welcome_${userID}.png`);

  // 🪶 বাংলা ফন্ট রেজিস্টার
  try {
    const fontPath = path.join(__dirname, "fonts", "NotoSansBengali-Regular.ttf");
    if (fs.existsSync(fontPath)) {
      Canvas.registerFont(fontPath, { family: "BanglaFont" });
    } else {
      console.warn("⚠️ বাংলা ফন্ট (NotoSansBengali-Regular.ttf) পাওয়া যায়নি! fonts ফোল্ডারে দিয়ে দাও।");
    }
  } catch (e) {
    console.log("Font load error:", e);
  }

  try {
    // 📥 ইমেজ ডাউনলোড
    const [bgImg, avatarImg, adderImg] = await Promise.all([
      axios.get(bgURL, { responseType: "arraybuffer" }),
      axios.get(avatarURL, { responseType: "arraybuffer" }),
      axios.get(adderAvatarURL, { responseType: "arraybuffer" })
    ]);

    fs.writeFileSync(bgPath, Buffer.from(bgImg.data));
    fs.writeFileSync(avatarPath, Buffer.from(avatarImg.data));
    fs.writeFileSync(adderAvatarPath, Buffer.from(adderImg.data));

    const canvas = Canvas.createCanvas(800, 500);
    const ctx = canvas.getContext("2d");

    // ব্যাকগ্রাউন্ড
    const background = await Canvas.loadImage(bgPath);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // নতুন মেম্বার প্রোফাইল
    const avatarSize = 180;
    const avatarX = (canvas.width - avatarSize) / 2;
    const avatarY = 100;

    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 8, 0, Math.PI * 2, false);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    const avatar = await Canvas.loadImage(avatarPath);
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // Added By Photo
    const adderSize = 100;
    const adderX = 50;
    const adderY = 50;

    ctx.beginPath();
    ctx.arc(adderX + adderSize / 2, adderY + adderSize / 2, adderSize / 2 + 5, 0, Math.PI * 2, false);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    const adderAvatar = await Canvas.loadImage(adderAvatarPath);
    ctx.save();
    ctx.beginPath();
    ctx.arc(adderX + adderSize / 2, adderY + adderSize / 2, adderSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(adderAvatar, adderX, adderY, adderSize, adderSize);
    ctx.restore();

    // টেক্সট অংশ (বাংলা ফন্টে)
    ctx.textAlign = "center";
    ctx.font = "bold 36px BanglaFont";
    ctx.fillStyle = "#FFB6C1";
    ctx.fillText(userName, canvas.width / 2, avatarY + avatarSize + 50);

    ctx.font = "bold 30px BanglaFont";
    ctx.fillStyle = "#00FFFF";
    ctx.fillText(groupName, canvas.width / 2, avatarY + avatarSize + 90);

    ctx.font = "bold 28px BanglaFont";
    ctx.fillStyle = "#FFFF00";
    ctx.fillText(`মোট সদস্য: ${memberCount}`, canvas.width / 2, avatarY + avatarSize + 130);

    ctx.font = "bold 22px BanglaFont";
    ctx.fillStyle = "#FF69B4";
    ctx.fillText(`Bot Owner: Saiful Islam 💻`, canvas.width - 180, canvas.height - 30);

    ctx.textAlign = "left";
    ctx.font = "bold 22px BanglaFont";
    ctx.fillStyle = "#00FF7F";
    ctx.fillText(`Added by: ${adderName}`, adderX + 5, adderY + adderSize + 30);

    // ইমেজ আউটপুট
    const finalBuffer = canvas.toBuffer();
    fs.writeFileSync(outPath, finalBuffer);

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
ধন্যবাদ ভাই ${adderName} আমাকে গ্রুপে এড করার জন্য 💖  
আমি এখন এই গ্রুপে একটিভ আছি 😎  

🛠️ লিখুন: help — সব কমান্ড দেখতে  
👑 Bot Owner : Saiful Islam 💻
━━━━━━━━━━━━━━━━━━`,
        mentions: [{ tag: adderName, id: adderID }],
        attachment: fs.createReadStream(outPath)
      };
    } else {
      message = {
        body: 
`━━━━━━━━━━━━━━━━━━
🎉 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗧𝗢 𝗧𝗛𝗘 𝗚𝗥𝗢𝗨𝗣 🎉
━━━━━━━━━━━━━━━━━━
👋 স্বাগতম @${userName}!  
🏷️ গ্রুপ : ${groupName}  
🔢 তুমি এখন ${memberCount} নম্বর সদস্য 🎉  
👤 এড করেছেন : @${adderName}  
━━━━━━━━━━━━━━━━━━
${groupRules}
━━━━━━━━━━━━━━━━━━
👑 Bot Owner : Saiful Islam 💻`,
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
    console.error("Joinnoti error:", error);
    api.sendMessage("⚙️ দুঃখিত, ওয়েলকাম মডিউলে ত্রুটি ঘটেছে ⚙️", threadID);
  }
};
