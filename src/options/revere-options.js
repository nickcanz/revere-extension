var RevereOptions = (function () {
  var self = {};

  self.handleKeypress = function (e) {

    switch (e.keyIdentifier) {
      case 'U+001B':  // Esc
        //Esc pressed, cancel edits
        break;
      case 'Enter':
        //validate input...

        e.stopPropagation();
        break;
      }
  };

  self.buildOptionItem = function (feed) {
    var url = feed.url;

    var row = document.createElement('div');

    var textEl = document.createElement('div');
    textEl.className = 'static-text';
    textEl.textContent = url;
    textEl.setAttribute('displaymode', 'static');
    row.appendChild(textEl);

    var inputEl = document.createElement('input');
    inputEl.className = 'editable-text';
    inputEl.type = 'text';
    inputEl.value = url;
    inputEl.setAttribute('displaymode', 'edit');
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
    });

    var closeButton = document.createElement('button');
    closeButton.className = 'row-delete-button raw-button custom-appearance';

    row.appendChild(closeButton);

    self.urlContainer.appendChild(row);
  };

  self.addBlankRow = function () {

    var row = document.createElement('div');

    row.setAttribute('editing', true);

    var textEl = document.createElement('div');
    textEl.className = 'static-text';
    textEl.textContent = '';
    textEl.setAttribute('displaymode', 'static');
    row.appendChild(textEl);

    var inputEl = document.createElement('input');
    inputEl.className = 'editable-text';
    inputEl.type = 'text';
    inputEl.value = '';
    inputEl.setAttribute('displaymode', 'edit');
    inputEl.setAttribute('placeholder', 'URL for the RSS or Atom feed');
    inputEl.staticVersion = textEl;

    row.appendChild(inputEl);

    self.urlContainer.appendChild(row);
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
