// (() => {
chrome.tabs.onUpdated.addListener((tabID, tab) => {
  const currentTabParameters = tab.url.split("?")[1];
  const ytURLParameters = new URLSearchParams(currentTabParameters);
  const ytVideoParameter = ytURLParameters.get("v");
  const ytVideoIndexParameter = Number(ytURLParameters.get("index"));

  // const getActiveTabURL = async () => {
  //   const tabs = await chrome.tabs.query({
  //     currentWindow: true,
  //     active: true,
  //   });

  //   return tabs[0];
  // };

  const printKeysInLocalStorage = () => {
    chrome.storage.local.get(null).then((result) => {
      var localStorageKeys = Object.keys(result);
      console.log("Local Storage Keys:", localStorageKeys);
      console.log(result);
    });
  };

  const checkPlaylistTrackingStatus = (portFromView, currentTrackTabID) => {
    chrome.storage.local.get(null).then((result) => {
      var localStorageKeys = Object.keys(result);
      if (localStorageKeys.includes("" + currentTrackTabID)) {
        console.log("Storage");

        chrome.storage.local.get(["" + currentTrackTabID]).then((result) => {
          if (result[currentTrackTabID].tracking) {
            console.log("Value is " + JSON.stringify(result));
            console.log(result[currentTrackTabID].playlist_id);
            const playlistDetails = result[currentTrackTabID];

            portFromView.postMessage({
              purpose: "playlist-tracking-status",
              tracking: true,
              initialize: false,
              playlistID: playlistDetails.playlist_id,
              terminate: false,
            });
          } else {
            const playlistDetails = result[currentTrackTabID];
            portFromView.postMessage({
              purpose: "playlist-tracking-status",
              tracking: false,
              initialize: false,
              playlistID: playlistDetails.playlist_id,
              terminate: true,
            });
          }
        });
      } else if (!localStorageKeys.includes("" + currentTrackTabID)) {
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

  // const startTrackingPlaylist = async (startTrackTabID, playlistID) => {
  const startTrackingPlaylist = async (playlistID) => {
    // tabID:{tracking:"false", playlist_id:"playlistID", playlist_index_record:[{0:89},{1:76},{2:91}]}

    // console.log("tab", maintab);

    const newVideoRecordID = 0;

    if (tab.url) {
      const newVideoRecord = {
        videoID: ytVideoParameter,
        index: 1,
      };

      new_playlist_index_record = [];
      new_playlist_index_record[newVideoRecordID] = newVideoRecord;
      console.log(new_playlist_index_record);

      let playlistForActiveTab = {
        tracking: true,
        playlist_id: playlistID,
        playlist_index_record: new_playlist_index_record,
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
    }
  };

  // const tabBeingTracked = (trackTabID, tab) => {
  const tabBeingTracked = (playlistID, startTracking) => {
    if (tab.url) {
      // const currentTabParameters = tab.url.split("?")[1];
      // const ytURLParameters = new URLSearchParams(currentTabParameters);
      // const ytVideoParameter = ytURLParameters.get("v");
      // const ytVideoIndexParameter = ytURLParameters.get("index");

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

          let newVideoRecordID = Number(
            result[tabID].playlist_index_record.length
          );
          new_playlist_index_record = result[tabID].playlist_index_record;
          new_playlist_index_record[newVideoRecordID] = newVideoRecord;
          console.log(new_playlist_index_record);
          console.log(new_playlist_index_record[newVideoRecordID]);
          console.log(newVideoRecord);

          // const number = newVideoRecord;
          let oldArray = result[tabID].playlist_index_record;
          // let updatedTabRecord = {};

          const updatedTabRecord = {
            tracking: result[tabID].tracking,
            playlist_id: result[tabID].playlist_id,
            // playlist_index_record: [...result[tabID].playlist_index_record, newVideoRecordID[newVideoRecord]],
            playlist_index_record: new_playlist_index_record,
          };
          //get video details from url parameters and populate playlist_index_record
          chrome.storage.local
            .set({ [tabID]: updatedTabRecord })
            .then((result) => {});

          console.log(currentTabParameters);
          console.log(ytVideoIndexParameter);
          console.log(ytVideoParameter);
          console.log(updatedTabRecord);
        } else if (!localStorageKeys.includes("" + tabID) && startTracking) {
          startTrackingPlaylist(playlistID);
        }
      });
    }
  };

  const getTrackedVideos = (trackedVideosTabID, playlistID) => {
    chrome.storage.local.get(null).then((result) => {
      var localStorageKeys = Object.keys(result);
      if (
        localStorageKeys.includes("" + trackedVideosTabID) &&
        result[trackedVideosTabID].tracking
      ) {
        chrome.storage.local.get(["" + trackedVideosTabID]).then((result) => {
          console.log(result[trackedVideosTabID].playlist_index_record);
          portFromView.postMessage({
            purpose: "tracked-videos",
            // tracking: result[trackedVideosTabID].tracking,
            // initialize: false,
            // playlistID: result[trackedVideosTabID].playlist_id,
            // terminate: false,
            videos: result[trackedVideosTabID].playlist_index_record,
          });
        });
      }
    });
  };

  const stopTrackingPlaylist = (stopTrackTabID, playlistID) => {
    let currentTabTrackingInProgress = false;

    chrome.storage.local.get(["" + stopTrackTabID]).then((result) => {
      console.log("Value is " + JSON.stringify(result));
      console.log(result[stopTrackTabID].playlist_id);
      let stopTrackingPlaylist = {
        tracking: false,
        playlist_id: result[stopTrackTabID].playlist_id,
        playlist_index_record: result[stopTrackTabID].playlist_index_record,
      };

      const playlistDetails = result[stopTrackTabID];

      chrome.storage.local.clear();

      chrome.storage.local
        .set({ [stopTrackTabID]: stopTrackingPlaylist })
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
        tabBeingTracked(message.playlistID, true);
        // startTrackingPlaylist(message.tabID, message.playlistID);
      } else if (message.command === "stop-tracking-playlist") {
        stopTrackingPlaylist(message.tabID, message.playlistID);
      } else if (message.command === "retrieve-tracked-videos") {
        getTrackedVideos(message.tabID, message.playlistID);
      }
    });
  };

  chrome.runtime.onConnect.addListener(connected);
  tabBeingTracked("", false);
  // tabBeingTracked(tabID, tab);
  // maintab = tab;
});

// })();
