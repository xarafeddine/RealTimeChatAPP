const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getRooms
} = require('./utils/users')

const app = express()

const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

let count = 0
io.on('connection', (socket)=>{
    console.log('Now websocket connection')


    
    socket.on('join',({username, room}, callback)=>{
        const {error, user} =  addUser({id: socket.id, username, room })
        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('admin', "Welcom!"))
        socket.broadcast.to(user.room).emit('message', generateMessage('admin', `${user.username} has joined!`))
    
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        io.emit('appData', {
            availableRooms: getRooms()
        })
        callback()
    } )

    

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage('admin', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })

            io.emit('appData', {
                availableRooms: getRooms()
            })
        }
    })


    socket.on('sendMessage', (message, callback)=>{
        const filter = new Filter()
        const user = getUser(socket.id)

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }
        
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (position, callback)=>{
        const user = getUser(socket.id)
        if(!position){
            return callback('location has not been sent')
        }
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${position.lat},${position.long}`))
        callback()
    })
})

server.listen(port, ()=>{
    console.log('Server in up on port:', port)
})

module.exports = server;