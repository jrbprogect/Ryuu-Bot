const axios = require('axios');

module.exports = {
    name: "tmail",
    description: "temporary email generator.",
    prefixRequired: false,
    adminOnly: false,
    async execute(api, event, args) {
        if (args.length === 0) {
            await api.sendMessage('Please provide a command: `generate`, `create`, `delete`, `inbox`, or `domains`', event.threadID, event.messageID);
            return;
        }

        const command = args[0];
        const email = args[1];

        try {
            if (command === 'generate') {
                const response = await axios.get('https://t-mail.vercel.app/api/generate_email');
                const { email } = response.data;
                await api.sendMessage(`Your temporary email address is: ${email}`, event.threadID, event.messageID);
            } else if (command === 'create') {
                if (!email) {
                    await api.sendMessage('Please provide the email address to create (e.g., name@domain.com).', event.threadID, event.messageID);
                    return;
                }
                const response = await axios.get(`https://t-mail.vercel.app/api/create_email?email=${encodeURIComponent(email)}`);
                const { status, email: createdEmail } = response.data;
                if (status) {
                    await api.sendMessage(`Email address ${createdEmail} has been created.`, event.threadID, event.messageID);
                } else {
                    await api.sendMessage('Failed to create the email address. Please try again later.', event.threadID, event.messageID);
                }
            } else if (command === 'delete') {
                if (!email) {
                    await api.sendMessage('Please provide the email address to delete.', event.threadID, event.messageID);
                    return;
                }
                const response = await axios.get(`https://t-mail.vercel.app/api/delete_email?email=${encodeURIComponent(email)}`);
                const { status, message } = response.data;
                if (status) {
                    await api.sendMessage(`Email address ${email} has been deleted.`, event.threadID, event.messageID);
                } else {
                    await api.sendMessage('Failed to delete the email address. Please try again later.', event.threadID, event.messageID);
                }
            } else if (command === 'inbox') {
                if (!email) {
                    await api.sendMessage('Please provide the email address to retrieve inbox for.', event.threadID, event.messageID);
                    return;
                }
                const response = await axios.get(`https://t-mail.vercel.app/api/inbox?email=${encodeURIComponent(email)}`);
                const { status, data } = response.data;
                if (status) {
                    if (data.length === 0) {
                        await api.sendMessage('Your inbox is empty.', event.threadID, event.messageID);
                    } else {
                        const messages = data.slice(0, 5).map(msg => `From: ${msg.from}\nSubject: ${msg.subject}\nDate: ${msg.date}`).join('\n\n---\n\n');
                        await api.sendMessage(`Inbox:\n\n${messages}`, event.threadID, event.messageID);
                    }
                } else {
                    await api.sendMessage('Failed to retrieve inbox. Please try again later.', event.threadID, event.messageID);
                }
            } else if (command === 'domains') {
                const response = await axios.get('https://t-mail.vercel.app/api/emails');
                const { status, emails } = response.data;
                if (status) {
                    const domainList = emails.join('\n');
                    await api.sendMessage(`Available email domains:\n\n${domainList}`, event.threadID, event.messageID);
                } else {
                    await api.sendMessage('Failed to retrieve available domains. Please try again later.', event.threadID, event.messageID);
                }
            } else {
                await api.sendMessage('Unknown command. Please use `generate`, `create`, `delete`, `inbox`, or `domains`.', event.threadID, event.messageID);
            }
        } catch (error) {
            console.error('Error handling tempmail command:', error);
            await api.sendMessage('An error occurred while processing your request. Please try again later.', event.threadID, event.messageID);
        }
    },
};
