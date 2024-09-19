const axios = require('axios');
const fs = require('fs');
const getFBInfo = require('@xaviabot/fb-downloader');
const path = require('path');
const { convertToGothic } = require('../fontUtils');

module.exports = {
    name: "auto",
    description: "Automatically downloads and sends the content of a TikTok, Facebook, or Capcut link.",
    prefixRequired: false,
    adminOnly: false,
    auto: true, 

    autoActivate: (message) => {
        const tiktokLinkRegex = /https:\/\/(www\.|vt\.|vm\.)?tiktok\.com\/.*$/;
        const facebookLinkRegex = /https:\/\/(www\.)?facebook\.com\/.*$/;
        const capcutLinkRegex = /https:\/\/(www\.)?capcut\.com\/t\/.*$/;
        return tiktokLinkRegex.test(message) || facebookLinkRegex.test(message) || capcutLinkRegex.test(message);
    },

    execute: async function (api, event, args) {
        const { body, threadID, messageID } = event;

        if (body && body.includes('https://')) {
            const tiktokLinkRegex = /https:\/\/(www\.|vt\.|vm\.)?tiktok\.com\/.*$/;
            const facebookLinkRegex = /https:\/\/(www\.)?facebook\.com\/.*$/;
            const capcutLinkRegex = /https:\/\/(www\.)?capcut\.com\/t\/.*$/;
            const link = body;

            api.setMessageReaction("❤️", messageID, () => {}, true); 

            if (tiktokLinkRegex.test(link)) {
                await downloadAndSendTikTokContent(link, api, event);
            } else if (facebookLinkRegex.test(link)) {
                await downloadAndSendFBContent(link, api, event);
            } else if (capcutLinkRegex.test(link)) {
                await downloadAndSendCapcutContent(link, api, event);
            } else {
                api.sendMessage("Unsupported link type. Please provide a TikTok, Facebook, or Capcut link.", threadID);
            }
        }
    }
};

const downloadAndSendTikTokContent = async (url, api, event) => {
    try {
        const response = await axios.post('https://www.tikwm.com/api/', { url });
        const data = response.data.data;
        const videoStream = await axios({
            method: 'get',
            url: data.play,
            responseType: 'stream'
        }).then(res => res.data);

        const fileName = `TikTok-${Date.now()}.mp4`;
        const filePath = path.join(__dirname, fileName);
        const videoFile = fs.createWriteStream(filePath);

        videoStream.pipe(videoFile);

        videoFile.on('finish', () => {
            videoFile.close(() => {
                console.log(convertToGothic('Downloaded TikTok video file.'));
                api.sendMessage({
                    body: `${convertToGothic('📹 TikTok Video')}\nContent: ${convertToGothic(data.title)}\nLikes: ${data.digg_count}\nComments: ${data.comment_count}`,
                    attachment: fs.createReadStream(filePath)
                }, event.threadID, () => {
                    fs.unlinkSync(filePath); 
                });
            });
        });
    } catch (e) {
        console.error(e);
        api.sendMessage(`${convertToGothic("An error occurred while downloading the TikTok video.")}`, event.threadID);
    }
};

const downloadAndSendFBContent = async (url, api, event) => {
    const fbvid = path.join(__dirname, 'video.mp4'); 
    try {
        const result = await getFBInfo(url);
        let videoData = await axios.get(encodeURI(result.sd), { responseType: 'arraybuffer' });
        fs.writeFileSync(fbvid, Buffer.from(videoData.data, "utf-8"));

        api.sendMessage({
            body: `${convertToGothic('🎥 Facebook Video')}`,
            attachment: fs.createReadStream(fbvid)
        }, event.threadID, () => {
            fs.unlinkSync(fbvid); 
        });
    } catch (e) {
        console.error(e);
        api.sendMessage(`${convertToGothic("An error occurred while downloading the Facebook video.")}`, event.threadID);
    }
};

const downloadAndSendCapcutContent = async (url, api, event) => {
    try {
        const response = await axios.get(`https://ccexplorerapisjonell.vercel.app/api/capcut?url=${url}`);
        const { result } = response.data;

        const capcutFileName = `Capcut-${Date.now()}.mp4`;
        const capcutFilePath = path.join(__dirname, capcutFileName);

        const videoResponse = await axios({
            method: 'get',
            url: result.video_ori,
            responseType: 'arraybuffer'
        });

        fs.writeFileSync(capcutFilePath, Buffer.from(videoResponse.data, 'binary'));

        api.sendMessage({
            body: `${convertToGothic('🎬 Capcut Video')}\nTitle: ${convertToGothic(result.title)}\nDescription: ${convertToGothic(result.description)}`,
            attachment: fs.createReadStream(capcutFilePath)
        }, event.threadID, () => {
            fs.unlinkSync(capcutFilePath); 
        });
    } catch (e) {
        console.error(e);
        api.sendMessage(`${convertToGothic("An error occurred while downloading the Capcut video.")}`, event.threadID);
    }
};
