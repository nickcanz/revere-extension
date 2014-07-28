// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });

var Revere = (function () {
  var self = {};

  self.notificationLinks = {};

  self.noop = function () {};

  self.alertForEntry = function (entry) {

    var opts = {
      type: 'basic',
      title: entry.title,
      iconUrl: 'icons/icon128.png',
      isClickable: true,
      message: 'I am a notification'
    };

    chrome.notifications.create('', opts, function (id) {
      self.notificationLinks[id] = entry.link;
    });
  };

  self.nsResolver = function (_) {
    return "http://www.w3.org/2005/Atom";
  };

  self.fetchItem = function (url) {

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
      if (xhr.readyState != 4) return;

      if (xhr.responseXML) {
        var xmlDoc = xhr.responseXML;

        var titleNodeSearch = xmlDoc.evaluate('/f:feed/f:entry[1]/f:title', xmlDoc, self.nsResolver,  XPathResult.ANY_TYPE, null);
        var titleNode = titleNodeSearch.iterateNext();
        var title = titleNode.innerHTML;

        var linkNodeSearch = xmlDoc.evaluate('/f:feed/f:entry[1]/f:link', xmlDoc, self.nsResolver,  XPathResult.ANY_TYPE, null);
        var linkNode = linkNodeSearch.iterateNext();
        var link = linkNode.attributes.getNamedItem('href').value;


        self.alertForEntry({
          title: title,
          link: link
        });

        console.log('Rss entry is: %o', item);
      }
    };

    xhr.open('GET', url, true);
    xhr.send();
  };

  self.queryRSS = function (items) {

    items.urls.map(self.fetchItem);

  };

  return self;
} ());

chrome.notifications.onClicked.addListener(function (notificationId) {
  if (Revere.notificationLinks[notificationId]) {
    console.log('Open up browser to go to: %s', Revere.notificationLinks[notificationId]);
  }
});


chrome.runtime.onStartup.addListener(function() {
  console.log('Starting up...');
});

chrome.runtime.onInstalled.addListener(function () {
  console.log('Got installed...');

  chrome.storage.local.set({
    'urls': [
      'https://status.heroku.com/feed'
     ]
  }, Revere.noop);

});

chrome.browserAction.onClicked.addListener(function () {
  console.log('hi there');

  //var opts = {
  //  type: 'basic',
  //  title: 'Hello!',
  //  iconUrl: 'icons/icon128.png',
  //  message: 'I am a notification'
  //};

  //chrome.notifications.create('', opts, function (id) {
  //  console.log('Created notification with ID of %s', id);
  //});

  chrome.storage.local.get('urls', Revere.queryRSS);

});
