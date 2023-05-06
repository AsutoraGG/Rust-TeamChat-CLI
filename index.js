/* Made by @AsutoraGG */
const { listen } = require('push-receiver');
const { writeFileSync, existsSync, readFileSync } = require('fs');

console.clear();

if (existsSync('rustplus.config.json')) {  // check rustplus.config.json
    if(!existsSync('./database.json')) {
        writeFileSync('./database.json', '[]');
    }

    console.log('[INFO] : Found rustplus.config.json!')
    let databasePATH = './database.json';

    function readJson(path, pars) {
        const r = readFileSync(path, 'utf-8');
        if (pars === true) return JSON.parse(r)
        else if (pars === false) return JSON.stringify(r);
        else return JSON.parse(r)
    }

    function onNotification({ notification, persistentId }) {
        const i = JSON.stringify(persistentId);
        const id = i.replace(/"/g, '');
        const database = readJson(databasePATH, true);

        database.push(id);

        var newDate = JSON.stringify(database);
        writeFileSync(databasePATH, newDate, 'utf-8')

        const data = notification.data;
        const body = JSON.parse(data.body);

        const saveDate = {
            "IP": body.ip,
            "PORT": body.port,
            "ID": body.playerId,
            "TOKEN": body.playerToken,
            "Ingame": {
                "command": true,
                "prefix": ";"
            },
            "Discord": {
                "Token": "",
                "ChannelID": ""
            },
            "fix": false
        }

        if (data.channelId === 'pairing') {
            if (body.type === 'server') {
                console.log('\n--Server Pairing--');
                console.log('Player Token : ' + body.playerToken);
                console.log('Server : ' + body.ip + ':' + body.port + ' (' + body.name + ')\n');
                writeFileSync('./config.json', JSON.stringify(saveDate, null, 2)); // Save config data
            }
        } else {
            console.log(data);
        }
    }

    async function startListning() {
        const credentials = readJson('./rustplus.config.json').fcm_credentials;
        let persistentIds = readJson(databasePATH, true);

        await listen({ ...credentials, persistentIds }, onNotification);
    }

    startListning();
} else {
    console.log('[Error] : rustplus.config.json is Not found!');
    console.log('[Error] : Run "npx @liamcottle/rustplus.js fcm-register" ');
    process.exit(0);
};
