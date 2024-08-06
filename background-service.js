(() => {
  const getActiveTabURL = async () => {
    const tabs = await chrome.tabs.query({
      currentWindow: true,
      active: true,
    });

    return tabs[0];
  };

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
          if (result[tabID].tracking) {
            console.log("Value is " + JSON.stringify(result));
            console.log(result[tabID].playlist_id);
            const playlistDetails = result[tabID];

            portFromView.postMessage({
              purpose: "playlist-tracking-status",
              tracking: true,
              initialize: false,
              playlistID: playlistDetails.playlist_id,
              terminate: false,
            });
          } else {
            const playlistDetails = result[tabID];
            portFromView.postMessage({
              purpose: "playlist-tracking-status",
              tracking: false,
              initialize: false,
              playlistID: playlistDetails.playlist_id,
              terminate: true,
            });
          }
        });
      } else if (!localStorageKeys.includes("" + tabID)) {
        console.log("No Storage");
        portFromView.postMessage({
          purpose: "playlist-tracking-status",
          tracking: false,
          initialize: false,
          terminate: false,
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
              terminate: false,
            });
          });
      }
    });
  };

  const tabBeingTracked = (tabID, tab) => {
    if (tab.url) {
      const currentTabParameters = tab.url.split("?")[1];
      const ytURLParameters = new URLSearchParams(currentTabParameters);
      const ytVideoParameter = ytURLParameters.get("v");
      const ytVideoIndexParameter = ytURLParameters.get("index");

      chrome.storage.local.get(null).then((result) => {
        var localStorageKeys = Object.keys(result);
        if (
          localStorageKeys.includes("" + tabID) &&
          result[tabID].tracking
          // && currentTabParameters !== undefined
        ) {
          // number:{index,videoID}
          const newVideoRecord = {
            videoID: ytVideoParameter,
            index: ytVideoIndexParameter,
          };

          const newVideoRecordID = result[tabID].playlist_index_record + 1;
          new_playlist_index_record = result[tabID].playlist_index_record;
          new_playlist_index_record[newVideoRecordID] = newVideoRecord;
          console.log(new_playlist_index_record);

          // const number = newVideoRecord;

          let updatedTabRecord = {
            tracking: result[tabID].tracking,
            playlist_id: result[tabID].playlist_id,
            playlist_index_record: [
              ...result[tabID].playlist_index_record,
              newVideoRecordID[newVideoRecord],
            ],
          };
          //get video details from url parameters and populate playlist_index_record

          console.log(currentTabParameters);
          console.log(ytVideoIndexParameter);
          console.log(ytVideoParameter);
          console.log(updatedTabRecord);
        }
      });
    }
  };

  const stopTrackingPlaylist = (tabID, playlistID) => {
    let currentTabTrackingInProgress = false;

    chrome.storage.local.get(["" + tabID]).then((result) => {
      console.log("Value is " + JSON.stringify(result));
      console.log(result[tabID].playlist_id);
      let stopTrackingPlaylist = {
        tracking: false,
        playlist_id: result[tabID].playlist_id,
        playlist_index_record: result[tabID].playlist_index_record,
      };

      const playlistDetails = result[tabID];

      chrome.storage.local.clear();

      chrome.storage.local
        .set({ [tabID]: stopTrackingPlaylist })
        .then((result) => {
          portFromView.postMessage({
            purpose: "playlist-tracking-status",
            tracking: false,
            initialize: false,
            playlistID: playlistDetails.playlist_id,
            terminate: true,
          });
        });
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
      } else if (message.command === "stop-tracking-playlist") {
        stopTrackingPlaylist(message.tabID, message.playlistID);
      }
    });
  };

  chrome.runtime.onConnect.addListener(connected);

  chrome.tabs.onUpdated.addListener((tabID, tab) => {
    tabBeingTracked(tabID, tab);
  });
})();
