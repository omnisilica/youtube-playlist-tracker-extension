(() => {
  const printKeysInLocalStorage = () => {
    chrome.storage.local.get(null).then((result) => {
      var localStorageKeys = Object.keys(result);
      console.log("Local Storage Keys:", localStorageKeys);
      console.log(result);
    });
  };

  const checkPlaylistTrackingStatus = (portFromView, tabID) => {
    chrome.storage.local.get(null).then((result) => {
      var localStorageKeys = Object.keys(result);
      if (localStorageKeys.includes("" + tabID)) {
        console.log("Storage");

        chrome.storage.local.get(["" + tabID]).then((result) => {
          console.log("Value is " + JSON.stringify(result));
          console.log(result[tabID].playlist_id);
          const playlistDetails = result[tabID];

          portFromView.postMessage({
            purpose: "playlist-tracking-status",
            tracking: true,
            initialize: false,
            playlistID: playlistDetails.playlist_id,
          });
        });
      } else if (!localStorageKeys.includes("" + tabID)) {
        console.log("No Storage");
        portFromView.postMessage({
          purpose: "playlist-tracking-status",
          tracking: false,
          initialize: false,
        });
      }
    });
  };

  const startTrackingPlaylist = (tabID, playlistID) => {
    // tabID:{tracking:"false", playlist_id:"playlistID", playlist_index_record:[{0:89},{1:76},{2:91}]}

    let playlistForActiveTab = {
      tracking: true,
      playlist_id: playlistID,
      playlist_index_record: [],
    };

    printKeysInLocalStorage();

    chrome.storage.local.get("" + tabID).then((result) => {
      let currentTabTrackingInProgress = false;

      if (!(Object.keys(result).length == 0)) {
        currentTabTrackingInProgress = true;
      } else {
        chrome.storage.local
          .set({ [tabID]: playlistForActiveTab })
          .then((result) => {
            //console.log(playlistForActiveTab);
            console.log("Added playlist");
            console.log(result);
            //console.log(currentTabTrackingInProgress);
            portFromView.postMessage({
              purpose: "playlist-tracking-status",
              tracking: true,
              initialize: true,
            });
          });
      }
    });
  };

  const connected = (port) => {
    portFromView = port;
    portFromView.onMessage.addListener((message) => {
      if (message.clicked) {
        portFromView.postMessage({
          purpose: "Entry",
        });
      } else if (message.command === "check-playlist-tracking-status") {
        checkPlaylistTrackingStatus(portFromView, message.tabID);
      } else if (message.command === "start-tracking-playlist") {
        startTrackingPlaylist(message.tabID, message.playlistID);
      }
    });
  };

  chrome.runtime.onConnect.addListener(connected);
})();
