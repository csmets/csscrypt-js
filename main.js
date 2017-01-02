
const fs = require('fs')

const encrypt = (options) => {
    
    // Encode the message first
    const encoded = encode(message, options)
}

const getKey = () => {
    const enc = fs.readSync('key/encoding.txt', 'utf8') 
    return enc
}

const encode = (message, options) => {
    const charList = message.split("")
    const binary = charList.map((char) => {
        const bin = char.charCodeAt(0).toString(2)
        return bin
    })

    const longBin = binary.join('')
    const blocks = longBin.match(/.{1,24}/g)
    const fillBlock = fill(blocks[blocks.length - 1], 24)
    blocks[blocks.length - 1] = fillBlock
    const longPaddedBin = blocks.join('')
    const createGroups = ".{1," + options.size + "}"
    const re = new RegExp(createGroups, "g")
    const grouped = longPaddedBin.match(re)
    const fillGrp = fill(grouped[grouped.length - 1], options.size)
    grouped[grouped.length - 1] = fillGrp
    
    const numInGroup = (24 / options.size) >> 0

    const encWoPad = recEncodeGrp(
        grouped,
        numInGroup - 1,
        0,
        options
    )

    console.log(encWoPad)
}

const recEncodeGrp = (grp, padGrp, index, opts) => {
    const padCutOff = grp.length - padGrp
    if (index < padCutOff) {
        grp[index] = encodeBits(grp[index], opts.encoding)
        return recEncodeGrp(grp, padGrp, index + 1, opts)
    } else if (index < grp.length){
        const padBits = recAppend(opts.size, '', '0')
        if (padBits === grp[index]) {
            grp[index] = opts.pad
        } else {
            grp[index] = encodeBits(grp[index], opts.encoding)
        }
        return recEncodeGrp(grp, padGrp, index + 1, opts)
    } else {
        return grp.join('')
    }
}

const encodeBits = (bits, encoding) => {
    const index = parseInt(bits, 2)
    return encoding[index]
}

const fill = (bits, size) => {
    const filled = recAppend(size, bits, '0')
    return filled
}

const recAppend = (num, str, char) => {
    if (str.length < num) {
        const append = str + char
        return recAppend(num, append, char)
    } else {
        return str
    }
}

encode("Hello!! I'm a robot", {
    pad: "=",
    encoding: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    size: 6
})
