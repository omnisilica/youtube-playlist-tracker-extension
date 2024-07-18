(() => {
  console.log("test content-script");
  // All these super companies, clearly they do not like people poking around in their technologoy, unless it's in their controlled environment
  //console.log(document.querySelector("ytd-app #content"));
  // let playlistThumbnail = document.querySelector(
  //   "ytd-app #content ytd-page-manager ytd-watch-flexy #columns #primary #primary-inner #below #playlist #container #items ytd-playlist-panel-video-renderer #wc-endpoint #container #thumbnail-container ytd-thumbnail #thumbnail yt-image img"
  // );
  // setTimeout(() => {
  //   console.log();
  // }, 5000);

  // while (playlistThumbnail === null) {
  //   setTimeout(() => {
  //     playlistThumbnail = document.querySelector(
  //       "ytd-app #content ytd-page-manager ytd-watch-flexy #columns #primary #primary-inner #below #playlist #container #items ytd-playlist-panel-video-renderer #wc-endpoint #container #thumbnail-container ytd-thumbnail #thumbnail yt-image img"
  //     );
  //   }, 3000);
  // }

  // console.log(playlistThumbnail);

  let contentPort = chrome.runtime.connect({
    name: "port-from-content-script",
  });

  contentPort.postMessage({ greeting: "hello from content script" });

  contentPort.onMessage.addListener((message) => {
    console.log("In content script, received message from background script: ");
    console.log(message.greeting);
  });

  document.body.addEventListener("click", () => {
    contentPort.postMessage({ greeting: "they clicked the page!" });
  });
})();
