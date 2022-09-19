'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (/^https?:\/\/www.youtube.com/.test(changeInfo.url)) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        startAdBlocker();
      },
    });
  }
});
