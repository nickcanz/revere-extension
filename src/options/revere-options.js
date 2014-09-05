var RevereOptions = (function () {
  var self = {};

  self.getInnerHTML = function (elem) {
    return { url: elem.innerHTML };
  };

  self.isNotEmptyFeed = function (feed) {
    return feed.url != '';
  };

  self.updateStorageFromDOM = function () {

    var elems = document.getElementsByClassName('static-text'); 

    var urls = [];

    var urls = Array.prototype.map.call(elems, self.getInnerHTML);
    var filteredUrls = Array.prototype.filter.call(urls, self.isNotEmptyFeed);

    chrome.storage.local.set({feeds: filteredUrls}, function () {
      self.urlContainer.innerHTML = '';
      self.getUrls();
    });
  };

  self.handleInputKeypress = function (e) {

    switch (e.keyIdentifier) {
      case 'U+001B':  // Esc
        e.target.value = e.target.staticVersion.innerText;
        e.target.blur();
        break;
      case 'Enter':
        e.target.staticVersion.innerText = e.target.value;
        self.updateStorageFromDOM();
        e.stopPropagation();
        break;
      }
  };

  self.buildDisplayTextEl = function (text) {
    var textEl = document.createElement('div');
    textEl.className = 'static-text';
    textEl.textContent = text;
    textEl.setAttribute('displaymode', 'static');
    return textEl;
  };

  self.buildInputTextEl = function (text) {
    var inputEl = document.createElement('input');
    inputEl.className = 'editable-text';
    inputEl.type = 'text';
    inputEl.value = text;
    inputEl.setAttribute('displaymode', 'edit');
    inputEl.addEventListener('keydown', self.handleInputKeypress);
    inputEl.setAttribute('placeholder', 'URL for the RSS or Atom feed');

    return inputEl;
  };

  self.buildOptionItem = function (feed) {
    var url = feed.url;

    var row = document.createElement('div');

    var textEl = self.buildDisplayTextEl(url)
    row.appendChild(textEl);

    var inputEl = self.buildInputTextEl(url);
    inputEl.staticVersion = textEl;

    inputEl.addEventListener('blur', function (e) {
      console.log('blurring');
      e.target.parentNode.removeAttribute('editing');
    });

    row.appendChild(inputEl);

    row.addEventListener('click', function (e) {
      e.target.parentNode.setAttribute('editing', 'true');
      inputEl.focus();
      e.preventDefault();
      e.stopPropagation();
    });

    var closeButton = document.createElement('button');
    closeButton.className = 'row-delete-button raw-button custom-appearance';

    closeButton.addEventListener('click', function (e) {
      self.urlContainer.removeChild(e.target.parentNode);
      self.updateStorageFromDOM();
      e.stopPropagation();
      e.preventDefault();
    });


    row.appendChild(closeButton);

    self.urlContainer.appendChild(row);
  };

  self.addBlankRow = function () {

    var row = document.createElement('div');
    row.setAttribute('editing', true);

    var textEl = self.buildDisplayTextEl('');
    row.appendChild(textEl);

    var inputEl = self.buildInputTextEl('');
    inputEl.staticVersion = textEl;

    row.appendChild(inputEl);

    self.urlContainer.appendChild(row);
    inputEl.focus();
  };

  self.getUrls = function () {
    chrome.storage.local.get('feeds', function (data) {
      data.feeds.map(self.buildOptionItem);

      self.addBlankRow();
    });
  };

  self.init = function () {
    //load urls from storage
    self.urlContainer = document.getElementById('url-list');
    self.getUrls();
  };

  return self;
} ());

window.addEventListener('load', function () {
  RevereOptions.init();
}, false);
