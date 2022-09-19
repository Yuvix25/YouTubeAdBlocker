"use strict";

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts


function setPlaybackRate(rate) {
  const vid = document.querySelector("#movie_player > div.html5-video-container > video");
  vid && (vid.playbackRate = rate);
}

function closeAd() {
  document.querySelector("div.ytp-ad-module div.ytp-ad-image-overlay > div.ytp-ad-overlay-close-container > button")?.click();
}

let adObserver;

function startAdBlocker() {
  console.log("YouTube ad blocker re-loaded.");

  let foundAd = false;
  const interval = setInterval(() => {
    foundAd = !!document.querySelector(".ytp-ad-player-overlay");
    if (foundAd) {
      setPlaybackRate(16);
    } else {
      setPlaybackRate(1);
      setTimeout(() => {
        if (!foundAd) {
          setPlaybackRate(1);
          clearInterval(interval);
        }
      }, 10000);
    }
  }, 100);

  if (adObserver === undefined) {
    adObserver = new MutationObserver((mutations) => {
      console.log("Ad detected. Closing...")
      closeAd();
      startAdBlocker();
    });
    adObserver.observe(document.querySelector(".ytp-ad-module"), {
      childList: true,
      subtree: true,
    });
  }
}


window.addEventListener("load", startAdBlocker);
startAdBlocker();
