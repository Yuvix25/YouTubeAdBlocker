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
  if (getPlaybackRate() === 1) {
    const vid = document.querySelector("#movie_player > div.html5-video-container > video");
    vid && (vid.playbackRate = rate);
  }
}

function getPlaybackRate() {
  const vid = document.querySelector("#movie_player > div.html5-video-container > video");
  return vid ? vid.playbackRate : 1;
}

function skipAd() {
  const skipButton = document.querySelector("button.ytp-skip-ad-button, button.ytp-ad-skip-button-modern");
  if (skipButton && getComputedStyle(skipButton, null).display != "none") {
    console.log("Skipping ad...");
    skipButton.click();
    const { x, y, width, height } = skipButton.getBoundingClientRect();
    chrome.runtime.sendMessage({action: "skip-ad", x: x + width / 2, y: y + height / 2});
    return true;
  }
  return false;
}

function closeAd() {
  document.querySelector("div.ytp-ad-module div.ytp-ad-image-overlay > div.ytp-ad-overlay-close-container > button")?.click();
}

function dismissYoutubePremium() {
  document.querySelector("#dismiss-button > yt-button-shape > button")?.click();
}

let adObserver;

function startAdBlocker() {
  console.log("YouTube ad blocker re-loaded.");

  let foundAd = false;
  let doSkip = true;
  const interval = setInterval(() => {
    foundAd = !!document.querySelector("div.html5-video-player.ad-showing");
    if (foundAd) {
      setPlaybackRate(16);
      if (doSkip) {
        doSkip = !skipAd();
      }
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

    const observerInterval = setInterval(() => {
      const adModule = document.querySelector("div.ytp-ad-module");
      if (adModule) {
        adObserver.observe(document.querySelector(".ytp-ad-module"), {
          childList: true,
          subtree: true,
        });
        clearInterval(observerInterval);
      }
      dismissYoutubePremium();
    }, 100);
  }
}


window.addEventListener("load", startAdBlocker);
startAdBlocker();
