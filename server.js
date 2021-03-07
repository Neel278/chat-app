const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const mongoose = require("mongoose");
const roomSchema = require("./db/rooms");
const chatSchema = require("./db/chats");

mongoose.connect("mongodb://localhost:27017/chat-app", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
});

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/favicon.ico", (req, res) => res.sendStatus(204));

app.get("/", async (req, res) => {
	let rooms = await roomSchema.find();
	rooms = rooms.map((room) => [room._id, room.roomName]);
	res.render("index", { rooms });
});

app.get("/:roomName", async (req, res) => {
	const chatRoom = await chatSchema.findOne({ roomId: req.params.roomName });
	res.render("room", {
		roomName: req.params.roomName,
		messages: chatRoom.messages,
	});
});

app.post("/createRoom", (req, res) => {
	const room = new roomSchema();
	room.roomName = req.body.roomName;
	room.users = {};
	room.save((err, data) => {
		if (err) console.log(err);
		else {
			const chat = new chatSchema();
			chat.roomId = data._id;
			chat.messages = new Map();
			chat.save((err) => {
				if (err) console.log(err.message);
				else res.redirect(data._id);
			});
		}
	});
});

io.on("connection", (socket) => {
	const myId = socket.id;
	socket.on("user-connection", async (roomName, userName) => {
		socket.join(roomName);
		let data = await roomSchema.findById(roomName);
		let users = data.users;
		users.set(myId, userName);
		roomSchema.findByIdAndUpdate(roomName, { users: users }, (err, data) => {
			if (err) console.log(err);
		});
		socket.to(roomName).broadcast.emit("user-connected", userName);
	});
	socket.on("message-sent", async (userName, roomName, message) => {
		let chat = await chatSchema.findOne({ roomId: roomName });
		let messages = chat.messages;
		let time = Date.now();
		messages.set(`${userName}_${time}`, message);
		chatSchema.findByIdAndUpdate(chat._id, { messages: messages }, (err) => {
			if (err) console.log(err);
		});
		socket.to(roomName).broadcast.emit("new-message", userName, message);
	});
	socket.on("disconnect", async () => {
		const mySymbol = Object.getOwnPropertySymbols(socket.request)[1];
		const roomId = socket.request[mySymbol].referer.split("/")[3];
		const chatRoom = await roomSchema.findById(roomId);
		if (chatRoom != null) {
			let users = chatRoom.users;
			users.delete(myId);
			roomSchema.findByIdAndUpdate(chatRoom._id, { users: users }, (err) => {
				if (err) console.log(err);
			});
		}
	});
});
server.listen(3000);
