const Message = require("../Model/message")
const mongoose = require("mongoose")
module.exports = {
    async publicChat(req, res) {
        try {
            console.log("==-io")
            const { content } = req.body;
            console.log(req.body, "===")
            if (!content) {
                return res.status(400).send('Please provide  content for public chat messages.');
            }
            let attachement = []
            if (req.files) {
                req.files.forEach(file => {
                    console.log(file.path)
                    var att = process.env.Backend_URL_Image + file.path
                    attachement.push(att)
                })
            }
            const message = new Message({
                type: 'public',
                sender: req.user._id,
                attachement: attachement,
                content: content,
            });
            await message.save();
            return res.status(201).json(message);
        } catch (error) {
            console.error('Error sending public chat message:', error);
            return res.status(500).json({ error: 'Failed to send public chat message.' });
        }
    },
    async privateChat(req, res) {
        try {
            const { receiver, content } = req.body;
            if (!receiver || !content) {
                return res.status(400).send('Please provide receiver, and content for private chat messages.');
            }
            let attachement = []
            if (req.files) {
                req.files.forEach(file => {
                    console.log(file.path)
                    var att = process.env.Backend_URL_Image + file.path
                    attachement.push(att)
                })
            }
            // Validate sender and receiver as valid MongoDB ObjectIds
            const isValidObjectId = mongoose.Types.ObjectId.isValid;
            if (!isValidObjectId(req.user._id) || !isValidObjectId(receiver)) {
                return res.status(400).send('Invalid sender or receiver.');
            }
            const message = new Message({
                type: 'private',
                sender: req.user._id,
                attachement: attachement,
                receiver: receiver,
                content: content,
            });
            await message.save();

            return res.status(201).json(message);
        } catch (error) {
            console.error('Error sending private chat message:', error);
            return res.status(500).json({ error: 'Failed to send private chat message.' });
        }

    },
    async messages(req, res) {
        try {
            const { type } = req.query
            if (type == "private") {
                const get = await Message.find({ type: 'private', receiver: req.user._id }).populate("sender","image").select("sender content attachement createdAt")
                return res.status(200).send(get)
            } else {
                const get = await Message.find({ type: 'public' }).populate("sender","image").select("sender content attachement createdAt")
                return res.status(200).send(get)
            }
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    },
    async delete_message(req, res) {
        try {
            const { id } = req.params
            const data = await Message.findOneAndDelete({ _id: id })
            if (!data) {
                return res.status(400).send("something went wrong")
            } else {
                return res.status(200).send("delete message successfully")
            }
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    },
    async update_message(req, res) {
        try {
            const { id } = req.params
            const data = await Message.findByIdAndUpdate({ _id: id }, { content: req.body.content, attachement: req.body.attachement }, { new: true })
            if (!data) {
                return res.status(400).send("something went wrong")
            } else {
                return res.status(200).send("update successfully")

            }
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    }
}