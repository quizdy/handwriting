const socket = io.connect()

socket.io.on('connect_error', (e) => {
    console.error(e)
})
socket.io.on('reconnect_failed', (e) => {
    console.error(e)
})