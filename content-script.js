(() => {
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
