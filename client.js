const io = require("socket.io-client"); // untuk membuat web socket (versi client)
const readline = require("readline"); // untuk mengambil inputan user
const crypto = require("crypto"); // untuk membuat hash

const socket = io("http://localhost:3000"); // url dimana server running

function generateHash(message) { // function untuk membuat hash menggunakan SHA256
    return crypto.createHash("sha256").update(message).digest("hex");
}

const rl = readline.createInterface({ // setup readline, membuat object dengan parameter input, output, dan prompt
    input: process.stdin, // mengarahkan input dari terminal
    output: process.stdout, // mengarahkan output dari terminal
    prompt: "> " // tampilan prompt di terminal
});

let username = "";

socket.on("connect", () => { // dijalankan ketika socket terkoneksi dengan server
    console.log("Connected to the server");

    rl.question("Enter your username: ", (input) => { // untuk menanyakan username client menggunakan library rl dan fungsi question
        username = input; // menyimpan input user dalam variabel username
        console.log(`Welcome, ${username} to the chat`);
        rl.prompt(); // untuk memunculkan prompt

        rl.on("line", (message) => { // dijalankan ketika user menekan enter, message adalah inputan sebelum user menekan enter
            if (message.trim()) { // untuk menghapus spasi di sesudah dan sebelum message
                const sha256Hash = generateHash(message); // membuat hash dari message yang akan dikirim
                socket.emit("message", { username, message, sha256Hash }); // mengirim username, message, dan hash ke server
                // message adalah channelnya - username, message, dan sha256Hash adalah object dari inputan user
            }
            rl.prompt(); // menampilkan kembali prompt
        });
    });
});

socket.on("message", (data) => {
    const { username: senderUsername, message: senderMessage, sha256Hash } = data; // menerima data dari server

    if(senderUsername != username) { // memfilter agar client tidak menerima pesan yang dikirimkan oleh dirinya sendiri
        const newSha256Hash = generateHash(senderMessage); // membuat hash dari message yang diterima
        
        if(newSha256Hash == sha256Hash) { // memeriksa apakah hash message yang diterima sama dengan hash yang asli
            console.log(`${senderUsername}: ${senderMessage}`);
        }
        else{
            console.log(`${senderUsername}: ${senderMessage}\nWARNING: This message has been modified by the server.`);
        }
        rl.prompt();
    }
});

socket.on("disconnect", () => { // dijalankan ketika socket disconnect (server disconnect atau server menekan Ctrl + C)
    console.log("Server disconnected, Exiting...");
    rl.close();
    process.exit(0);
});

rl.on("SIGINT", () => { // command signal interrupt (SIGINT), dijalankan ketika client menekan Ctrl + C
    console.log("\nExiting...");
    socket.disconnect(); // menutup socket yang terbuka
    rl.close(); // menutup rl yang terbuka
    process.exit(0); // menutup proses node.js, 0 adalah kode error
});