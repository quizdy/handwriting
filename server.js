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
        console.info('sender_draw_start')
        socket.broadcast.emit('recieve_draw_start', line)
    })

    socket.on('sender_draw', (line, height, width) => {
        socket.broadcast.emit('recieve_draw', line, height, width)
    })

    socket.on('sender_draw_stop', (line, height, width) => {
        console.info('sender_draw_stop')
        socket.broadcast.emit('recieve_draw_stop', line, height, width)
    })

    socket.on('disconnect', () => {
        console.info('disconnect', socket.id)
    })
})

server.listen(8080, () => console.log('running... port:8080'))