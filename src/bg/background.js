// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });

chrome.runtime.onStartup.addListener(function() {
  console.log('Starting up...');
});

chrome.runtime.onInstalled.addListener(function () {
  console.log('Got installed...');

  var opts = {
    type: 'basic',
    title: 'Hello!',
    iconUrl: 'icons/icon128.png',
    message: 'I am a notification'
  };
  chrome.notifications.create('', opts, function (id) {
    console.log('Created notification with ID of %s', id);
  });

});

chrome.browserAction.onClicked.addListener(function () {
  console.log('hi there');

  var opts = {
    type: 'basic',
    title: 'Hello!',
    message: 'I am a notification'
  };
  var notification = chrome.notifications.create('', opts, function (id) {
    console.log('Created notification with ID of %s', id);
  });

});
