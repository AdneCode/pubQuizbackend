const corsMiddleWare = require('cors');
const { Server } = require('socket.io');
const PORT = 4000;

//Server setup
const express = require('express');
const app = express();

// Socket setup
const http = require('http');
const server = http.createServer(app);
const io = new Server(server);

//Functions
const addPlayerToPlayers = require('/functions/addPlayerToPlayers');
const addPlayerToRoom = require('/functions/addPlayerToRoom');
const findPlayerBySocketId = require('/functions/findPlayerBySocketId');
const createRoom = require('/functions/createRoom');

let roomState = [];
let players = [];

app.use(corsMiddleWare());
app.use(express.json());

//Every socket.on and socket.emit needs to be wrapped around "io.on('connection, socket)"
io.on('connection', (socket) => {
    socket.on('joinRoom', (data) => {
        const { roomId, name } = data;
        const player = findPlayerBySocketId(socket.id);
        roomState = addPlayerToRoom(player, roomId, roomState);
        io.emit('roomUpdate', roomState);
    });

    //event when client wants to host a game
    socket.on('createRoom', (data) => {
        const { name } = data;
        const player = findPlayerBySocketId(socket.id);
        roomState = createRoom(info, player, roomState);
        players = addPlayerToPlayers(socket.id, name, players);
        io.emit('roomUpdate', roomState);
    });

    //event to handle the client choosing an answer. May be called by client multiple times until timer runs out
    //in order to refresh their answer
    socket.on('lockQuestion', (answerId, roomId) => {
        const player = findPlayerBySocketId(socket.id);
        roomState = setAnswerFronPlayer(answerId, player, roomId, roomState);
    });
});

server.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});

module.exports = server;
