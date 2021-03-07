const socket = io();

const formForMessage = document.getElementById("formForMessage");
const inputForMessage = document.getElementById("inputForMessage");
const messageContainer = document.getElementById("messageContainer");

if (formForMessage != null) {
	const userName = prompt("Please enter your name!");
	const userContainer = document.getElementById("userContainer");
	userContainer.textContent = userName;
	appendMessage(userName, "You Joined");
	socket.emit("user-connection", roomName, userName);

	formForMessage.addEventListener("submit", (e) => {
		e.preventDefault();
		const message = inputForMessage.value;
		appendMessage(userName, message);
		inputForMessage.value = "";
		socket.emit("message-sent", userName, roomName, message);
	});
}
inputForMessage.focus();
socket.on("user-connected", (user) => {
	appendMessage(user, "joined the room");
});

socket.on("new-message", (userName, message) => {
	appendMessage(userName, message);
});

function appendMessage(user, msg) {
	const linkEl = document.createElement("a");
	linkEl.classList.add("list-group-item");
	linkEl.classList.add("list-group-item-action");
	linkEl.innerHTML = `
			<div class="d-flex w-100 justify-content-between">
				<h5 class="mb-1">${user}</h5>
				<small class="text-muted">3 days ago</small>
			</div>
			<p class="mb-1">${msg}</p>
	`;
	messageContainer.appendChild(linkEl);
	window.scrollBy(0, document.body.scrollHeight + 40);
}
