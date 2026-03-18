import net from 'net';
export class NodeIPCTransport {
    path;
    socket;
    constructor(path) {
        this.path = path;
    }
    connect() {
        return new Promise((resolve, reject) => {
            this.socket = net.createConnection(this.path, resolve);
            this.socket.once('error', reject);
        });
    }
    write(data) {
        this.socket.write(data);
    }
    onData(cb) {
        this.socket.on('data', cb);
    }
    onClose(cb) {
        this.socket.once('close', cb);
    }
    close() {
        this.socket.end();
        this.socket.unref();
        this.socket.destroy();
    }
}
