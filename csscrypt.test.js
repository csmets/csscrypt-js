const { encrypt, decrypt } = require("./csscrypt");

const o = {
    key: '3924834902384'
}

test("should encrypt and decrypt ascii string", () => {
    const message = "Hello!! I'm a robot. Yahoo! wee poop.s";
    const e = encrypt(message, o)
    const d = decrypt(e, o)
    expect(d).toBe(message);
});

test("should encrypt and decrypt utf8 string", () => {
    const message = "Hello!! I'm a robot. Yahoo! wee poop.s こにちわ";
    const e = encrypt(message, o)
    const d = decrypt(e, o)
    expect(d).toBe(message);
});