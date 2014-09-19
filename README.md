Revere : Warning system for webapps
===================================

The downtime is coming, the downtime is coming! 

Revere is a Chrome extension that will alert you with a Chrome notification when a site's status feed is updated. The name is a *hilarious* pun based on [Paul Revere](http://en.wikipedia.org/wiki/Paul_Revere).

## [Install from the Chrome webstore](https://chrome.google.com/webstore/detail/revere-warning-system-for/bmldpfjdefmeicodaidmnlhcbhogfncb?hl=en-US&gl=US)

## The pitch

In the course of running a webapp, you depend on or can be affected by a bunch of 3rd party services. I wanted a lightweight way to keep track of when these sites updated their status pages and thought that Chrome notifications would fit the bill. So, I built this Chrome extension.

## How it works

There is a list of URLs in the options page. Every two minutes, Revere polls those feeds and attempts to parse them to get the latest entry. If the latest entry is new, it will create a notification with the relevant information for that item.

## Bugs or feature requests?

[Make an issue!](https://github.com/nickcanz/revere-extension/issues)

## References

  * General options page design from Zachary Yaho's CRX options page template, https://github.com/zmyaro/crx-options-page
  * Some CSS used from the Chromium project, http://www.chromium.org/Home
