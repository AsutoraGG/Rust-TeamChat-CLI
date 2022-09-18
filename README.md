# Rust TeamChat CLI
[rustplus.js](https://github.com/liamcottle/rustplus.js)を使用し作られたCLIです。
### -できること-
- ターミナルでチームチャットにメッセージを送信、取得が可能
- ゲーム内コマンドが使用可能

https://user-images.githubusercontent.com/76235964/190354366-e53c744e-6690-4c19-a82e-ee6ff17ad130.mp4



## - インストール -
1. ``npm install``を実行
2. 次に[これ](https://github.com/AsutoraGG/getToken)をダウンロード(Player Tokenを取得するため)

## - コマンドリスト -
Prefix(コマンドの最初につける文字)はデフォルトで`;`になっています
(👑がついてるコマンドはオーナーしか使えません)

### pop
サーバーの人数を取得します  
output : ``pop/maxPop(queue)`` 

### teampop
チームの人数を取得します  
output : ``teampop``

### time 
サーバーの時間を取得します  
output : ``Hour : Min``

### now 
現在時刻(ゲーム内ではなく)を取得  
output : ``Hour : Min``

### addauth 👑
権限を追加します。これはコマンドの使用をプレイヤーに許可します  
input : ``addauth [playerName]``

### removeauth 👑
addauthで登録したプレイヤーの権限を削除します  
input : ``removeauth [PlayerName]``

### removedevice 👑
adddeviceで登録したデバイスを削除します  
input : ``removedevice [saveName]``

### adddevice 👑
スマートスイッチをOn Off切り替えるためにデバイスを追加します  
input : ``adddevice [entityID] [saveName]``  
(entityIDは[これ](https://github.com/AsutoraGG/getToken)を使用して取得できます)

### on
スマートスイッチをOnに切り替えます。(saveNameはadddeviceで登録した名前です)  
input : ``on [saveName]``

### off
スマートスイッチをOffに切り替えます。  
input : ``off [saveName]``

### addmemo
メモに文字列を追加します。(パスワードとか?...)  
input : ``addmemo [SaveName] [文字列]``

### openmemo
登録してある文字列を確認することができます(SaveNameはaddmemoで登録した名前です  
input : ``openmemo [SaveName]``  
output : ``文字列``

### changeLeader
もし使う人がチームリーダーだったらリーダーをチャットで変更できます。  
input : ``leader [NewLeaderSteamID]``

### steamid
このコマンドを使用した人のSteamIDを取得します。  
output : ``PlayerName : SteamID``

### teamInfo
誰が生きているか、死んでいるか、オンラインか、オフラインかが確認できます  
dead, alive, online, offlineのどれかを入力してください  
input : ``teamInfo [dead, alive, online, offline]``

## Help
Discord : Asutora#7267

チームチャットを受け取るたび(何かコンソールログに表示されたら)にメモリ使用量が0.5 ~ 1MB使うのでたまに*clear*を使ってコンソールをクリアすることをお勧めします
