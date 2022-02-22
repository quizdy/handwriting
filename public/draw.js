var _line = {
    color: '#000',
    weight: 2,
    fill: false,
    erase: false,
    enabled: false,
}

function init() {
    $('.whiteboard canvas.draw').attr('height', $('.whiteboard').height())
    $('.whiteboard canvas.draw').attr('width', $('.whiteboard').width())
    _line
    $('.reciever canvas.draw').attr('height', $('.reciever').height())
    $('.reciever canvas.draw').attr('width', $('.reciever').width())
}

$(document).on('click', '.whiteboard>.clear', (_e) => {
    const canvas = $('.whiteboard canvas.draw').get(0)
    const context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height)
    _line.weight = 2
    _line.erase = false
    socket.emit('sender_draw_clear')
    $('.whiteboard>.eraser').removeClass('active')
})

$(document).on('click', '.whiteboard>.eraser', (e) => {
    if (_line.erase) {
        _line.weight = 2
        _line.erase = false
        $(e.currentTarget).removeClass('active')
    } else {
        _line.weight = 20
        _line.erase = true
        $(e.currentTarget).addClass('active')
    }
})

$(document).on('touchstart mousedown', '.whiteboard>canvas.draw', (e) => {
    _line.enabled = true
    const canvas = $('.whiteboard canvas.draw').get(0)
    const pos = getPos(canvas, e)
    _line.x0 = pos.x
    _line.y0 = pos.y
    _line.width = canvas.width
    _line.height = canvas.height
    socket.emit('sender_draw_start', _line)
})

$(document).on('touchmove mousemove', '.whiteboard>canvas.draw', (e) => {
    e.stopPropagation()
    if (!_line.enabled) return
    const canvas = $('.whiteboard canvas.draw').get(0)
    const pos = getPos(canvas, e)
    _line.x1 = pos.x
    _line.y1 = pos.y
    throttle(drawing(canvas, _line), 100)
    _line.x0 = pos.x
    _line.y0 = pos.y
})

$(document).on('touchend mouseup', '.whiteboard>canvas.draw', (e) => {
    if (!_line.enabled) return
    _line.enabled = false
    const canvas = $('.whiteboard canvas.draw').get(0)
    const pos = getPos(canvas, e)
    _line.x1 = pos.x
    _line.y1 = pos.y
    drawing(canvas, _line)
    socket.emit('sender_draw_stop', _line)
})

function getPos(canvas, e) {
    const rect = $(canvas).offset()

    if (typeof e.pageX === 'undefined') {
        return {
            x: e.changedTouches[0].pageX - rect.left,
            y: e.changedTouches[0].pageY - rect.top,
        }
    } else {
        return {
            x: e.pageX - rect.left,
            y: e.pageY - rect.top,
        }
    }
}

function drawing(canvas, line) {
    const context = canvas.getContext('2d')

    if (line.erase) {
        context.globalCompositeOperation = "destination-out"
    } else {
        context.globalCompositeOperation = "source-over"
    }

    context.beginPath()
    context.moveTo(line.x0, line.y0)
    context.lineTo(line.x1, line.y1)
    context.strokeStyle = line.color
    context.lineWidth = line.weight
    context.lineCap = "round"
    context.stroke()
    context.closePath()

    socket.emit('sender_draw', line)
}

function throttle(func, wait, options) {
    var context, args, result
    var timeout = null
    var previous = 0

    if (!options) options = {}
    var later = () => {
        previous = options.leading === false ? 0 : Date.now()
        timeout = null
        result = func.apply(context, args)
        if (!timeout) context = args = null
    }

    return () => {
        var now = Date.now()

        if (!previous && options.leading === false) previous = now

        var remaining = wait - (now - previous)

        context = this

        args = arguments

        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout)
                timeout = null
            }

            previous = now
            result = func.apply(context, args)

            if (!timeout) context = args = null
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining)
        }

        return result
    }
}

var _rev = {
    color: '#000',
    weight: 2,
    fill: false,
    erase: false,
    enabled: false,
}

socket.on('recieve_draw_start', (res) => {
    console.info('recieve_draw_start', res)
    _rev.x0 = res.x0
    _rev.y0 = res.y0
    _rev.width = res.width
    _rev.height = res.height
    _rev.color = res.color
    _rev.weight = res.weight
    _rev.fill = res.fill
    _rev.erase = res.erase
})

socket.on('recieve_draw', (res, height, width) => {
    console.info('recieve_draw', res, height, width)
    _rev.x1 = res.x1
    _rev.y1 = res.y1
    const canvas = $('.reciever canvas.draw').get(0)
    revDrawing(canvas, _rev, height, width)
    _rev.x0 = res.x0
    _rev.y0 = res.y0
})

socket.on('recieve_draw_stop', (res, height, width) => {
    console.info('recieve_draw_stop', res, height, width)
    _rev.x1 = res.x1
    _rev.y1 = res.y1
    const canvas = $('.reciever canvas.draw').get(0)
    revDrawing(canvas, _rev, height, width)
})

socket.on('recieve_draw_clear', () => {
    const canvas = $('.reciever canvas.draw').get(0)
    const context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height)
})

function revDrawing(canvas, line, height, width) {
    const context = canvas.getContext('2d')

    if (line.erase) {
        context.globalCompositeOperation = 'destination-out'
    } else {
        context.globalCompositeOperation = 'source-over'
    }

    const x0 = $(canvas).width() / line.width * line.x0
    const x1 = $(canvas).width() / line.width * line.x1
    const y0 = $(canvas).height() / line.height * line.y0
    const y1 = $(canvas).height() / line.height * line.y1

    context.beginPath()
    context.moveTo(x0, y0)
    context.lineTo(x1, y1)
    context.strokeStyle = line.color
    context.lineWidth = line.weight
    context.lineCap = 'round'
    context.stroke()
    context.closePath()
}

window.onload = function() {
    init()
}