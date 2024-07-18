(() => {
  let portFromContentScript;
  const connected = (port) => {
    console.assert(port.name === "port-from-content-script");
    portFromContentScript = port;
    portFromContentScript.postMessage({ greeting: "hi there content script!" });
    portFromContentScript.onMessage.addListener((message) => {
      portFromContentScript.postMessage({
        greeting: `In background script, received message from content script: ${message.greeting}`,
      });
    });
  };

  chrome.runtime.onConnect.addListener(connected);

  /*chrome.browserAction.onClicked.addListener(() => {
    portFromContentScript.postMessage({ greeting: "they clicked the button!" });
  });*/
})();
