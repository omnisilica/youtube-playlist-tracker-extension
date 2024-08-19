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
      // console.log("Local Storage Keys:", localStorageKeys);
      // console.log(result);
    });
  };

  const startTrackingPlaylist = async (tab, playlistID) => {
    if (tab.active) {
      const tabID = tab.id;
      const currentTabParameters = tab.url.split("?")[1];
      const ytURLParameters = new URLSearchParams(currentTabParameters);
      const ytVideoParameter = ytURLParameters.get("v");

      let playlistForActiveTab = {
        tracking: true,
        playlist_id: playlistID,
        playlist_index_record: [{ videoID: ytVideoParameter, videoIndex: 1 }],
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
              portFromView.postMessage({
                purpose: "playlist-tracking-status",
                tracking: true,
                initialize: true,
                terminate: false,
              });
            });
        }
      });
    }
  };

  const checkPlaylistTrackingStatus = (portFromView, tabID) => {
    chrome.storage.local.get(null).then((result) => {
      var localStorageKeys = Object.keys(result);
      if (localStorageKeys.includes("" + tabID)) {
        chrome.storage.local.get(["" + tabID]).then((result) => {
          if (result[tabID].tracking) {
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
        portFromView.postMessage({
          purpose: "playlist-tracking-status",
          tracking: false,
          initialize: false,
          terminate: false,
        });
      }
    });
  };

  const updatePlaylistTracklist = async () => {
    const tab = await getActiveTabURL();

    if (tab) {
      const tabID = tab.id;
      const currentTabParameters = tab.url.split("?")[1];
      const ytURLParameters = new URLSearchParams(currentTabParameters);
      const ytVideoParameter = ytURLParameters.get("v");
      const ytVideoIndexParameter = ytURLParameters.get("index");

      chrome.storage.local.get(null).then((result) => {
        var localStorageKeys = Object.keys(result);
        if (localStorageKeys.includes("" + tabID) && result[tabID].tracking) {
          const newVideoRecord = {
            videoID: ytVideoParameter,
            videoIndex: Number(ytVideoIndexParameter),
          };

          let newVideoRecordID = Number(
            result[tabID].playlist_index_record.length
          );

          new_playlist_index_record = result[tabID].playlist_index_record;

          previousVideoRecord = new_playlist_index_record[newVideoRecordID - 1];

          previousVideoID = previousVideoRecord.videoID;

          if (ytVideoParameter !== previousVideoID) {
            new_playlist_index_record[newVideoRecordID] = newVideoRecord;
          }

          const updatedTabRecord = {
            tracking: result[tabID].tracking,
            playlist_id: result[tabID].playlist_id,
            playlist_index_record: new_playlist_index_record,
          };
          chrome.storage.local.set({ [tabID]: updatedTabRecord });
        }
      });
    }
  };

  const getTrackedVideos = (trackedVideosTabID, playlistID) => {
    chrome.storage.local.get(null).then((result) => {
      var localStorageKeys = Object.keys(result);
      if (localStorageKeys.includes("" + trackedVideosTabID)) {
        chrome.storage.local.get(["" + trackedVideosTabID]).then((result) => {
          console.log(result[trackedVideosTabID].playlist_index_record);
          portFromView.postMessage({
            purpose: "tracked-videos",
            videos: result[trackedVideosTabID].playlist_index_record,
          });
        });
      }
    });
  };

  const stopTrackingPlaylist = (tabID, playlistID) => {
    chrome.storage.local.get(["" + tabID]).then((result) => {
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
      } else if (message.command === "start-tracking-playlist") {
        startTrackingPlaylist(message.tab, message.playlistID);
      } else if (message.command === "check-playlist-tracking-status") {
        checkPlaylistTrackingStatus(portFromView, message.tabID);
      } else if (message.command === "retrieve-tracked-videos") {
        getTrackedVideos(message.tabID, message.playlistID);
      } else if (message.command === "stop-tracking-playlist") {
        stopTrackingPlaylist(message.tabID, message.playlistID);
      }
    });
  };

  chrome.runtime.onConnect.addListener(connected);

  chrome.tabs.onUpdated.addListener(updatePlaylistTracklist);
})();
