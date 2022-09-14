# Rust TeamChat CLI
[rustplus.js](https://github.com/liamcottle/rustplus.js)を使用し作られたCLIです。
### -できること-
▪️ ターミナルでチームチャットにメッセージを送信、取得が可能
▪️ ゲーム内コマンドが使用可能


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

## openmemo
登録してある文字列を確認することができます(SaveNameはaddmemoで登録した名前です
input : ``openmemo [SaveName]``
output : ``文字列``

### changeLeader
|---開発段階です---|　まだテストしていない
成功すればリーダーを他人に渡せます

## Help
Discord : Asutora#7267
