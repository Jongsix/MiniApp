//REFER: https://blogs.msdn.microsoft.com/tonyschr/2007/01/19/ie-automation-tabs/
//         http://www.informit.com/articles/article.aspx?p=1170490&seqNum=7
var arg = WScript.Arguments(0);
var oIE = new ActiveXObject("InternetExplorer.Application");
oIE.Width = 1200;
oIE.Height = 800;
oIE.MenuBar = false;
oIE.StatusBar = false;
oIE.ToolBar = false;
oIE.AddressBar = false;
oIE.Visible = true;
oIE.Navigate2(arg);

if(WScript.Arguments.Count()>1){
  var arg2 = WScript.Arguments(1); //close IE after x-msec.
  WScript.sleep(parseInt(arg2));
  try{
    oIE.Quit();
  }catch(e){
    //WScript.Echo("Exception..");
  }
}
//WScript.Echo("End..");

//execution: wscript.exe ./config/iepopup.js http://11.2.3.4