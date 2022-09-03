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

function setTitle(title) {
	process.stdout.write('\x1b]2;' + title + '\x1b\x5c');
}

if (existsSync('./config.json')) { /* ファイルがあるか */
    const config = require('./config.json');

    console.clear();
    if(!config) { /* もしファイルがあっても内容が書かれてなかったら */
        Print('ERROR', language.config_error, false);
        process.exit(0);
    }
    Print('INFO', language.found_config, false); // ファイルが見つかりましたのお知らせ

    const rustplus = new RustPlus(config.IP, config.PORT, config.ID, config.TOKEN); // RustPlusに登録する情報

    rustplus.on('connected', () => { /* サーバーに接続されたら */
        Print('INFO', language.connected_rustplus, false);
        Print('INFO', language.default_prefix, false);
        setTimeout(() => console.clear(), 3000)
        if(config.Ingame.command === true) {
            setTitle('Rust-TeamChat-CLI | Made by @AsutoraGG | Command = true')
        } else {
            setTitle('Rust-TeamChat-CLI | Made by @AsutoraGG | Command = false')
        }
    });

    rustplus.on('error', (e) => { /* RustPlus.jsでエラーが起こったら */
        Print('ERROR', e, false);
    });

    rustplus.on('message', msg => {
        if (msg.broadcast && msg.broadcast.teamMessage) {
            let message = msg.broadcast.teamMessage.message.message;
            let name = msg.broadcast.teamMessage.message.name;
            let bot = '[BOT] : '

            console.log("[" + getTime() + "][CHAT] : " + "[" + name + "] : " + message); // This is team Chat log

            if (config.Ingame.command === true) { /* InGame Commandが有効になっていたら */
                let prefix = config.Ingame.prefix;

                if(message === `${prefix}pop`) { //Pop Command
                    rustplus.getInfo(info => {
                        let teaminfo = info.response.info;
                        if(teaminfo.queuedPlayers > 0) {
                            rustplus.sendTeamMessage(bot + `${teaminfo.players}/${teaminfo.maxPlayers} (${teaminfo.queuedPlayers})`)
                        } else { // No Queue
                            rustplus.sendTeamMessage(bot + `${teaminfo.players}/${teaminfo.maxPlayers}`);
                        }
                    })
                }

                if(message === `${prefix}now`) { // get Current Time(Real World) command
                    rustplus.sendTeamMessage(bot + language.current_time + getTime() + language.time);
                }

                if(message === `${prefix}teampop`) {// get Team Pop command
                    rustplus.getTeamInfo(team => {
                        let member = team.response.teamInfo.members;
                        rustplus.sendTeamMessage(bot + language.current_pop + member.length + language.pop);
                    })
                }
            }
        }
    });

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
