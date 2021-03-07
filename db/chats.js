const mongoose = require("mongoose");
const chatSchema = new mongoose.Schema({
	roomId: {
		type: mongoose.Types.ObjectId,
		required: true,
	},
	messages: {
		type: Map,
		default: new Map(),
	},
});

module.exports = mongoose.model("chats", chatSchema);
