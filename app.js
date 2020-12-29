const express = require("express");
const app = express();
var http = require('http').createServer(app);

// Node server which will handle socket io connections
var io = require('socket.io')(http);

const path = require('path');
const port = process.env.PORT || 3000;

// For serving static files
app.use('/static', express.static('../static'));

app.get('/', (req, res) => {
  res.sendFile(path.resolve('../views/index.html'));
});


const users = {};

io.on('connection', socket => {
    // If any new user joins, let other users connected to the server know!
    socket.on('new-user-joined', name => {
        // console.log("hi"); 
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });
    
    // If someone sends a message, broadcast it to other people
    socket.on('send', message => {
        socket.broadcast.emit('receive', { message: message, name: users[socket.id] })
    });
    
    // If someone leaves the chat, let others know 
    socket.on('disconnect', message => {
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
    });
    
    
})


http.listen(port, () => {
  console.log(`listening on *:${port}`);
});