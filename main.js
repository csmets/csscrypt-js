
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
    const eightBitBin = binary.map((bits) => {
        const eightBit = recPrepend(8, bits, '0')
        return eightBit
    })
    const longBin = eightBitBin.join('')
    const blocks = longBin.match(/.{1,24}/g)
    const padNum = padCount(blocks[blocks.length - 1], 24)
    const fillBlock = fill(blocks[blocks.length - 1], 24)
    blocks[blocks.length - 1] = fillBlock
    const longPaddedBin = blocks.join('')
    const createGroups = ".{1," + options.size + "}"
    const re = new RegExp(createGroups, "g")
    const grouped = longPaddedBin.match(re)
    const fillGrp = fill(grouped[grouped.length - 1], options.size)
    grouped[grouped.length - 1] = fillGrp
    
    const numInGroup = (24 / options.size) >> 0

    const encoded = recEncodeGrp(
        grouped,
        numInGroup - 1,
        padNum,
        0,
        options
    )

    return encoded
}

const recEncodeGrp = (grp, padGrp, padNum, index, opts) => {
    const padCutOff = grp.length - padGrp
    if (index < padCutOff) {
        grp[index] = encodeBits(grp[index], opts.encoding)
        return recEncodeGrp(grp, padGrp, padNum, index + 1, opts)
    } else if (index < grp.length){
        if (index >= (grp.length - padNum) && index < grp.length) {
            grp[index] = opts.pad
        } else {
            grp[index] = encodeBits(grp[index], opts.encoding)
        }
        return recEncodeGrp(grp, padGrp, padNum, index + 1, opts)
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

const recPrepend = (num, str, char) => {
    if (str.length < num) {
        const prepend = char + str
        return recPrepend(num, prepend, char)
    } else {
        return str
    }
}

const padCount = (bits, blockSize) => {
    if (bits.length < blockSize) {
        const count = blockSize / bits.length
        const blockBitSize = blockSize / 8
        const numOfPads = blockBitSize - Math.ceil(count)
        return numOfPads
    } else {
        return 0
    }
}

console.log(encode("Hello!! I'm a robot. Yahoo! wee poop.s", {
    pad: "=",
    encoding: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    size: 6
}))
