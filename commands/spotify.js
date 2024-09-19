const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { convertToGothic } = require('../fontUtils');

module.exports = {
    name: "spotify",
    description: "Search music from Spotify",
    prefixRequired: false,
    adminOnly: false,
    async execute(api, event, args) {
        const { threadID, messageID } = event;

        if (args.length === 0) {
            await api.sendMessage(convertToGothic("Please provide a track name to search."), threadID, messageID);
            return;
        }

        const trackName = args.join(' ');
        const searchUrl = `https://spotifydl-api-54n8.onrender.com/spotifydl?search=${encodeURIComponent(trackName)}`;

        await api.sendMessage(convertToGothic("Searching for your song, please wait..."), threadID, messageID);

        try {
            const searchResponse = await axios.get(searchUrl);

            if (searchResponse.data && searchResponse.data.track) {
                const { name, artist, album, downloadLink } = searchResponse.data.track;
                const duration = Math.floor(searchResponse.data.track.duration / 1000);
                const minutes = Math.floor(duration / 60);
                const seconds = duration % 60;
                const formattedDuration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

                const message = `Track: ${name}\nArtist: ${artist}\nAlbum: ${album}\nDuration: ${formattedDuration}\nDownloading the track...`;

                await api.sendMessage(convertToGothic(message), threadID, messageID);

                const filePath = path.join(__dirname, `${name}.mp3`);
                const fileResponse = await axios.get(downloadLink, { responseType: 'arraybuffer' });
                fs.writeFileSync(filePath, fileResponse.data);

                await api.sendMessage({
                    body: "Here is your song!",
                    attachment: fs.createReadStream(filePath)
                }, threadID, messageID);

                fs.unlinkSync(filePath);
            } else {
                await api.sendMessage(convertToGothic("No results found. Please try again."), threadID, messageID);
            }
        } catch (error) {
            console.error(error);
            await api.sendMessage(convertToGothic("An error occurred while searching for the track."), threadID, messageID);
        }
    }
};
