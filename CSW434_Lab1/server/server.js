const express = require('express');
const http = require('http');
const cors = require('cors');

const { Server } = require('socket.io');

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
	},
});

// Kiểm tra server
app.get('/', (req, res) => {
	res.send('Group Chat Server is running');
});

// Khi client kết nối
io.on('connection', (socket) => {
	console.log('Connected:', socket.id);

	// Client tham gia chat
	socket.on('join', (username) => {
		socket.data.username = username;

		console.log(`${username} joined the chat`);

		// Thông báo cho các client khác
		socket.broadcast.emit('user_joined', {
			username,
		});
	});

	// Client gửi tin nhắn
	socket.on('send_message', (message) => {
		console.log('Received:', message);

		// Broadcast tin nhắn đến tất cả client
		io.emit('new_message', message);
	});

	// Client ngắt kết nối
	socket.on('disconnect', () => {
		console.log('Disconnected:', socket.id);
	});
});

const PORT = 3000;

server.listen(PORT, '0.0.0.0', () => {
	console.log(`Server running at port ${PORT}`);
});
