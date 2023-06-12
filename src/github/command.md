Defalut Prefix =  `;`  
(:crown: = only owner using (please set owner in ``auth.json``)

## pop
Return Server pop  
output : ``pop/maxPop(queue)`` 

## time 
Return In Game Time  
output : ``Hour : Min``

## now 
Returm Not In Game Time  
output : ``Hour : Min``

## sendcommand
send teamInfo, serverInfo to Discord  
input : ``sendcommand [teaminfo || serverinfo] ``  
![image](https://github.com/AsutoraGG/Rust-TeamChat-CLI/assets/76235964/8dc54686-d491-4c93-86b0-1da6385dc0f3)
![image](https://github.com/AsutoraGG/Rust-TeamChat-CLI/assets/76235964/9f94d32d-11bf-4043-bd39-614d8750afc9)


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
Return TeamInfo. Dead? Alive? Online? Offline?　Pop?
input : ``teamInfo [dead, alive, online, offline, pop]``  

## translate
Trnaslate  input String
input : ``translate *[翻訳する文字列] *[言語]``  

## mainTC  
~~**ITS NOT WORKING NOW**~~
;adddevice MainTCで登録すれば;mainTCと打つだけで維持できる時間が表示されます  
もし風化していたら風化をお知らせします
