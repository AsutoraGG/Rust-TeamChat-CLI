Defalut Prefix =  `;`  
(:crown: = only owner using (please set owner in ``auth.json``)

## pop
Return Server pop
output : ``pop/maxPop(queue)`` 

## teampop
Return Team Pop  
output : ``teampop``

## time 
Return In Game Time
output : ``Hour : Min``

## now 
Returm Not In Game Time
output : ``Hour : Min``

## steamid
return Your SteamID
output : ``PlayerName : SteamID``

## addauth :crown:
Add auth. this is This allows the player to use commands
input : ``addauth [playerName]``

## removeauth :crown:
Remove Auth from player
input : ``removeauth [PlayerName]``

## adddevice :crown:
Add Device. its using on off neded
input : ``adddevice [entityID] [saveName]``  

## removedevice :crown:
Remove Device
input : ``removedevice [saveName]``

## on
Switch to On(Smart Switch)
input : ``on [saveName]``

## off
Switch to OffSmart Switch)
input : ``off [saveName]``

## changeLeader
Change Leader. if your leader
input : ``leader [NewLeaderSteamID]``

## teamInfo
Return TeamInfo. Dead? Alive? Online? Offline?
input : ``teamInfo [dead, alive, online, offline]``  

## translate
Trnaslate  input String
input : ``translate *[翻訳する文字列] *[言語]``  

## recycle
アイテム名を入力したら分解後のデータが送信されます  
input : ``recycle [アイテム名]``  
注:アイテム名は英語+空白はなし(大文字小文字は関係ないです)。対応されてないアイテムもまだあるので気分で追加していきます  

## mainTC  
**ITS NOT WORKING NOW**
;adddevice MainTCで登録すれば;mainTCと打つだけで維持できる時間が表示されます  
もし風化していたら風化をお知らせします
