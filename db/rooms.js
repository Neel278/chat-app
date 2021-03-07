const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
// 	users: {
// 		type: String,
// 	},
// });

const roomSchema = new mongoose.Schema({
	roomName: {
		type: String,
		required: true,
	},
	users: {
		type: Map,
		default: new Map(),
	},
});

module.exports = mongoose.model("Rooms", roomSchema);
