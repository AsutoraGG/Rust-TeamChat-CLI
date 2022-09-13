const RustPlus = require('@liamcottle/rustplus.js');
const readLine = require('readline');
const { existsSync, readFileSync, writeFileSync } = require('fs');

const language = require('./src/language/language.json');

/**
 * @param {boolean} q
 * @returns falseは分まで trueは秒まで
 */
function getTime(q) {
    var date = new Date();

    var hours = date.getHours();
    var minutes = date.getMinutes();
    var sc = date.getSeconds();

    var dateTime = hours + ":" + minutes + ":" + sc; // ConsoleLog用
    var dateTimeMin = hours + ":" + minutes + language.time_min; //ゲーム内用

    if(q === true) {
        return dateTime;
    } else {
        return dateTimeMin;
    }
}

function Print(a, b, c, d, e) {
    if (c === true) {
        if (!d) return console.log(language.print_error);
        console.log("\x1b[1m\x1b[32m" + getTime(true) + "][TeamChat] : " + "(" + e + ") : " + d)
    } else {
        if (a === 'INFO') {
            console.log("\x1b[1m\x1b[36m[" + getTime(true) + "][" + a + "] \x1b[39m : " + b);
        } else if (a === 'ERROR') {
            console.log("\x1b[1m\x1b[31m[" + getTime(true) + "][" + a + "] \x1b[39m: " + b);
        } else if(a === 'HELP') {
            console.log("\x1b[1m\x1b[35m[" + getTime(true) + "][" + a + "] \x1b[39m: " + b);
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
    const auth = require('./auth.json');

    if(!auth.Owner) {
        Print('ERROR', language.no_Owner, false);
        Print('ERROR', language.process_exit, false);
        process.exit(0);
    }

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

        rustplus.getTeamInfo(team => { //チーム人数が1の場合ここを無効にしてください(囲めば無効にできます)
            let member = team.response.teamInfo.members;
            if(member.length === 1) {
                Print('ERROR', language.no_teampop, false);
                rustplus.disconnect();
                process.exit(0);
            }
        })

        setTimeout(() => console.clear(), 3000)
        if(config.Ingame.command === true) {
            setTitle('Rust-TeamChat-CLI | Made by @AsutoraGG | In Game Command = true')
        } else {
            setTitle('Rust-TeamChat-CLI | Made by @AsutoraGG | In Game Command = false')
        }
    });

    rustplus.on('error', (e) => { /* RustPlus.jsでエラーが起こったら */
        if(e === 'Error: Parse Error: Expected HTTP/') {
            Print('ERROR', language.error_parse, false);
            process.exit(0);
        } else if(e === `Error: connect ETIMEDOUT ${config.ID}:${config.PORT}`) {
            Print('ERROR', language.error_ETIMEDOUT, false);
            process.exit(0);
        }
        else{
            Print('ERROR', language.error, false);
            console.log(e);
            process.exit(0);
        }
    });

    rustplus.on('message', msg => { /* チームチャットでメッセージを受信したときの処理(msg = チームチャットの詳細) */
        const command = require('./src/command.json')
        const device = require('./device.json');

        if (msg.broadcast && msg.broadcast.teamMessage) {
            let message = msg.broadcast.teamMessage.message.message.toString(); // メッセージの内容
            let name = msg.broadcast.teamMessage.message.name; //　メッセージを送信した人の名前
            let steamID = msg.broadcast.teamMessage.message.steamId.toString(); //　スチームID
            let bot = '[BOT] : ';

            console.log("[" + getTime(true) + "][CHAT] : " + "[" + name + "] : " + message); // This is team Chat log

            if (config.Ingame.command === true) { // InGame Commandが有効になっていたら
                const prefix = config.Ingame.prefix;

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
                    rustplus.sendTeamMessage(bot + language.current_time + getTime(false));
                }

                if(message === prefix + command.rusttime) { // get Rust World Time
                    function ConveterTime(decimalTimeString) {
                        var decimalTime = parseFloat(decimalTimeString);
                        decimalTime = decimalTime * 60 * 60;
                        var hours = Math.floor((decimalTime / (60 * 60)));
                        decimalTime = decimalTime - (hours * 60 * 60);
                        var minutes = Math.floor((decimalTime / 60));
                        decimalTime = decimalTime - (minutes * 60);

                        return hours + ":" + minutes + language.time_min;
                    }
                    rustplus.getTime((Time) => {
                        let time = Time.response.time.time.toString();
                        rustplus.sendTeamMessage(bot + ConveterTime(time));
                    })
                }

                if(message === prefix + command.teampop) {// get Team Pop command
                    rustplus.getTeamInfo(team => {
                        let member = team.response.teamInfo.members;
                        rustplus.sendTeamMessage(bot + language.current_pop + member.length + language.pop);
                    })
                }

                if(message.includes(prefix + command.addmemo)) { //メモに文字列を登録
                    //たとえばだけどパスワードとか、拠点の座標とか、レイドターゲットとかメモしたいことを
                    if(name === auth.Owner) {
                        const memo = message.slice(prefix + command.addmemo).trim().split(/ +/);

                        if(memo[1] === 'help') {
                            rustplus.sendTeamMessage(bot + command.addmemo + ' [SaveName] ' + '[detail]')
                        } else if (!memo[1]){
                            rustplus.sendTeamMessage(bot + language.error);
                        } else if(!memo[2]) {
                            rustplus.sendTeamMessage(bot + language.error);
                        }
                        else {
                            write('./memo.json', memo[1], memo[2]);
                            rustplus.sendTeamMessage(bot + language.saved);
                        }
                    } else {
                        rustplus.sendTeamMessage(bot + language.not_auth);
                    }
                }

                if(message.includes(prefix + command.openmemo)) { //メモの内容を
                    if(!existsSync('./memo.json')) {
                        rustplus.sendTeamMessage(language.error);
                    }
                    const memo = message.slice(prefix + command.openmemo).trim().split(/ +/);
                    const memoJson = require('./memo.json')

                    if(memo[1]) {
                        if(memo[1] === 'help') {
                            rustplus.sendTeamMessage(bot + command.openmemo + ' [SaveName]');
                        } else {
                            if(memoJson[memo[1]]) {
                                rustplus.sendTeamMessage(bot + memo[1] + " : " + memoJson[memo[1]]);
                            } else {
                                rustplus.sendTeamMessage(bot + memo[1] + language.not_saved);
                            }
                        }
                    } else {
                        rustplus.sendTeamMessage(language.no_name);
                    }
                }

                if(message.includes(prefix + command.add)) { // adddevice command

                    if(name === auth.Owner) {
                        let entityID = message.slice(prefix + command.add).trim().split(/ +/);

                        if(!entityID[1]) { //エンティティIDが入力されていなかったら
                          rustplus.sendTeamMessage(bot + command.add + ' entityID ' + 'saveName');
                        }
                        if (!entityID[2]) { //登録名が入力されていなかったら
                          rustplus.sendTeamMessage(bot + command.add + ' entityID ' + 'saveName');
                        }

                        rustplus.getEntityInfo(entityID[1], (info) => {
                            let i = info.response;

                            if(i.error) { //responseにエラーがあったら
                                rustplus.sendTeamMessage(bot + language.invalid_entityid) //エンティティIDを正しく入力してください
                            }

                            else if(i.entityInfo) { //entityInfoが出てきたら
                                write('./device.json', entityID[2], entityID[1])
                                rustplus.sendTeamMessage(bot + language.saved)
                            } else { //その他はエラー
                                rustplus.sendTeamMessage(bot + language.error)
                            }
                        })
                    } else {
                        rustplus.sendTeamMessage(language.not_auth);
                    }
                }

                if(message.includes(prefix + command.on)) { // deviceをonにする
                    let devicename = message.slice(prefix + command.add).trim().split(/ +/);

                    if(!devicename[1]) {
                      rustplus.sendTeamMessage(bot + language.no_name);
                      return false;
                    }

                    if(device[devicename[1]]) {
                        rustplus.getEntityInfo(device[devicename[1]], OnDevice => {
                            let response = OnDevice.response.entityInfo;

                            if(!response) {
                                rustplus.sendTeamMessage(devicename[1] + language.not_saved);
                            } else {
                                if(response.type === 1) {
                                    if(response.payload.value === false) {
                                        rustplus.turnSmartSwitchOn(device[devicename[1]], () => {
                                            rustplus.sendTeamMessage(bot + devicename[1] + language.turn_on)
                                        })
                                    } else {
                                        rustplus.sendTeamMessage(bot + devicename[1] + language.on_now);
                                    }
                                } else {
                                    console.log(language.error);
                                }
                            }
                        })
                    } else {
                        rustplus.sendTeamMessage(bot + devicename[1] + language.not_device);
                    }
                }

                if(message.includes(prefix + command.off)) { //デバイスをOffにする
                    let devicename = message.slice(prefix + command.add).trim().split(/ +/);

                    if(!devicename[1]) {
                      rustplus.sendTeamMessage(language.no_name);
                      return false;
                    }

                    if(device[devicename[1]]) {
                        rustplus.getEntityInfo(device[devicename[1]], OnDevice => {
                            let response = OnDevice.response.entityInfo;

                            if(!response) {
                                rustplus.sendTeamMessage(devicename[1] + language.not_saved);
                            } else {
                                if(response.type === 1) {
                                    if(response.payload.value === true) {
                                        rustplus.turnSmartSwitchOff(device[devicename[1]], () => {
                                            rustplus.sendTeamMessage(bot + devicename[1] + language.turn_off)
                                        })
                                    } else {
                                        rustplus.sendTeamMessage(bot + devicename[1] + language.off_now);
                                    }
                                } else {
                                    console.log(language.error);
                                }
                            }
                        })
                    } else {
                        rustplus.sendTeamMessage(bot + devicename[1] + language.not_device);
                    }
                }

                if(message.includes(prefix + command.changeLeader)) { //　リーダーを変更
                    const args = message.slice(prefix + command.changeLeader).trim().split(/ +/);

                    if(args[1]) {
                        if(args[1] === 'help') {
                            rustplus.sendTeamMessage(bot + command.changeLeader + 'new LeaderSteamID')
                        }
                        if(args[1].includes('1234567890')) {
                            rustplus.getTeamInfo((info) => {
                                let leaderID = info.response.teaminfo.leaderSteamId.toString();
                                if(leaderID === steamID) {
                                    rustplus.sendRequestAsync({
                                        promoteToLeader: {
                                          steamId: args[1],
                                        },
                                    })
                                    rustplus.sendTeamMessage(bot + language.changed_leader)
                                } else {
                                    rustplus.sendTeamMessage(bot + language.not_auth + '(You are Not Leader)');
                                }                             
                            })
                        } else {
                            rustplus.sendTeamMessage(bot + language.no_steam);
                        }
                    } else {
                        rustplus.sendTeamMessage(bot + language.no_steam);
                    }
                }
            }
        }
    });

    const input = readLine.createInterface({ input: process.stdin }); //　入力を受け取る↓
    input.on('line', (msg) => {
        if(msg === 'getToken') {
            readLine.moveCursor(process.stdout, 0, -1);
            Print('HELP', language.get_token)
        } else if (msg === 'clear') {
            readLine.moveCursor(process.stdout, 0, -1);
            console.clear();
        } else if(msg === 'exit') {
            readLine.moveCursor(process.stdout, 0, 1);
            Print('INFO', language.process_exit, false);
            rustplus.disconnect();
            setTimeout(() => process.exit(), 2000);
        } else {
            readLine.moveCursor(process.stdout, 0, -1); //入力を受け取った後上の一行を削除する
            rustplus.sendTeamMessage(msg); //　チームチャットにメッセージを送信
        }
    });

    rustplus.connect(); // サーバーに接続
}
else { // config.jsonがないとrustplusに接続させないようにさせプログラムを終了する
    console.clear();
    Print('INFO', language.notfound_config, false);
    console.log("\x1b[36m[" + getTime(true) + "][INFO]  \x1b[39m: \x1b[32mnpx @liamcottle/rustplus.js fcm-register\x1b[39m" + language.run_register);
    console.log("\x1b[36m[" + getTime(true) + "][INFO] \x1b[39m : " + language.run_fcmprogram);
    process.exit(0);
}
