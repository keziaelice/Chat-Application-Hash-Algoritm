const http = require("http"); // untuk membuat http server menggunakan library bawaan node.js (http)
const socketIo = require("socket.io"); // untuk membuat web socket

const server = http.createServer(); // mengkoneksikan atau membuat http server
const io = socketIo(server); // io adalah web server yang sudah terkoneksi dengan socket.io

io.on("connection", (socket) => { // dijalankan ketika ada client yang terkoneksi dengan server (1 client punya 1 socket)
    console.log(`Client ${socket.id} connected`); // socket.id adalah id untuk membedakan socket client 1 dengan client lain

    socket.on("disconnect", () => { // dijalankan ketika ada client yang disconnect
        console.log(`Client ${socket.id} disconnected`);
    });

    socket.on("message", (data) => { // membuat channel message untuk menerima data dari channel/socket message
        let { username, message, sha256Hash } = data;
        console.log(`Receiving message from ${username}: ${message}`); // memeriksa apakah data sudah masuk
        io.emit("message", data); // mengirim ulang data ke client dengan masuk ke channel message 
        // (semua socket id yang sudah terkoneksi dengan io akan menerima pesan)
    });
});

const port = 3000; // port dimana server bekerja
server.listen(port, () => { // untuk membuka koneksi port (server akan mendengarkan semua request dengan port 3000)
    console.log(`Server running on port ${port}`)
});