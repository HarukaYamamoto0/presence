export function encode(opcode, payload) {
    const json = Buffer.from(JSON.stringify(payload));
    const header = Buffer.alloc(8);
    header.writeInt32LE(opcode, 0);
    header.writeInt32LE(json.length, 4);
    return Buffer.concat([header, json]);
}
