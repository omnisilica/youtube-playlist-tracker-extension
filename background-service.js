(() => {
  const checkPlaylistTrackingStatus = (portFromView, tabID) => {
    chrome.storage.local.get(null).then((result) => {
      var localStorageKeys = Object.keys(result);
      if (!localStorageKeys.includes(tabID)) {
        portFromView.postMessage({
          purpose: "playlist-tracking-status",
          trackingSatus: false,
        });
      }
    });
  };

  function connected(port) {
    portFromView = port;
    portFromView.onMessage.addListener((message) => {
      if (message.command === "check-playlist-tracking-status") {
        checkPlaylistTrackingStatus(portFromView, message.tabID);
      }
    });
  }

  chrome.runtime.onConnect.addListener(connected);
})();
