(() => {
  // let portFromContentScript;
  // const connected = (port) => {
  //   console.assert(port.name === "port-from-content-script");
  //   portFromContentScript = port;
  //   portFromContentScript.postMessage({ greeting: "hi there content script!" });
  //   portFromContentScript.onMessage.addListener((message) => {
  //     portFromContentScript.postMessage({
  //       greeting: `In background script, received message from content script: ${message.greeting}`,
  //     });
  //   });
  // };

  // chrome.runtime.onConnect.addListener(connected);

  /*chrome.browserAction.onClicked.addListener(() => {
    portFromContentScript.postMessage({ greeting: "they clicked the button!" });
  });*/

  // let backgroundPort = chrome.runtime.connect({
  //   name: "port-from-content-script",
  // });

  // backgroundPort.postMessage({ greeting: "hello from background service" });

  // backgroundPort.onMessage.addListener((message) => {
  //   console.log("In content script, received message from background script: ");
  //   console.log(message.greeting);
  // });

  // document.body.addEventListener("click", () => {
  //   backgroundPort.postMessage({ greeting: "they clicked the page!" });
  // });

  // chrome.runtime.onMessage.addListener((message, sender, response) => {
  //   const { message } = message;

  //   if (message === "check_playlist_recording_status") {
  //     console.log("chrome runtime onMessage");
  //     //Check whether video recording is true
  //   }
  // });

  let portFromCS;

  const checkPlaylistTrackingStatus = () => {
    let playlistTrackingStatus;

    if (chrome.storage.local.get([tabID])) {
      //dsadf
    }
    return;
  };

  function connected(p) {
    portFromView = p;
    portFromView.postMessage({ greeting: "hi there content script!" });
    portFromView.onMessage.addListener((message) => {
      if (message.command === "check-playlist-tracking-status") {
        //checkPlaylistTrackingStatus();
        console.log(message.tabID);
        chrome.storage.local.get(null).then((result) => {
          var localStorageKeys = Object.keys(result);
          if (!localStorageKeys.includes(message.tabID)) {
            portFromView.postMessage({
              purpose: "playlist-tracking-status",
              trackingSatus: false,
            });
          }
          //console.log(allKeys);
        });
        if (chrome.storage.local.get([message.command])) {
          // chrome.storage.local.get([message.tabID]).then((result) => {
          //   console.log("Checking playlist tracking status.");
          //   let playlistTrackingObject = JSON.stringify(result);
          //   console.log("The list so far", playlistTrackingObject);
          // });
        } else {
          console.log("no");
        }
      }

      portFromView.postMessage({
        greeting: `In background script, received message from content script: ${message.command}`,
      });
    });
  }
  chrome.runtime.onConnect.addListener(connected);
})();
