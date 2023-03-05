// メッセージを送信する準備
let slack_token = "********************************************************************************";// Bot User OAuth Access Token//////
let PIGINATE_LIMIT = 200;

function run() {
// データベース（スプレッドシート）の情報を取得
let sheet = SpreadsheetApp.openById("********************************").getActiveSheet();//スプレッドシートIDを入力////////
//スプレッドシートのimportxml関数などの再処理
//てきとうな場所に行を挿入して削除することでシート全体の更新を行う
sheet.insertRows(1,1);
sheet.deleteRows(1,1);
Utilities.sleep(2000);
SpreadsheetApp.flush();
Utilities.sleep(2000);
//ダメ押しのwait2secとflush

//最後に通知した大会名、更新日付、内容を取得
let notifieddate = sheet.getRange("A2").getDisplayValue();
let notifiedtitle = sheet.getRange("C2").getDisplayValue();
let notifieddata = sheet.getRange("D2").getDisplayValue();

let channelId = "**********";//channel_id　ポストしたいチャンネルによって変更　slack側でもチャンネルごとにアプリの導入をする
let result = "Not Posted"; //GASでのデバッグ用

// 学連HPの最新更新大会名、日付、内容を取得
let date = sheet.getRange("A1").getDisplayValue();
let title = sheet.getRange("C1").getDisplayValue();
let data = sheet.getRange("D1").getDisplayValue();

// 更新されていたらメッセージ送信＆スプレッドシート書き換え
if((notifiedtitle != title)||(notifieddate != date)||(notifieddata != data)) {
  if(data == "#N/A"){
    var message = "新着情報:" + title + "などのページおいて\n" + sheet.getRange("B1").getDisplayValue() + "\n" +　"なんらかの更新があるようです\n\nその他の新着情報は学連HPをご確認ください。\nhttps://jicf.info/";
  }
  else{
    var message = "新着情報:" + title + "などのページおいて\n" + sheet.getRange("B1").getDisplayValue() + "\n" + "「" + data + "」" +　"などの更新があるようです\n\nその他の新着情報は学連HPをご確認ください。\nhttps://jicf.info/";
  }
//slackに投げるとともにデバッグ用にresultでGASとしても返す
  result = post(channelId, message);
//通知した内容を記録
  sheet.getRange("A2").setValue(date);
  sheet.getRange("C2").setValue(title);
  sheet.getRange("D2").setValue(data);
  }
Logger.log(result);
}

function request(method, payload={}, urlPrefix='https://slack.com/api/', jsonParse=true) {
const url = urlPrefix + method;
const options = {
  headers: {
    Authorization: 'Bearer ' + slack_token
  },
  payload: payload
};
const response = UrlFetchApp.fetch(url, options);
let result = response;
if(jsonParse){
  result = JSON.parse(response.getContentText());
  if(!result.ok){
    let error = result;
    if('error' in result){
      error = result.error;
    }
    console.log('API Error for ' + method + ': ' + error);
  }
}
return result;
}

function paginate(method, payload){
  let results = [];
payload['limit'] = PIGINATE_LIMIT;
payload['cursor'] = '';
while(true){
  const result = request(method, payload);
  if(!result.ok) break;
  results.push(result);
  if(!('response_metadata' in result)) break;
  payload['cursor'] = result['response_metadata']['next_cursor']
  if(payload['cursor'] != ""){
    continue;
  }
  break;
}
return results;
}

function post (channelId,message){
const method = 'chat.postMessage';
let payload = {
channel:channelId,
text:message
};
const result = paginate(method, payload);
return result;
}