const RustPlus = require('@liamcottle/rustplus.js');
const SteamID = require('steamid');
const Translate = require('translate-google');
const readLine = require('readline');
const { existsSync, readFileSync, writeFileSync } = require('fs');
const { writeFile } = require('fs/promises');

const input = readLine.createInterface({ input: process.stdin }); //　入力を受け取る

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

console.clear();
input.pause();


if (existsSync('./config.json')) { // config.jsonはこのプログラムでは生成しても意味がないので
    if(!existsSync('./auth.json')) { //これらはこのプログラムで生成しても問題がないため
        writeFile('./auth.json', "{\n\n}", 'utf-8');
        Print('INFO', 'Saved auth.json', false);
    } else if(!existsSync('./device.json')) {
        writeFile('./device.json', "{\n\n}", 'utf-8');
        Print('INFO', 'Saved device.json', false);
    } else if(!existsSync('./memo.json')) {
        writeFile('./memo.json', "{\n\n}", 'utf-8');
        Print('INFO', 'Saved memo.json', false);
    }
    
    const config = require('./config.json');
    const auth = require('./auth.json');
    const auth_path = './auth.json';

    if(!auth.Owner) {
        Print('ERROR', language.no_Owner, false);
        Print('ERROR', language.process_exit, false);
        process.exit(0);
    }

    if(!config.IP || !config.Ingame) { /* もしファイルがあっても内容が書かれてなかったら */
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
        });

        setTimeout(() => {
            console.clear();
            input.resume();
        }, 3000);

        if(config.Ingame.command === true) {
            setTitle('Rust-TeamChat-CLI | Made by @AsutoraGG | In Game Command = true')
        } else {
            setTitle('Rust-TeamChat-CLI | Made by @AsutoraGG | In Game Command = false')
        }
    });

    rustplus.on('error', (e) => { /* RustPlus.jsでエラーが起こったら */
        if(e.toString().includes('Parse Error: Expected HTTP')) { //たまに出る謎のエラー
            Print('ERROR', language.error_parse, false);
            process.exit(0);
        } else if(e.toString().includes('ECONNREFUSED')) {
            Print('ERROR', language.error_ETIMEDOUT, false);
            process.exit(0);
        } else if(e.toString().includes('ETIMEDOUT')) {
            Print('ERROR', language.error_ETIMEDOUT, false);
            process.exit(0);
        } else{
            Print('ERROR', language.error, false);
            console.log(e);
            process.exit(0);
        }
    });

    rustplus.on('disconnected', () => {
        Print('INFO', 'Disconnected from Server', false);
    })

    rustplus.on('message', msg => { /* チームチャットでメッセージを受信したときの処理(msg = チームチャットの詳細) */
        const command = require('./src/command.json')
        const device = require('./device.json');
        const device_path = './device.json';

        if (msg.broadcast && msg.broadcast.teamMessage) {
            let message = msg.broadcast.teamMessage.message.message.toString(); // メッセージの内容
            let name = msg.broadcast.teamMessage.message.name; //　メッセージを送信した人の名前
            let steamID = msg.broadcast.teamMessage.message.steamId.toString(); //　スチームID
            let bot = '[BOT] : ';

            console.log("[" + getTime(true) + "][CHAT] : " + "[" + name + "] : " + message); // This is team Chat log

            if (config.Ingame.command === true) { // InGame Commandが有効になっていたら
                const prefix = config.Ingame.prefix;

                if(message === prefix + command.pop) { //Pop Command
                    if(read(auth_path)[name] || name === read(auth_path).Owner) {
                        rustplus.getInfo(info => {
                            let teaminfo = info.response.info;
                            if(teaminfo.queuedPlayers > 0) {
                                rustplus.sendTeamMessage(bot + `${teaminfo.players}/${teaminfo.maxPlayers} (${teaminfo.queuedPlayers})`)
                            } else { // No Queue
                                rustplus.sendTeamMessage(bot + `${teaminfo.players}/${teaminfo.maxPlayers}`);
                            }
                        })
                    } else {
                        rustplus.sendTeamMessage(language.not_auth);
                    }
                }

                if(message === prefix + command.now) { // get Current Time(Real World) command
                    if(read(auth_path)[name] || name === read(auth_path).Owner) {
                        rustplus.sendTeamMessage(bot + language.current_time + getTime(false));
                    } else {
                        rustplus.sendTeamMessage(language.not_auth);
                    }
                }

                if(message === prefix + command.rusttime) { // get Rust World Time
                    if(read(auth_path)[name] || name === read(auth_path).Owner) {
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
                    } else {
                        rustplus.sendTeamMessage(language.not_auth);
                    }
                }

                if(message === prefix + command.teampop) {// get Team Pop
                    if(read(auth_path)[name] || name === read(auth_path).Owner) {
                        rustplus.getTeamInfo(team => {
                            let member = team.response.teamInfo.members;
                            rustplus.sendTeamMessage(bot + language.current_pop + member.length + language.pop);
                        })
                    } else {
                        rustplus.sendTeamMessage(language.not_auth);
                    }
                }

                if(message === prefix + command.id) { // getSteamID
                    rustplus.sendTeamMessage(name + ' : ' + steamID);
                }

                if(message.includes(prefix + command.team)) { //getTeamInfo
                    const args = message.slice(prefix + command.team).trim().split(/ +/);

                    if(read(auth_path)[name] || name === read(auth_path).Owner) {
                        rustplus.getTeamInfo((info) => {
                            const team = info.response.teamInfo.members;
    
                            if(args[1]) {
                                if(args[1] === 'help') {
                                    rustplus.sendTeamMessage(command.team + ' [online || offline || dead || alive]')
                                } else if(args[1] === 'online') {
                                    let online = language.team_online + ' : ';
                                    for (let player of team) {
                                        if (player.isOnline) {
                                            online += `"${player.name}" `;
                                        }
                                    }

                                    if(online === language.team_online + ' : ') {
                                        rustplus.sendTeamMessage(language.no_online);
                                    } else {
                                        rustplus.sendTeamMessage(online);
                                    }
                                } else if(args[1] === 'offline') {
                                    let offline = language.team_offline + ' : ';
                                    for (let player of team) {
                                        if (!player.isOnline) {
                                            offline += `"${player.name}" `;
                                        }
                                    }

                                    if(offline === language.team_offline + ' : ') {
                                        rustplus.sendTeamMessage(language.no_offline)
                                    } else {
                                        rustplus.sendTeamMessage(offline)
                                    }
                                } else if(args[1] === 'alive') {
                                    let alive = language.team_alive + ' : ';
                                    for (let player of team) {
                                        if(player.isAlive) {
                                            alive += `"${player.name}" `;
                                        }
                                    }

                                    if(alive === language.team_alive + ' : ') {
                                        rustplus.sendTeamMessage(language.no_alive);
                                    } else {
                                        rustplus.sendTeamMessage(alive);
                                    }
                                } else if(args[1] === 'dead') {
                                    let dead = language.team_dead + ' : ';
                                    for (let player of team) {
                                        if(!player.isAlive) {
                                            dead += `"${player.name}" `;
                                        }
                                    }
                                    if(dead === language.team_dead + ' : ') {
                                        rustplus.sendTeamMessage(language.no_dead);
                                    } else {
                                        rustplus.sendTeamMessage(dead);
                                    }
                                } else {
                                    rustplus.sendTeamMessage(command.team + ' [online || offline || dead || alive]')
                                }
                            } else {
                                rustplus.sendTeamMessage(command.team + ' [online || offline || dead || alive]');
                            }
                        });
                    } else {
                        rustplus.sendTeamMessage(language.not_auth);
                    }
                }

                if(message.includes(prefix + command.addmemo)) { //メモに文字列を登録
                    //たとえばだけどパスワードとか、拠点の座標とか、レイドターゲットとかメモしたいことを
                    if(read(auth_path)[name] || name === read(auth_path).Owner) {
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

                    if(name === read(auth_path).Owner) {
                        let entityID = message.slice(prefix + command.add).trim().split(/ +/);

                        if(!entityID[1]) { //エンティティIDが入力されていなかったら
                          rustplus.sendTeamMessage(bot + command.add + ' entityID ' + 'saveName');
                        }
                        if (!entityID[2]) { //登録名が入力されていなかったら
                          rustplus.sendTeamMessage(bot + command.add + ' entityID ' + 'saveName');
                        } else {
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
                        }
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

                    if(read(device_path)[devicename[1]]) {
                        rustplus.getEntityInfo(read(device_path)[devicename[1]], OnDevice => {
                            let response = OnDevice.response.entityInfo;

                            if(!response) {
                                rustplus.sendTeamMessage(bot + devicename[1] + language.not_saved);
                            } else {
                                if(response.type === 1) {
                                    if(response.payload.value === false) {
                                        rustplus.turnSmartSwitchOn(read(device_path)[devicename[1]], () => {
                                            rustplus.sendTeamMessage(bot + devicename[1] + language.turn_on)
                                        })
                                    } else {
                                        rustplus.sendTeamMessage(bot + devicename[1] + language.on_now);
                                    }
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

                    if(read(device_path)[devicename[1]]) {
                        rustplus.getEntityInfo(read(device_path)[devicename[1]], OnDevice => {
                            let response = OnDevice.response.entityInfo;

                            if(!response) {
                                rustplus.sendTeamMessage(devicename[1] + language.not_saved);
                            } else {
                                if(response.type === 1) {
                                    if(response.payload.value === true) {
                                        rustplus.turnSmartSwitchOff(read(device_path)[devicename[1]], () => {
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
                        const sID = new SteamID(args[1]);

                        if(args[1]) {
                            if(args[1] === 'help') {
                                rustplus.sendTeamMessage(bot + command.changeLeader + ' [NewSteamID]')
                            } else {
                                rustplus.getTeamInfo((info) => {
                                    let leaderID = info.response.teamInfo.leaderSteamId.toString();
    
                                    if(steamID === leaderID) {
                                        if(args[1] === leaderID) {
                                            rustplus.sendTeamMessage(bot + language.leader_now);
                                        } else {
                                            if(sID.isValidIndividual()) { // 有効なSteamIDか確認
                                                rustplus.sendRequestAsync({
                                                    promoteToLeader: {
                                                        steamId: args[1],
                                                    }
                                                });
                                                rustplus.sendTeamMessage(bot + language.changed_leader)
                                            } else {
                                                rustplus.sendTeamMessage(bot + args[1] + language.not_steamID);
                                            }
                                        }
                                    } else {
                                        rustplus.sendTeamMessage(bot + language.not_auth + '(You are Not Leader)');
                                    }                
                                })
                            }
                        } else {
                            rustplus.sendTeamMessage(bot + language.no_steam);
                        }
                    } else {
                        rustplus.sendTeamMessage(bot + language.no_steam);
                    }
                }

                if(message.includes(prefix + command.removedevice)) { //デバイスを削除
                    if(name === read(auth_path).Owner) {
                        const args = message.slice(prefix + command.removedevice).trim().split(/ +/);

                        if(args[1] === 'help') {
                            rustplus.sendTeamMessage(bot + command.removedevice + ' [SaveName]');
                        }
                        
                        if(existsSync('device.json')) {
                            const d = readFileSync('./device.json');
                            const j = JSON.parse(d);

                            if(device[args[1]]) {
                                delete j[args[1]];
                                writeFile('./device.json', JSON.stringify(j, null, 2));
                                rustplus.sendTeamMessage(bot + language.removed);
                            } else {
                                rustplus.sendTeamMessage(bot + args[1] + language.not_found)
                            }
                        } else {
                            print('ERORR', 'device.json' + language.not_found, false);
                        }
                    } else {
                        rustplus.sendTeamMessage(language.not_auth);
                    }
                }

                if(message.includes(prefix + command.addAuth)) { //権限をついか
                    const args = message.slice(prefix + command.addAuth).trim().split("*");

                    if(name === read(auth_path).Owner)  {
                        if(!args[1]) {
                            rustplus.sendTeamMessage(bot + command.addAuth + ' *[PlayerName]' + '(*' + language.need_args + ')');
                        } else {
                            if(args[1] === 'help') {
                                rustplus.sendTeamMessage(bot + command.addAuth + ' *[PlayerName]');
                            } else {
                                write('./auth.json', args[1], 'ok');
                                rustplus.sendTeamMessage(bot + language.saved);
                            }
                        }
                    } else {
                        rustplus.sendTeamMessage(bot + language.not_auth);
                    }
                }

                if(message.includes(prefix + command.removeAuth)) { //権限を削除
                    if(name === read(auth_path).Owner) {
                        const args = message.slice(prefix + command.removeAuth).trim().split("*");

                        if(args[1]) {
                            if(args[1] === 'help') {
                                rustplus.sendTeamMessage(bot + command.removeAuth + ' [PlayerName]' + '(*' + language.need_args + ')');
                            } else {
                                if(existsSync('auth.json')) {
                                    const d = readFileSync('./auth.json');
                                    const j = JSON.parse(d);
        
                                    if(auth[args[1]]) {
                                        delete j[args[1]];
                                        writeFile('./auth.json', JSON.stringify(j, null, 2));
                                        rustplus.sendTeamMessage(bot + language.removed);
                                    } else {
                                        rustplus.sendTeamMessage(bot + args[1] + language.not_found)
                                    }
                                } else {
                                    print('ERORR', 'auth.json' + language.not_found, false);
                                }
                            }
                        } else {
                            rustplus.sendTeamMessage(bot + command.removeAuth + ' *[PlayerName]' + '(*' + language.need_args + ')');
                        }
                    } else {
                        rustplus.sendTeamMessage(bot + language.not_auth);
                    }
                }

                if(message.includes(prefix + command.translate)) { //翻訳
                    if(read(auth_path)[name] || name === read(auth_path).Owner) {
                        const args = message.slice(prefix + command.translate).trim().split("*");
                        
                        if(args[1] && args[2]) {
                            if(args[1] === 'help') {
                                rustplus.sendTeamMessage(bot + command.translate + '*[String] *[Language]');
                            }
                            if (args[2] === 'Chinese' || args[2] === 'ch' || args[2] === 'china' || args[2] === 'chinese') {
                                rustplus.sendTeamMessage(language.translate_chinese);
                                return false;
                            }
        
                            Translate(args[1], {
                                from: 'auto',
                                to: args[2]
                            }).then(res => {
                                rustplus.sendTeamMessage(bot + res);
                            }).catch(err => {
                                if (err.toString().includes('not supported')) {
                                    rustplus.sendTeamMessage(language.translate_error);
                                }
                            })
                        } else {
                            rustplus.sendTeamMessage(bot + command.translate + '*[String] *[Language]' + language.need_args);
                        }
                    } else {
                        rustplus.sendTeamMessage(bot + language.not_auth);
                    }
                }

                if(message.includes(prefix + command.DEV.strobe)) { // IDK How to stop strobe mode.....
                    const args = message.slice(prefix + command).trim().split(/ +/);

                    if(args[1]) {
                        if(args[1] === 'help') {
                            rustplus.sendTeamMessage(command.DEV.strobe + ' [SaveName]');
                        } else {
                            if(device[args[1]]) {
                                rustplus.strobe(device[args[1]], 1000);
                            } else {
                                rustplus.sendTeamMessage(language.no_name);
                            }
                        }
                    } else {
                        rustplus.sendTeamMessage(language.no_name);
                    }
                }
            }
        }
    });

    input.on('line', (msg) => {
        if(msg === 'getToken') {
            readLine.moveCursor(process.stdout, 0, -1);
            Print('HELP', language.get_token)
        } else if (msg === 'clear') {
            readLine.moveCursor(process.stdout, 0, -1);
            console.clear();
        } else if(msg === 'exit') {
            readLine.moveCursor(process.stdout, 0, -1);
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
