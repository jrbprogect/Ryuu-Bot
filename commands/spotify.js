const axios = require('axios');
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
        const apiUrl = `http://spotifydl-api-54n8.onrender.com/download/6Csrqur3IfnVp0EtHskjMw/${encodeURIComponent(trackName)}.mp3`;

        await api.sendMessage(convertToGothic("Searching for your song, please wait..."), threadID, messageID);

        try {
            const response = await axios.get(apiUrl);

            if (response.data && response.data.track) {
                const { name, artist, album, downloadLink } = response.data.track;
                const duration = Math.floor(response.data.track.duration / 1000);
                const minutes = Math.floor(duration / 60);
                const seconds = duration % 60;
                const formattedDuration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
                const message = `Track: ${name}\nArtist: ${artist}\nAlbum: ${album}\nDuration: ${formattedDuration}\nDownload Link: ${downloadLink}`;

                await api.sendMessage(convertToGothic(message), threadID, messageID);
            } else {
                await api.sendMessage(convertToGothic("No results found. Please try again."), threadID, messageID);
            }
        } catch (error) {
            console.error(error);
            await api.sendMessage(convertToGothic("An error occurred while searching for the track."), threadID, messageID);
        }
    }
};
