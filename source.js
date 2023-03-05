//------------In this section, you have to write some private information.-----------------------------------------//
let slack_token = "********************************************************************************";// write Bot User OAuth Access Token//////
let channelId = "**********";//wite channel ID. The channel should be installed this bot.
let sheet = SpreadsheetApp.openById("********************************").getActiveSheet();//write spreadsheet ID//////////
//----------------------------------------------------------------------------------------------------------//
let PIGINATE_LIMIT = 200;
let result = "Not Posted"; //message for debugging

function run() {
  // To update spreadsheet, somelines are inserted and deleted.(just "flush" the spread sheet is not enough)
  sheet.insertRows(1, 1);
  sheet.deleteRows(1, 1);
  Utilities.sleep(2000);
  SpreadsheetApp.flush();
  Utilities.sleep(5000);

  // get the last notified data. date, title, and information
  let notifieddate = sheet.getRange("A2").getDisplayValue();
  let notifiedtitle = sheet.getRange("C2").getDisplayValue();
  let notifieddata = sheet.getRange("D2").getDisplayValue();


  // get the update in JICF website. date, title, and information
  let date = sheet.getRange("A1").getDisplayValue();
  let title = sheet.getRange("C1").getDisplayValue();
  let data = sheet.getRange("D1").getDisplayValue();

  //If the update data is changed, post messaage.
  if ((notifiedtitle != title) || (notifieddate != date) || (notifieddata != data)) {
    if (data == "#N/A") { //if the update data is not regular expression,
      var message = "新着情報:" + title + "などのページおいて\n" + sheet.getRange("B1").getDisplayValue() + "\n" + "なんらかの更新があるようです\n\nその他の新着情報は学連HPをご確認ください。\nhttps://jicf.info/";
    }
    else {
      var message = "新着情報:" + title + "などのページおいて\n" + sheet.getRange("B1").getDisplayValue() + "\n" + "「" + data + "」" + "などの更新があるようです\n\nその他の新着情報は学連HPをご確認ください。\nhttps://jicf.info/";
    }
    //notify in slack
    result = post(channelId, message);
    //the update is logged as the last notified massages.
    sheet.getRange("A2").setValue(date);
    sheet.getRange("C2").setValue(title);
    sheet.getRange("D2").setValue(data);
  }
  Logger.log(result);
}
//these functions post https requests using GAS UrlFetchApp func.
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
  if (jsonParse) {
    result = JSON.parse(response.getContentText());
    if (!result.ok) {
      let error = result;
      if ('error' in result) {
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
  while (true) {
    const result = request(method, payload);
    if (!result.ok) break;
    results.push(result);
    if (!('response_metadata' in result)) break;
    payload['cursor'] = result['response_metadata']['next_cursor']
    if (payload['cursor'] != "") {
      continue;
    }
    break;
  }
  return results;
}

function post (channelId,message){
  const method = 'chat.postMessage';
  let payload = {
    channel: channelId,
    text: message
  };
  const result = paginate(method, payload);
  return result;
}