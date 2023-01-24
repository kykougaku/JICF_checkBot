function updateCheck() {
  
  //-------------------------------------------------------------------------------------------------------------------------------//
  let sheet = SpreadsheetApp.openById("********************************").getActiveSheet();//write spreadsheet ID////////
  let slack_token = "***************************************************";// write slack Bot User OAuth Access Token//////
  let channelId = "C************";//write channel_ID. In the channel this bot should be installed
  //-------------------------------------------------------------------------------------------------------------------------------//

  let slackApp = SlackApp.create(slack_token);
  let result = "Not Posted"; //for debugging

  //To update spreadsheet,somelines are inserted and deleted. (just "flush" the spread sheet is not enough.)
  sheet.insertRows(1,1);
  sheet.deleteRows(1,1);
  Utilities.sleep(40000);
  SpreadsheetApp.flush();

  //get the latest notified data. date,title,and infomation.
  let notifieddate = sheet.getRange("E2").getDisplayValue();
  let notifiedtitle = sheet.getRange("F2").getDisplayValue();
  let notifieddata = sheet.getRange("G2").getDisplayValue();

  //get the update in JICF website. date,title,and infomation.
  let date = sheet.getRange("A1").getDisplayValue();
  let title = sheet.getRange("C1").getDisplayValue();
  let data = sheet.getRange("D1").getDisplayValue();

  // if these two data didn't match, send messsage.
  if((notifiedtitle != title)||(notifieddate != date)||(notifieddata != data)) {
    if(data == "#N/A"){
      var message = "新着情報:" + title + "などのページおいて\n" + sheet.getRange("B1").getDisplayValue() + "\n" +　"なんらかの更新があるようです\n\nその他の新着情報は学連HPをご確認ください。\nhttps://jicf.info/";
    }
    else{
      var message = "新着情報:" + title + "などのページおいて\n" + sheet.getRange("B1").getDisplayValue() + "\n" + "「" + data + "」" +　"などの更新があるようです\n\nその他の新着情報は学連HPをご確認ください。\nhttps://jicf.info/";
    }
    //notify in slack
    result = slackApp.chatPostMessage(channelId, message, {});
    //write the latest notified data in spreadsheet
    sheet.getRange("E2").setValue(date);
    sheet.getRange("F2").setValue(title);
    sheet.getRange("G2").setValue(data);
  }
  Logger.log(result);
}