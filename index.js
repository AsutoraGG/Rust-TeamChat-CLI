/* Made by @AsutoraGG */
/* Using Libary - rustplus.js */
const RustPlus = require('@liamcottle/rustplus.js');
const readLine = require('readline');
const { existsSync } = require('fs');

const language = require('./src/language/language.json');

function getTime() {
    var date = new Date();

    var hours = date.getHours();
    var minutes = date.getMinutes();

    var dateTime = hours + ":" + minutes;
    return dateTime;
}

function Print(a, b, c, d, e) {
    if (c === true) {
        if (!d) return console.log(language.print_error);
        console.log("\x1b[32m" + getTime() + "][TeamChat] : " + "(" + e + ") : " + d)
    } else {
        if (a === 'INFO') {
            console.log("\x1b[36m[" + getTime() + "][" + a + "] \x1b[39m : " + b);
        } else if (a === 'ERROR') {
            console.log("\x1b[31m[" + getTime() + "][" + a + "] \x1b[39m: " + b);
        } else {
            console.log('ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR');
        }
    }
}

if (existsSync('./config.json')) {
    const config = require('./config.json');

    console.clear();
    if(!config) {
        Print('ERROR', language.config_error, false);
        process.exit(0);
    }
    Print('INFO', language.found_config, false);

    const rustplus = new RustPlus(config.IP, config.PORT, config.ID, config.TOKEN);

    rustplus.on('connected', () => { /* サーバーに接続されたら */
        Print('INFO', language.connected_rustplus, false);
        setTimeout(() => console.clear(), 3000)
    });

    rustplus.on('disconnect', (d) => {
        console.log(d);
    });

    rustplus.on('error', (e) => { /* RustPlus.jsでエラーが起こったら */
        Print('ERROR', e, false);
    });

    rustplus.on('message', msg => { /* メッセージを受信したら　*/
        if (msg.broadcast && msg.broadcast.teamMessage) {
            let message = msg.broadcast.teamMessage.message.message;
            let name = msg.broadcast.teamMessage.message.name;

            console.log("[" + getTime() + "][CHAT] : " + message);
        }
    })

    const input = readLine.createInterface({ input: process.stdin });
    input.on('line', (msg) => {
        readLine.moveCursor(process.stdout, 0, -1);
        rustplus.sendTeamMessage(msg);
    });

    rustplus.connect();
} 
else {
    console.clear();
    Print('INFO', language.notfound_config, false);
    console.log("\x1b[36m[" + getTime() + "][INFO]  \x1b[39m: \x1b[32mnpx @liamcottle/rustplus.js fcm-register\x1b[39m" + language.run_register);
    console.log("\x1b[36m[" + getTime() + "][INFO] \x1b[39m : " + language.run_fcmprogram);
    process.exit(0);
}
