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

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "skip-ad") {
    const { x, y } = request;
    chrome.debugger.attach({ tabId: sender.tab.id }, "1.3", () => {
      chrome.debugger.sendCommand({ tabId: sender.tab.id }, "Input.dispatchMouseEvent", {
        type: "mousePressed",
        x: x,
        y: y,
        button: "left",
        clickCount: 1,
      }, () => {
        chrome.debugger.sendCommand({ tabId: sender.tab.id }, "Input.dispatchMouseEvent", {
          type: "mouseReleased",
          x: x,
          y: y,
          button: "left",
          clickCount: 1,
        }, () => {
          chrome.debugger.detach({ tabId: sender.tab.id });
        });
      });
    });
  }
});
