const { on } = require('events');
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
//setting up socket:
const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});


io.on("connection", (socket) => {
    //retreiving ID:
    socket.emit('me', socket.id);
    //ending the call
    socket.on('disconnect', () => {
        socket.broadcast.emit('callEnded');
    });
    //ability to call user by their ID:
    socket.on('callUser', (data) => {
        //data to call user:
        io.to(data.userToCall).emit("callUser", {signal: data.signalData, from: data.from, name: data.name});
    });
    //answering the call:
    socket.on('answerCall', (data) => io.to(data.to).emit("callAccepted", data.signal ));
});



server.listen(3500, ()=> console.log('server is live port 3500'));