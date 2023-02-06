# Rust TeamChat CLI
[ここから](https://github.com/AsutoraGG/Rust-TeamChat-CLI/releases)ダウンロードしないでSource Codeをダウンロードして実行してください
[rustplus.js](https://github.com/liamcottle/rustplus.js)を使用し作られたCLIです。
### -できること-
- ターミナルでチームチャットにメッセージを送信、取得が可能
- ゲーム内コマンドが使用可能  
- スマートアラームの通知がゲーム内チャットに送信される

https://user-images.githubusercontent.com/76235964/192494087-3aadb192-ff28-466a-bb4f-2ca0232ca2ab.mp4  

動画を撮った後に少しプログラムを更新したので一部異なります

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

### deletememo 👑
登録してある文字列を削除します。  
input : ``deletememo [SaveName]``  

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

### translate
入力された文字列を変換する言語に翻訳します  
input : ``translate *[翻訳する文字列] *[言語]``  

### recycle
アイテム名を入力したら分解後のデータが送信されます  
input : ``recycle [アイテム名]``  
注:アイテム名は英語+空白はなし(大文字小文字は関係ないです)。対応されてないアイテムもまだあるので気分で追加していきます  

### mainTC  
;adddevice MainTCで登録すれば;mainTCと打つだけで維持できる時間が表示されます  
もし風化していたら風化をお知らせします
