const RustPlus = require('@liamcottle/rustplus.js');
const SteamID = require('steamid');
const Translate = require('translate-google');
const { notify } = require('node-notifier');
const dayJS = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
const { listen } = require('push-receiver');
require('dayjs/locale/ja');

const readLine = require('readline');
const path = require('path');
const https = require('https');
const { existsSync, readFileSync, writeFileSync } = require('fs');
const { writeFile } = require('fs/promises');

const input = readLine.createInterface({ input: process.stdin });

const language = require('./src/language/language.json');

dayJS.locale("ja");
var thresholds = [
    { l: 's', r: 1 },
    { l: 'm', r: 1 },
    { l: 'mm', r: 59, d: 'minute' },
    { l: 'h', r: 1 },
    { l: 'hh', r: 23, d: 'hour' },
    { l: 'd', r: 1 },
    { l: 'dd', r: 29, d: 'day' },
    { l: 'M', r: 1 },
    { l: 'MM', r: 11, d: 'month' },
    { l: 'y' },
    { l: 'yy', d: 'year' }
]
var rounding  = Math.floor;

dayJS.extend(relativeTime, {
    thresholds,
    rounding
});

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
    /* a = INFO等, b = メッセージ, c = チームチャットか, d = チームチャットのメッセージ, e = チームチャットに送信したプレイヤー名*/
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
        } else if(a === 'PAIRING') {
            console.log("\x1b[1m\x1b[32m[" + getTime(true) + "][" + a + "] \x1b[39m: " + b);
        }
    }
}

function setTitle(title) {
	process.stdout.write('\x1b]2;' + title + '\x1b\x5c');
}

function read(path, pars) {
    const r = readFileSync(path, 'utf-8');
    if (pars === true) return JSON.parse(r)
    else if (pars === false) return JSON.stringify(r);
    else return JSON.parse(r)
};

function write(path, property, value) {
    let jsonObj = read(path)
    jsonObj[property] = value;
    writeFileSync(path, JSON.stringify(jsonObj, null, 2));
};

function deleteObject(filename, object) {
    const Json = read('./' + filename );

    if(!Json[object]) {
        Print('INFO', object + language.not_found, false);
        return false;
    }
    delete Json[object];

    writeFile(filename, JSON.stringify(Json, null, 2));
};

console.clear();
input.pause();

if (existsSync('./config.json')) { // config.jsonはこのプログラムでは生成できないので
    if(!existsSync('./auth.json')) { //ファイルがなかったら作成又は終了
        writeFile('./auth.json', "{\n\n}", 'utf-8');
        Print('INFO', 'Saved auth.json', false);
    } else if(!existsSync('./device.json')) {
        writeFile('./device.json', "{\n\n}", 'utf-8');
        Print('INFO', 'Saved device.json', false);
    } else if(!existsSync('./memo.json')) {
        writeFile('./memo.json', "{\n\n}", 'utf-8');
        Print('INFO', 'Saved memo.json', false);
    } else if(!existsSync('./src/recycle.json') || !existsSync('./src/')) {
        Print('ERROR', "src folder is don't Remove!")
        process.exit(0);
    } else if(!existsSync('./rustplus.config.json')) {
        Print('ERROR', 'rustplus.config.json is not Found!', false);
        Print('ERROR', 'Run' + '\x1b[34m npx @liamcottle/rustplus.js fcm-register\x1b[0m');
        process.exit(0);
    } else if(!existsSync('./src/database.json')) {
        writeFile('./src/database.json', '[]', 'utf-8');
        Print('INFO', 'Saved database.json!', false);
    }

    const config = require('./config.json');
    const auth = require('./auth.json');
    const auth_path = './auth.json';
    let databas = './src/database.json'; // idを保存するめのデータベース
    let bot = '[BOT] : ';

    if(!auth.Owner) {　//オーナーが登録されてなかったら
        Print('ERROR', language.no_Owner, false);
        Print('ERROR', language.process_exit, false);
        process.exit(0);
    } else if(!config.fix) { // fixがなかったら更新してください
        Print('ERROR', 'Pls Update this program!!', false);
        process.exit(0);
    } else if(!config.IP || !config.Ingame) { // もしファイルがあっても内容が書かれてなかったら
        Print('ERROR', language.config_error, false);
        process.exit(0);
    }

    if(config.fix === false) { /* ja.jsの一部がゲーム内で使えない漢字だったのでファイルを上書き保存 */
        let URL = "https://gist.githubusercontent.com/AsutoraGG/20dadad0c34b705e6bf56794d488675f/raw/c84ef9494dafbfa0976b38ec1a51179f187a68af/fixJapanese";
        https.get(URL, (res) => {
            let body = '';
            res.setEncoding('utf-8');
        
            res.on('data', (chunk) => {
                body += chunk;
            });
        
            res.on('end', (res) => {
                res = body;
                if(existsSync('./node_modules')) {
                    writeFileSync('./node_modules/dayjs/locale/ja.js', res, 'utf-8');
                    write('./config.json', 'fix', true)
                }
            })
        })
    }

    Print('INFO', language.found_config, false); // ファイルが見つかりましたのお知らせ

    const rustplus = new RustPlus(config.IP, config.PORT, config.ID, config.TOKEN); // RustPlusに登録する情報

    rustplus.on('connected', () => { /* サーバーに接続されたら */
        Print('INFO', language.connected_rustplus, false);
        Print('INFO', language.default_prefix, false);
        rustplus.sendTeamMessage(bot + 'Connected!');

        // rustplus.getTeamInfo(team => { //チーム人数が1の場合ここを無効にしてください(囲めば無効にできます)
        //     let member = team.response.teamInfo.members;
        //     if(member.length === 1) {
        //         Print('ERROR', language.no_teampop, false);
        //         rustplus.disconnect();
        //         process.exit(0);
        //     }
        // });

        setTimeout(() => {
            console.clear();
            input.resume();
        }, 3000);

        if(config.Ingame.command === true) {
            setTitle('Rust-TeamChat-CLI | Made by @AsutoraGG | In Game Command = true')
        } else {
            setTitle('Rust-TeamChat-CLI | Made by @AsutoraGG | In Game Command = false')
        }

        function onNotification({ notification, persistentId }) { //通知の処理 + idの保存
            const i = JSON.stringify(persistentId);
            const id = i.replace(/"/g, '');
            const database_data = read(databas, true);
    
            database_data.push(id);
    
            var newDate = JSON.stringify(database_data);
            writeFileSync(databas, newDate, 'utf-8')
    
            const data = notification.data;
            const body = JSON.parse(data.body);
    
            if (data.channelId === 'pairing') {
                if (body.type === 'entity') {
                    if (body.entityType === '1') {
                        Print('PAIRING', '-- SmartSwitch -- EntityID:' + body.entityId);
                    } else if (body.entityType === '2') {
                        Print('PAIRING', '-- Smart Alarm -- EntityID:' + body.entityId);
                    } else if (body.entityType === '3') {
                        Print('PAIRING', '-- Storage Monitor -- EntityID: ' + body.entityId);
                    }
                } else if (body.type === 'server') {
                    Print('PAIRING', '-- Server -- PlayerToken: ' + body.playerToken);
                }
            } else if (data.channelId === 'alarm') {
                rustplus.sendTeamMessage('[ALARM] : [' + data.title + '] '+ data.message)
                notify({
                    title: '[' + data.title + ']',
                    message: data.message,
                    icon: path.join(__dirname, 'rust.svg')
                })
            }
        }

        async function startListning() {
            const credentials = read('./rustplus.config.json').fcm_credentials;
            let persistentIds = read(databas, true);
    
            await listen({ ...credentials, persistentIds }, onNotification);
        }
    
        startListning();
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
        input.pause();
        Print('INFO', 'Disconnected from Server', false);
    })

    rustplus.on('message', msg => { /* チームチャットでメッセージを受信したときの処理(msg = チームチャットの詳細) */
        const command = require('./src/command.json')
        const device = require('./device.json');
        const device_path = './device.json';
        const recycle = require('./src/recycle.json');
        const memo_path = './memo.json'

        if (msg.broadcast && msg.broadcast.teamMessage) {
            let message = msg.broadcast.teamMessage.message.message.toString(); // メッセージの内容
            let name = msg.broadcast.teamMessage.message.name; //　メッセージを送信した人の名前
            let steamID = msg.broadcast.teamMessage.message.steamId.toString(); //　スチームID

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

                if(message === prefix + command.mainTC) {
                    if(read(auth_path)[name] || name === read(auth_path).Owner) {
                        if(read(device_path, true).MainTC) {
                            rustplus.getEntityInfo(read(device_path, true).MainTC, (r) => {
                                let Info = r.response.entityInfo;

                                if(!r.response.error) {
                                    if(Info.type === 3) { //ストレージモニターか
                                        if(Info.payload.protectionExpiry > 0) { // 0 = 風化
                                            let i = Info.payload.protectionExpiry
                                            rustplus.sendTeamMessage(bot + dayJS(new Date()).to(i * 1000, true) + language.TC_WhenDecay);
                                        } else {
                                            rustplus.sendTeamMessage(bot + language.TC_decay)
                                        }
                                    } else {
                                        rustplus.sendTeamMessage('This is Not Storage Monitor!')
                                    }
                                } else {
                                    if(r.response.error.error.toString().includes('not_found')) {
                                        rustplus.sendTeamMessage(bot + 'MainTC' + language.no_device);
                                    } else {
                                        Print('ERROR', r.response.error.error, false);
                                    }
                                }
                            })
                        } else {
                            rustplus.sendTeamMessage(bot + 'MainTC' + language.not_saved);
                            rustplus.sendTeamMessage(bot + command.add + language.TC_notfound)
                        }
                    } else {
                        rustplus.sendTeamMessage(bot + language.not_auth);
                    }
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
                    if(read(auth_path)[name] || name === read(auth_path).Owner) {
                        const memo = message.slice(prefix + command.addmemo).trim().split(/ +/);

                        if(memo[1] && memo[2]) {
                            if(memo[1] === 'help') {
                                rustplus.sendTeamMessage(bot + command.addmemo + ' [SaveName] ' + '[detail]')
                            } else {
                                if(read(memo_path)[memo[1]]) {
                                    rustplus.sendTeamMessage(bot + memo[1] + language.already_saved);
                                } else {
                                    write('./memo.json', memo[1], memo[2]);
                                    rustplus.sendTeamMessage(bot + language.saved);
                                }
                            }
                        } else {
                            rustplus.sendTeamMessage(bot + command.addmemo + ' [SaveName] ' + '[detail]')
                        }
                    } else {
                        rustplus.sendTeamMessage(bot + language.not_auth);
                    }
                }

                if(message.includes(prefix + command.removememo)) {
                    if(name === read(auth_path).Owner) {
                        const args = message.slice(prefix + command.removememo).trim().split(/ +/);

                        if(args[1]) {
                            deleteObject('memo.json', args[1]);
                            rustplus.sendTeamMessage(bot + language.removed);
                        } else {
                            rustplus.sendTeamMessage(bot + command.removememo + ' [memoName]');
                        }
                    } else {
                        rustplus.sendTeamMessage(bot + language.not_auth)
                    }
                }

                if(message.includes(prefix + command.openmemo)) { //メモの内容を
                    const memo = message.slice(prefix + command.openmemo).trim().split(/ +/);

                    if(memo[1]) {
                        if(memo[1] === 'help') {
                            rustplus.sendTeamMessage(bot + command.openmemo + ' [SaveName]');
                        } else {
                            if(read(memo_path, true)[memo[1]]) {
                                rustplus.sendTeamMessage(bot + memo[1] + " : " + read(memo_path, true)[memo[1]]);
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

                        if(entityID[1] && entityID[2]) {
                            if(entityID[1] === 'help') {
                                rustplus.sendTeamMessage(bot + command.add + ' [entityID] ' + '[saveName]');
                            } else {
                                if(read(device_path)[entityID[2]]) {
                                    rustplus.sendTeamMessage(bot + entityID[2] + language.already_saved);
                                } else {
                                    rustplus.getEntityInfo(entityID[1], (info) => {
                                        let i = info.response;
        
                                        if(i.error) { //responseにエラーがあったら
                                            rustplus.sendTeamMessage(bot + language.invalid_entityid) //エンティティIDを正しく入力してください
                                        } else if(i.entityInfo) { //entityInfoが出てきたら
                                            if(read('./device.json', true)[entityID[2]]) {
                                                rustplus.sendTeamMessage(bot + entityID[2] + language.already_saved)
                                            } else {
                                                write('./device.json', entityID[2], entityID[1])
                                                rustplus.sendTeamMessage(bot + language.saved)
                                            }
                                        } else { //その他はエラー
                                            rustplus.sendTeamMessage(bot + language.error)
                                        }
                                    })
                                }
                            }
                        } else {
                            rustplus.sendTeamMessage(bot + command.add + ' [entityID] ' + '[saveName]');
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

                        if(args[1]) {
                            if(args[1] === 'help') {
                                rustplus.sendTeamMessage(bot + command.removedevice + ' [SaveName]');
                            }

                            if(existsSync('device.json')) {
                                const d = readFileSync('./device.json');
                                const j = JSON.parse(d);

                                if(device[args[1]]) {
                                    deleteObject('device.json', args[1]);
                                    rustplus.sendTeamMessage(bot + language.removed);
                                } else {
                                    rustplus.sendTeamMessage(bot + args[1] + language.not_found)
                                }
                            } else {
                                print('ERORR', 'device.json' + language.not_found, false);
                            }
                        } else {
                            rustplus.sendTeamMessage(bot + command.removedevice + ' [SaveName]');
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
                            } else if(args[1] === 'Owner') {
                                rustplus.sendTeamMessage(bot + "Owner is can't delet!!!!!!!!!!");
                            } else {
                                if(existsSync(auth_path)) {
                                    if(read(auth_path, true)[args[1]]) {
                                        deleteObject(auth_path, args[1]);
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
                                } else {
                                    Print('ERROR', err, false);
                                }
                            })
                        } else {
                            rustplus.sendTeamMessage(bot + command.translate + '*[String] *[Language]' + language.need_args);
                        }
                    } else {
                        rustplus.sendTeamMessage(bot + language.not_auth);
                    }
                }

                if(message.includes(prefix + command.recycle)) { //リサイクラー
                    if(read(auth_path)[name] || name === read(auth_path).Owner) {
                        const args = message.slice(prefix + command.recycle).trim().split(/ +/);
                        
                        if(args[1]) {
                            if(args[1] === 'help') {
                                rustplus.sendTeamMessage(bot + command.recycle + ' [ItemName(No Space)]');
                            } else {
                                let LowerCase = args[1].toLowerCase();
                                if(recycle[LowerCase]) {
                                    rustplus.sendTeamMessage(bot + recycle[LowerCase]);
                                } else {
                                    rustplus.sendTeamMessage(bot + LowerCase + language.not_saved);
                                }
                            }
                        } else {
                            rustplus.sendTeamMessage(bot + command.recycle + ' [ItemName(No Space)]');
                        }
                    } else {
                        rustplus.sendTeamMessage(bot + language.not_auth);
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
            input.pause();
            Print('INFO', language.process_exit, false);
            rustplus.disconnect();
            setTimeout(() => process.exit(), 2000);
        } else if(msg === 'commandList') {
            const command = require('./src/command.json')

            let l = ''
            for(let i of Object.keys(command)) {
                l += ', ' + i
            }
            let list = l.replace(',', '').replace(' ', '').replace(', DEV', '');
            Print('INFO', list, false);
        }else {
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
//スキンください🤪