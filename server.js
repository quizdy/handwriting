const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const url = require('url')

const app = express()
const server = http.Server(app)
const io = socketio(server)

app.use(express.static(path.resolve(__dirname, 'public')))

io.on('connection', (socket) => {
    console.info('connection', socket.id)
    socket.on('sender_draw_start', (line) => {
        console.info('sender_draw_start', line)
        socket.broadcast.emit('recieve_draw_start', line)
    })

    socket.on('sender_draw', (line) => {
        console.info('sender_draw', line)
        socket.broadcast.emit('recieve_draw', line)
    })

    socket.on('sender_draw_stop', (line) => {
        console.info('sender_draw_stop', line)
        socket.broadcast.emit('recieve_draw_stop', line)
    })

    socket.on('sender_draw_clear', () => {
        console.info('sender_draw_clear')
        socket.broadcast.emit('recieve_draw_clear', )
    })

    socket.on('disconnect', () => {
        console.info('disconnect', socket.id)
    })
})

server.listen(8080, () => console.log('running... port:8080'))