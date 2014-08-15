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
      message: entry.content
    };

    chrome.notifications.create('', opts, function (id) {
      self.notificationLinks[id] = entry.link;
    });
  };

  self.nsResolver = function (documentElement) {
    var nsResolver = documentElement.ownerDocument.createNSResolver(documentElement),
    defaultNamespace = documentElement.getAttribute('xmlns');

    return function (prefix) {
      return nsResolver.lookupNamespaceURI(prefix) || defaultNamespace;
    };
  };

  self.getEscapedText = function (content) {
    var escapedDiv = document.createElement('div');
    escapedDiv.innerHTML = content;
    escapedDiv.innerHTML = escapedDiv.innerText;
    return escapedDiv.innerText;
  };

  self.searchXPath = function (xmlDoc, xpath) {
    try {
      var search = xmlDoc.evaluate(xpath, xmlDoc, self.nsResolver(xmlDoc.documentElement), XPathResult.ANY_TYPE, null);
      return search.iterateNext();
    } catch (ex) {
      console.log('Error searching xpath %o', ex);
      return null;
    }
  };

  self.evaluateRSS = function (xmlDoc) {
    var entry = self.searchXPath(xmlDoc, '/rss/channel/item[1]');

    if (!entry) { return false; }

    var title = entry.getElementsByTagName('title')[0].innerHTML;
    var link =  entry.getElementsByTagName('link')[0].innerHTML;
    var description =  entry.getElementsByTagName('description')[0].innerHTML;

    return {
      title: title,
      link: link,
      content: self.getEscapedText(description)
    };
  };

  self.evaluateAtom = function (xmlDoc) {

    var entry = self.searchXPath(xmlDoc, '/f:feed/f:entry[1]');
    if (!entry) { return false; }

    var title = entry.getElementsByTagName('title')[0].innerHTML;
    var link =  entry.getElementsByTagName('link')[0].getAttribute('href');
    var content = entry.getElementsByTagName('content')[0].innerHTML;

    return {
      title: title,
      link: link,
      content: self.getEscapedText(content)
    };
  };

  self.getItem = function (url) {

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
      if (xhr.readyState != 4) return;

      if (xhr.responseXML) {
        var xmlDoc = xhr.responseXML;

        var data = self.evaluateAtom(xmlDoc) || self.evaluateRSS(xmlDoc) || null;

        self.alertForEntry(data);
      }
    };

    xhr.open('GET', url, true);
    xhr.send();
  };

  self.isLatestItem = function (entry) {
  };

  self.queryRSS = function (items) {
    items.urls.map(self.getItem);
  };

  return self;
} ());

chrome.notifications.onClicked.addListener(function (notificationId) {
  if (Revere.notificationLinks[notificationId]) {
    chrome.tabs.create({url: Revere.notificationLinks[notificationId]}, Revere.noop);
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
      'https://status.heroku.com/feed',
      'http://status.mailgun.com/history.atom',
      'http://feeds.feedburner.com/postmarkstatus?format=xml'
    ]
  }, Revere.noop);

});

chrome.browserAction.onClicked.addListener(function () {
  console.log('hi there');

  chrome.storage.local.get('urls', Revere.queryRSS);

});
