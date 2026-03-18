export var OPCODE;
(function (OPCODE) {
    OPCODE[OPCODE["HANDSHAKE"] = 0] = "HANDSHAKE";
    OPCODE[OPCODE["FRAME"] = 1] = "FRAME";
    OPCODE[OPCODE["CLOSE"] = 2] = "CLOSE";
    OPCODE[OPCODE["PING"] = 3] = "PING";
    OPCODE[OPCODE["PONG"] = 4] = "PONG";
})(OPCODE || (OPCODE = {}));
