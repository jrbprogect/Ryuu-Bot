const axios = require('axios');

module.exports = {
    name: "rizz",
    description: "Sends a random rizz lines",
    prefixRequired: false,
    adminOnly: false,
    async execute(api, event, args) {
        try {
            const response = await axios.get('https://api.popcat.xyz/pickuplines');
            const { pickupline } = response.data;

            await api.sendMessage(`"${pickupline}"`, event.threadID, event.messageID);
        } catch (error) {
            await api.sendMessage('Sorry, something went wrong while fetching a pickup line. Please try again later.', event.threadID, event.messageID);
        }
    },
};