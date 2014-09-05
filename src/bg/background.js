var Revere = (function () {
  var self = {};

  self.alertForEntry = function (entry) {

    var opts = {
      type: 'basic',
      title: entry.feedTitle + ' Update: ' + entry.title,
      iconUrl: 'icons/revere-icon-144.png',
      isClickable: true,
      message: entry.content
    };

    chrome.notifications.create('', opts, function (id) {
      var linkData = {};
      linkData['notificationlink.' + id] = entry.link;
      chrome.storage.local.set(linkData);
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

    var feedTitle = self.searchXPath(xmlDoc, '/rss/channel/title').innerHTML;
    var title = entry.getElementsByTagName('title')[0].innerHTML;
    var link =  entry.getElementsByTagName('link')[0].innerHTML;
    var description =  entry.getElementsByTagName('description')[0].innerHTML;

    return {
      feedTitle: feedTitle,
      title: title,
      link: link,
      content: self.getEscapedText(description)
    };
  };

  self.evaluateAtom = function (xmlDoc) {

    var entry = self.searchXPath(xmlDoc, '/f:feed/f:entry[1]');
    if (!entry) { return false; }

    var feedTitle = self.searchXPath(xmlDoc, '/f:feed/f:title').innerHTML;
    var title = entry.getElementsByTagName('title')[0].innerHTML;
    var link =  entry.getElementsByTagName('link')[0].getAttribute('href');
    var content = entry.getElementsByTagName('content')[0].innerHTML;

    return {
      title: title,
      feedTitle: feedTitle,
      link: link,
      content: self.getEscapedText(content)
    };
  };

  self.getItem = function (feed) {

    var url = feed.url,
        xhr = new XMLHttpRequest();

    console.log('Query url: %s', url);

    xhr.onreadystatechange = function () {
      if (xhr.readyState != 4) return;

      if (xhr.responseXML) {
        var xmlDoc = xhr.responseXML;

        var data = self.evaluateAtom(xmlDoc) || self.evaluateRSS(xmlDoc) || null;
        self.alertIfLatest({feed: feed, latestEntry: data});
      }
    };

    xhr.open('GET', url, true);
    xhr.send();
  };

  self.alertIfLatest = function (feedData) {
    var key = 'latest.' + feedData.feed.url;
    chrome.storage.local.get(key, function (latestEntry) {
      console.log('Latest entry for %o is %o', key, latestEntry);
      if (!latestEntry || latestEntry[key] != feedData.latestEntry.link) {
        self.alertForEntry(feedData.latestEntry);
        var dataToStore = {};
        dataToStore[key] = feedData.latestEntry.link;
        chrome.storage.local.set(dataToStore);
      }
    });
  };

  self.queryRSSFeeds = function () {
    chrome.storage.local.get('feeds', function (data) {
      data.feeds.map(self.getItem);
    });
  };

  return self;
} ());

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.set({
    feeds: [
      {url: 'https://status.heroku.com/feed'},
      {url: 'http://status.aws.amazon.com/rss/ec2-us-east-1.rss'},
      {url: 'http://feeds.feedburner.com/postmarkstatus?format=xml'},
      {url: 'http://status.dploy.io/rss'},
      {url: 'http://feeds.feedburner.com/beanstalkstatus?format=xml'}
    ]
  });

  chrome.alarms.create('queryRSS', { periodInMinutes: 2 });
});

chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm && alarm.name == 'queryRSS') {
    Revere.queryRSSFeeds();
  }
});

chrome.browserAction.onClicked.addListener(function () {
  Revere.queryRSSFeeds();
});

chrome.notifications.onClicked.addListener(function (notificationId) {

  var key = 'notificationlink.' + notificationId;
  chrome.storage.local.get(key, function (items) {

    if (items[key]) {
      chrome.tabs.create({url: items[key]}, function (tab) {
        chrome.windows.update(tab.windowId, { focused: true });
      });
    }
  });
});

chrome.notifications.onClosed.addListener(function (notificationId) {
  var key = 'notificationlink.' + notificationId;
  chrome.storage.local.remove(key);
});
