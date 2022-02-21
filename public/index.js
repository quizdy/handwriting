var line = {}

line.color = '#000'
line.weight = 2
line.fill = false
line.erase = false
line.enabled = false

const canvas = $('.whiteboard canvas.draw').get(0)

canvas.height = $('.whiteboard').height()
canvas.width = $('.whiteboard').width()

$(document).on('click', '.whiteboard>.clear', (_e) => {
    const context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height)
    line.weight = 2
    line.erase = false
    $('.whiteboard>.eraser').removeClass('active')
})

$(document).on('click', '.whiteboard>.eraser', (e) => {
    if (line.erase) {
        line.weight = 2
        line.erase = false
        $(e.currentTarget).removeClass('active')
    } else {
        line.weight = 20
        line.erase = true
        $(e.currentTarget).addClass('active')
    }
})

$(document).on('touchstart mousedown', '.whiteboard>canvas.draw', (e) => {

    line.enabled = true

    const pos = getPos(e)

    line.x0 = pos.x
    line.y0 = pos.y
    line.width = canvas.width
    line.height = canvas.height
})

$(document).on('touchmove mousemove', '.whiteboard>canvas.draw', (e) => {
    e.stopPropagation()

    if (!line.enabled) return

    const pos = getPos(e)

    line.x1 = pos.x
    line.y1 = pos.y

    throttle(drawing(), 100)

    line.x0 = pos.x
    line.y0 = pos.y
})

$(document).on('touchend mouseup', '.whiteboard>canvas.draw', (e) => {
    if (!line.enabled) return

    line.enabled = false

    const pos = getPos(e)

    line.x1 = pos.x
    line.y1 = pos.y

    drawing()
})

function getPos(e) {
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

function drawing() {
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