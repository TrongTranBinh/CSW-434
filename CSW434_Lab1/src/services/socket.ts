import { io } from 'socket.io-client';

const SOCKET_URL = 'http://192.168.1.88:3000'; //Thay đổi tùy theo địa chỉ IPv4 của máy

export const socket = io(SOCKET_URL, {
	autoConnect: false,
});
