module.exports = {
    name: "uid",
    description: "Get your user ID.",
    prefixRequired: false,
    adminOnly: false,
    async execute(api, event, args) {
        try {
            const { threadID, messageID, senderID } = event;
            if (!senderID) {
                console.error("Sender ID is missing.");
                return;
            }
            await api.sendMessage(`Your UID is: ${senderID}`, threadID, messageID);
        } catch (error) {
            console.error("Error executing uid command:", error);
        }
    },
};
