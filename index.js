const RustPlus = require('@liamcottle/rustplus.js');
const readLine = require('readline');
const { existsSync, readFileSync, writeFileSync } = require('fs');

const language = require('./src/language/language.json');

function getTime() {
    var date = new Date();

    var hours = date.getHours();
    var minutes = date.getMinutes();
    var sc = date.getSeconds();

    var dateTime = hours + ":" + minutes + ":" + sc;
    return dateTime;
}

function Print(a, b, c, d, e) {
    if (c === true) {
        if (!d) return console.log(language.print_error);
        console.log("\x1b[1m\x1b[32m" + getTime() + "][TeamChat] : " + "(" + e + ") : " + d)
    } else {
        if (a === 'INFO') {
            console.log("\x1b[1m\x1b[36m[" + getTime() + "][" + a + "] \x1b[39m : " + b);
        } else if (a === 'ERROR') {
            console.log("\x1b[1m\x1b[31m[" + getTime() + "][" + a + "] \x1b[39m: " + b);
        } else if(a === 'HELP') {
            console.log("\x1b[1m\x1b[35m[" + getTime() + "][" + a + "] \x1b[39m: " + b);
        } else {
            console.log('ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR');
        }
    }
}

function setTitle(title) {
	process.stdout.write('\x1b]2;' + title + '\x1b\x5c');
}

function read(path) {
    let data = readFileSync(path, "utf8");
    return JSON.parse(data);
};

function write(path, property, value) {
    let jsonObj = read(path)
    jsonObj[property] = value;
    writeFileSync(path, JSON.stringify(jsonObj, null, 2));
};

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
        rustplus.sendTeamMessage('[BOT] : Connected');
        /* 
        rustplus.getTeamInfo(team => { //チームが作成されていないとバグるのでチームが
            let member = team.response.teamInfo.members;
            if(member.length === 1) {
                Print('INFO', language.no_teampop, false);
                process.exit();
            }
        }) */
        setTimeout(() => console.clear(), 3000)
        if(config.Ingame.command === true) {
            setTitle('Rust-TeamChat-CLI | Made by @AsutoraGG | In Game Command = true')
        } else {
            setTitle('Rust-TeamChat-CLI | Made by @AsutoraGG | In Game Command = false')
        }
    });

    rustplus.on('error', (e) => { /* RustPlus.jsでエラーが起こったら */
        Print('ERROR', e, false);
    });

    rustplus.on('message', msg => {
        const command = require('./src/command.json')
        const device = require('./device.json');
        if (msg.broadcast && msg.broadcast.teamMessage) {
            let message = msg.broadcast.teamMessage.message.message.toString();
            let name = msg.broadcast.teamMessage.message.name;
            let bot = '[BOT] : '

            console.log("[" + getTime() + "][CHAT] : " + "[" + name + "] : " + message); // This is team Chat log

            if (config.Ingame.command === true) { /* InGame Commandが有効になっていたら */
                const prefix = config.Ingame.prefix;

                //let t = command.slice(prefix + 'add').trim().split(/ +/); command is ${prefix}pop only
                //console.log(t[1])

                if(message === prefix + command.pop) { //Pop Command
                    rustplus.getInfo(info => {
                        let teaminfo = info.response.info;
                        if(teaminfo.queuedPlayers > 0) {
                            rustplus.sendTeamMessage(bot + `${teaminfo.players}/${teaminfo.maxPlayers} (${teaminfo.queuedPlayers})`)
                        } else { // No Queue
                            rustplus.sendTeamMessage(bot + `${teaminfo.players}/${teaminfo.maxPlayers}`);
                        }
                    })
                }

                if(message === prefix + command.now) { // get Current Time(Real World) command
                    rustplus.sendTeamMessage(bot + language.current_time + getTime() + language.time);
                }

                if(message === prefix + command.teampop) {// get Team Pop command
                    rustplus.getTeamInfo(team => {
                        let member = team.response.teamInfo.members;
                        rustplus.sendTeamMessage(bot + language.current_pop + member.length + language.pop);
                    })
                }

                if(message.includes(prefix + command.add)) { // adddevice command
                    let entityID = message.slice(prefix + command.add).trim().split(/ +/);
                    // ([0] = add , [1] = entityid , [2] = saveName)

                    if(entityID[1].length <= 0 && entityID[1] === null) return rustplus.sendTeamMessage(prefix + command.add + ' id ' + 'saveName');
                    if(entityID[2].length <= 0 && entityID[2] === null) return rustplus.sendTeamMessage(prefix + command.add + ' id ' + 'saveName');
                    rustplus.getEntityInfo(entityID[1], (info) => {
                        let i = info.response;

                        if(i.error) {
                            rustplus.sendTeamMessage(language.invalid_entityid) //エンティティIDを正しく入力してください
                        }
                        else if(i.entityInfo) {
                            write('./device.json', entityID[2], entityID[1])
                            rustplus.sendTeamMessage(language.saved)
                        } else {
                            rustplus.sendTeamMessage(language.error)
                        }
                    })
                }

                if(message.includes(prefix + command.on)) {
                    let name = message.slice(prefix + command.add).trim().split(/ +/);

                    if(name[1].length <= 0 && name[1] === null) return rustplus.sendTeamMessage(language.no_name)

                    if(device[name[1]]) {
                        rustplus.getEntityInfo(device[name[1]], OnDevice => {
                            let response = OnDevice.response.entityInfo;

                            if(response.type === 1) {
                                if(response.payload.value === false) {
                                    rustplus.turnSmartSwitchOn(device[name[1]], () => {
                                        rustplus.sendTeamMessage(name[1] + language.turn_on)
                                    })
                                } else {
                                    rustplus.sendTeamMessage(language.on_now);
                                }
                            } else {
                                console.log(language.error);
                            }
                        })
                    }
                }

                if(message.includes(prefix + command.off)) {
                    let name = message.slice(prefix + command.add).trim().split(/ +/);

                    if(name[1].length <= 0 && name[1] === null) return rustplus.sendTeamMessage(language.no_name)

                    if(device[name[1]]) {
                        rustplus.getEntityInfo(device[name[1]], OnDevice => {
                            let response = OnDevice.response.entityInfo;

                            if(response.type === 1) {
                                if(response.payload.value === true) {
                                    rustplus.turnSmartSwitchOff(device[name[1]], () => {
                                        rustplus.sendTeamMessage(name[1] + language.turn_off)
                                    })
                                } else {
                                    rustplus.sendTeamMessage(language.off_now);
                                }
                            } else {
                                console.log(language.error);
                            }
                        }) 
                    } else {
                        rustplus.sendTeamMessage(language.no_name);
                    }
                }
            }
        }
    });

    const input = readLine.createInterface({ input: process.stdin });
    input.on('line', (msg) => {
        if(msg === 'getToken') {
            readLine.moveCursor(process.stdout, 0, -1);
            Print('HELP', language.help_token)
        } else if (msg === 'clear') {
            readLine.moveCursor(process.stdout, 0, -1);
            console.clear();
        }
        else {
            readLine.moveCursor(process.stdout, 0, -1);
            rustplus.sendTeamMessage(msg);
        }
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
