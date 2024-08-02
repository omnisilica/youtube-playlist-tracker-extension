import { getActiveTabURL } from "./utils.js";

const viewRoot = document.querySelector(".view-root");
// const currentTab = await getActiveTabURL();
// const currentTabParameters = currentTab.url.split("?")[1];
// const ytURLParameters = new URLSearchParams(currentTabParameters);
// const ytListParameter = ytURLParameters.get("list");
//const activeTab = await getActiveTabURL();
// const activeTabID = currentTab.id;
const chromeTabsCommunicationPort = chrome.runtime.connect({
  name: "port-from-background-service",
});
const xhttp = new XMLHttpRequest();

const getApiKey = () => {
  return new Promise((resolve) => {
    xhttp.open("GET", "config.json");

    xhttp.onload = () => {
      resolve(xhttp.responseText);
    };

    xhttp.send();
  });
};

const getCurrentTab = async () => {
  return await getActiveTabURL();
};

const getYTUrlParameters = async () => {
  const currentTab = await getCurrentTab();
  const currentTabParameters = currentTab.url.split("?")[1];
  const ytURLParameters = new URLSearchParams(currentTabParameters);

  return ytURLParameters;
};

const getYTListParameter = async () => {
  // const currentTab = await getCurrentTab();
  // const currentTabParameters = currentTab.url.split("?")[1];
  // const ytURLParameters = new URLSearchParams(currentTabParameters);
  const ytURLParameters = await getYTUrlParameters();
  const ytListParameter = ytURLParameters.get("list");

  return ytListParameter;
};

const getYTVideoParameter = async () => {
  // const currentTab = await getCurrentTab();
  // const currentTabParameters = currentTab.url.split("?")[1];
  // const ytURLParameters = new URLSearchParams(currentTabParameters);
  const ytURLParameters = await getYTUrlParameters();
  const ytVideoParameter = ytURLParameters.get("v");
  console.log(ytVideoParameter);

  return ytVideoParameter;
};

const renderNotTargetPalylistUI = async (tracking) => {
  // Create elements
  const not_target_playlist_div = document.createElement("div");
  const not_target_playlist_div_paragraph = document.createElement("p");
  // const go_to_target_playlist_anchor = document.createElement("a");

  // Build YouTube target playlist link
  // const firstVideo = await getYTVideoParameter();
  // const targetPlaylist = await getYTListParameter();

  // const target_playlist_href = "https://www.youtube.com/" + "?v=" + firstVideo + "&list=" + targetPlaylist;

  // Add attributes
  // go_to_target_playlist_anchor.href = target_playlist_href;
  // go_to_target_playlist_anchor.title =
  ("Click to navigate to the YouTube playlist you're tracking.");

  // Add classes
  not_target_playlist_div.className = "not-target-playlist-container";

  // Add text
  not_target_playlist_div_paragraph.innerHTML =
    "You're already tracking another playlist.";
  // go_to_target_playlist_anchor.innerHTML = "Go to playlist";

  // Add text with condition
  /*if (video_exists) {
    not_a_yt_page_with_active_playlist_paragraph.innerHTML =
      "It looks like you're not on a YouTube page with an active playlist on it.";
  } else {
    not_a_yt_page_with_active_playlist_paragraph.innerHTML =
      "It looks like you're not on a YouTube page with an active playlist on it. This chrome extension doesn't work with picture in picture mode.";
  }*/
  /*if (tracking && !video_exists) {
    not_a_yt_page_with_active_playlist_paragraph.innerHTML =
      "It looks like you're not on a YouTube page with an active playlist on it. This chrome extension doesn't work with picture in picture mode.";
    // Offer to go to the target playlist
  } else if (tracking) {
    not_a_yt_page_with_active_playlist_paragraph.innerHTML =
      "It looks like you're not on a YouTube page with an active playlist on it.";
    // Offer to go to the playlist that's being tracked
  } else {
    not_a_yt_page_with_active_playlist_paragraph.innerHTML =
      "It looks like you're not on a YouTube page with an active playlist on it.";
  }*/

  // Build Node structure (nest elements)
  not_target_playlist_div.appendChild(not_target_playlist_div_paragraph);

  viewRoot.replaceChildren(not_target_playlist_div);
};

const playlistExists = async () => {
  let ytPlaylistExists = false;
  // const currentTab = await getCurrentTab();
  // const currentTabParameters = currentTab.url.split("?")[1];
  // const ytURLParameters = new URLSearchParams(currentTabParameters);
  //console.log(ytURLParameters.get("list"));
  const ytListParameter = await getYTListParameter();
  if (ytListParameter !== null) {
    ytPlaylistExists = true;
  }
  console.log(ytPlaylistExists);
  console.log(ytListParameter);
  return ytPlaylistExists;
};

const videoExists = async () => {
  let ytVideoExists = false;
  const ytVideoParameter = await getYTVideoParameter();

  if (ytVideoParameter !== null) {
    ytVideoExists = true;
  }
  console.log(ytVideoExists);
  console.log(ytVideoParameter);
  return ytVideoExists;
};

const getActiveTabID = async () => {
  const currentTab = await getCurrentTab();
  return currentTab.id;
};

const getCurrentPlaylistDetails = async (api_key) => {
  const ytListParameter = await getYTListParameter();
  const playlistSnippetRequest = await fetch(
    `https://youtube.googleapis.com/youtube/v3/playlists?part=snippet&id=${ytListParameter}&key=${api_key}`
  );

  const response = await playlistSnippetRequest.json();

  return response;
};

const renderRecordOptionsNode = () => {
  // Create elements
  // const recordOption_divContainer = document.createElement("div");
  const recordOption_divContainer = document.createElement("div");

  // Add classes
  recordOption_divContainer.classList.add("record-options-container");

  viewRoot.appendChild(recordOption_divContainer);
};

const renderTrackingInProgressUI = () => {
  console.log("Render Tracking");
  // Create elements
  // const playlistDetails_section_div = document.querySelector(".record-playlist");
  const recordOption_divContainer = document.querySelector(
    ".record-options-container"
  );
  const viewAll_button = document.createElement("button");
  const stopRecording_button = document.createElement("button");

  // Add classes
  // playlistDetails_section_div.classList.add("recording-options");
  viewAll_button.classList.add("view-all-button");
  stopRecording_button.classList.add("stop-recording-button");

  // Add text
  viewAll_button.innerHTML = "View All";
  stopRecording_button.innerHTML = "Stop Recording";

  // Build Node structure (nest elements)
  // playlistDetails_section_div.replaceChildren(viewAll_button, stopRecording_button);
  console.log(recordOption_divContainer);
  console.log(viewAll_button);
  console.log(stopRecording_button);
  recordOption_divContainer.replaceChildren(
    viewAll_button,
    stopRecording_button
  );
};

const startTrackingEventHandler = async () => {
  const activeTabID = await getActiveTabID();
  const ytListParameter = await getYTListParameter();

  renderTrackingInProgressUI();

  await chromeTabsCommunicationPort.postMessage({
    command: "start-tracking-playlist",
    tabID: activeTabID,
    playlistID: ytListParameter,
  });

  // chromeTabsCommunicationPort.onMessage.addListener((message) => {
  //   if (message.purpose === "playlist-tracking-status" && message.tracking) {
  //     renderTrackingInProgressUI();
  //   }
  // });
};

const renderNotOnYouTubePageUI = () => {
  // Create elements
  const not_a_yt_page_div = document.createElement("div");
  const ytLinkAnchor = document.createElement("a");
  const ytAnchorText = document.createTextNode("Go to YouTube");

  // Add attributes
  ytLinkAnchor.href = "https://www.youtube.com/";
  ytLinkAnchor.title = "Click to navigate to YouTube.";
  ytLinkAnchor.target = "_blank";

  // Add classes
  not_a_yt_page_div.className = "not-yt-page";

  // Add text
  not_a_yt_page_div.innerHTML =
    "<p>It looks like you're not on a YouTube page.<p/>";

  // Build Node structure (nest elements)
  ytLinkAnchor.appendChild(ytAnchorText);
  not_a_yt_page_div.appendChild(ytLinkAnchor);
  viewRoot.appendChild(not_a_yt_page_div);
};

const renderNoPlaylistFoundUI = async () => {
  const video_exists = await videoExists();
  const activeTabID = await getActiveTabID();

  // Create elements
  const not_a_yt_page_with_active_playlist_div = document.createElement("div");
  const not_a_yt_page_with_active_playlist_paragraph =
    document.createElement("p");

  // Add classes
  not_a_yt_page_with_active_playlist_div.className =
    "no-active-playlist-container";

  await chromeTabsCommunicationPort.postMessage({
    command: "check-playlist-tracking-status",
    tabID: activeTabID,
  });

  chromeTabsCommunicationPort.onMessage.addListener(async (message) => {
    if (message.tracking && !video_exists) {
      console.log(message.tracking);
      not_a_yt_page_with_active_playlist_paragraph.innerHTML =
        "It looks like you're not on a YouTube page with an active playlist on it. This chrome extension doesn't work with picture in picture mode.";
    } else {
      not_a_yt_page_with_active_playlist_paragraph.innerHTML =
        "It looks like you're not on a YouTube page with an active playlist on it.";
    }
  });

  // Build Node structure (nest elements)
  not_a_yt_page_with_active_playlist_div.appendChild(
    not_a_yt_page_with_active_playlist_paragraph
  );

  viewRoot.replaceChildren(not_a_yt_page_with_active_playlist_div);
};

const renderRecordPlaylistUI = () => {
  renderRecordOptionsNode();

  // Create elements
  const playlistDetails_sectionRecordOption_div = document.createElement("div");
  const record_button = document.createElement("button");
  const playlistDetails_sectionRecord_paragraph = document.createElement("p");

  // Add classes
  record_button.classList.add("record-button");
  playlistDetails_sectionRecordOption_div.className = "record-playlist";

  //Add text
  playlistDetails_sectionRecord_paragraph.innerHTML = "Record";

  // Build Node structure (nest elements)
  record_button.appendChild(playlistDetails_sectionRecord_paragraph);
  playlistDetails_sectionRecordOption_div.appendChild(record_button);

  // Select Node where child node will be rendered
  const recordOption_divContainer = document.querySelector(
    ".record-options-container"
  );

  // Render
  recordOption_divContainer.appendChild(
    playlistDetails_sectionRecordOption_div
  );

  record_button.addEventListener("click", startTrackingEventHandler);
};

const renderPlaylistDetailsUI = (playlistTitle, thumbnailURL, tracking) => {
  // Create elements
  const playlistDetails_section = document.createElement("section");
  const playlistDetails_section_img = document.createElement("img");
  const playlistDetails_sectionTitle_div = document.createElement("div");
  const playlistDetails_sectionTitle_paragraph = document.createElement("p");

  // Add attributes
  playlistDetails_section_img.src = thumbnailURL;
  playlistDetails_section_img.alt = `Thumbnail image for ${playlistTitle}`;
  playlistDetails_section_img.title = `Thumbnail image for ${playlistTitle}`;

  // Add classes
  playlistDetails_section.className = "playlist-details";
  playlistDetails_sectionTitle_div.className = "playlist-title";

  // Add text
  playlistDetails_sectionTitle_paragraph.innerHTML = playlistTitle;

  // Build Node structure (nest elements)
  playlistDetails_sectionTitle_div.appendChild(
    playlistDetails_sectionTitle_paragraph
  );

  playlistDetails_section.appendChild(playlistDetails_section_img);
  playlistDetails_section.appendChild(playlistDetails_sectionTitle_div);
  // playlistDetails_section.appendChild(playlistDetails_sectionRecordOption_div);

  viewRoot.appendChild(playlistDetails_section);

  renderRecordPlaylistUI();
};

const setPlaylistFoundUI = () => {
  getApiKey().then(async (result) => {
    const activeTabID = await getActiveTabID();
    let config = JSON.parse(result)[0];

    let playlistDetailsPromise = await getCurrentPlaylistDetails(
      config.YT_API_KEY
    );
    console.log(playlistDetailsPromise);
    let playlistDetails = playlistDetailsPromise.items[0].snippet;

    // await chromeTabsCommunicationPort.postMessage({
    //   command: "check-playlist-tracking-status",
    //   tabID: activeTabID,
    // });

    // chromeTabsCommunicationPort.onMessage.addListener((message) => {
    //   if (message.purpose === "playlist-tracking-status" && message.tracking) {
    //     renderTrackingInProgressUI();
    //   } else if (
    //     message.purpose === "playlist-tracking-status" &&
    //     !message.tracking
    //   ) {
    //     renderPlaylistDetailsUI(
    //       playlistDetails.title,
    //       playlistDetails.thumbnails.default.url,
    //       false
    //     );
    //   }
    // });

    renderPlaylistDetailsUI(
      playlistDetails.title,
      playlistDetails.thumbnails.default.url,
      false
    );

    // await chromeTabsCommunicationPort.postMessage({
    //   command: "check-playlist-tracking-status",
    //   tabID: getActiveTabID(),
    // });

    // chromeTabsCommunicationPort.onMessage.addListener((message) => {
    //   console.log("In view, received message from background script: ");
    //   if (message.purpose === "playlist-tracking-status" && !message.tracking) {
    //     console.log(message);
    //     renderPlaylistDetailsUI(
    //       playlistDetails.title,
    //       playlistDetails.thumbnails.default.url,
    //       false
    //     );
    //   }
    // });

    /*console.log(playlistDetails.title);
    console.log(playlistDetails.thumbnails.default.url);
    console.log("The key: ", config.YT_API_KEY);
    console.log(getCurrentPlaylistDetails(config.YT_API_KEY));*/
  });
};

const setTrackingInProgressUI = (playlistTitle, thumbnailURL, tracking) => {
  // Create elements
  const playlistDetails_section = document.createElement("section");
  const playlistDetails_section_img = document.createElement("img");
  const playlistDetails_sectionTitle_div = document.createElement("div");
  const playlistDetails_sectionTitle_paragraph = document.createElement("p");

  // Add attributes
  playlistDetails_section_img.src = thumbnailURL;
  playlistDetails_section_img.alt = `Thumbnail image for ${playlistTitle}`;
  playlistDetails_section_img.title = `Thumbnail image for ${playlistTitle}`;

  // Add classes
  playlistDetails_section.className = "playlist-details";
  playlistDetails_sectionTitle_div.className = "playlist-title";

  // Add text
  playlistDetails_sectionTitle_paragraph.innerHTML = playlistTitle;

  // Build Node structure (nest elements)
  playlistDetails_sectionTitle_div.appendChild(
    playlistDetails_sectionTitle_paragraph
  );

  playlistDetails_section.appendChild(playlistDetails_section_img);
  playlistDetails_section.appendChild(playlistDetails_sectionTitle_div);
  // playlistDetails_section.appendChild(playlistDetails_sectionRecordOption_div);

  viewRoot.appendChild(playlistDetails_section);

  // if (!tracking) {
  //   renderRecordPlaylistUI();
  // } else {
  //   renderTrackingInProgressUI();
  // }
  renderRecordOptionsNode();
  renderTrackingInProgressUI();
};

const renderPlaylistFoundUI = () => {
  getApiKey().then(async (result) => {
    const activeTabID = await getActiveTabID();
    let config = JSON.parse(result)[0];

    let playlistDetailsPromise = await getCurrentPlaylistDetails(
      config.YT_API_KEY
    );
    console.log(playlistDetailsPromise);
    let playlistDetails = playlistDetailsPromise.items[0].snippet;

    setTrackingInProgressUI(
      playlistDetails.title,
      playlistDetails.thumbnails.default.url,
      false
    );
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOMContent");
  const currentTab = await getCurrentTab();
  const playlist_exists = await playlistExists();
  const video_exists = await videoExists();

  if (currentTab.url.includes("youtube.com/watch") && playlist_exists) {
    console.log("User is on a page with an active playlist.");

    // Set and display current playlist
    const activeTabID = await getActiveTabID();
    const activePlaylist = await getYTListParameter();

    await chromeTabsCommunicationPort.postMessage({
      command: "check-playlist-tracking-status",
      tabID: activeTabID,
    });

    chromeTabsCommunicationPort.onMessage.addListener(async (message) => {
      console.log("Tracking Status", message.tracking);
      console.log("Tab ID", activeTabID);
      console.log(message.initialize);

      if (
        message.tracking &&
        !message.initialize &&
        activePlaylist !== message.playlistID
      ) {
        console.log(message.playlistID);
        renderNotTargetPalylistUI(message.tracking);
      } else if (message.tracking && !message.initialize) {
        renderPlaylistFoundUI();
      } /*else if (
        message.tracking &&
        message.initialize &&
        message.playlistID === activePlaylist
      ) {
        console.log(message.playlistID);
        renderTrackingInProgressUI();
      }*/ else if (!message.tracking && !message.initialize) {
        setPlaylistFoundUI();
        // } else if (
        //   !message.initialize &&
        //   // message.purpose === "playlist-tracking-status" &&
        //   !message.tracking
        // ) {
        //   renderPlaylistFoundUI();
        // }
        // else if (
        //   // message.purpose === "playlist-tracking-status" &&
        //   message.tracking &&
        //   message.initialize
        // ) {
        //   // if (message.purpose === "playlist-tracking-status" && true) {
        //   console.log("Tracking", message.tracking);
        //   renderPlaylistFoundUI();
        //   //setPlaylistFoundUI();
        //   //renderTrackingInProgressUI();
        // }
      }
    });
  } else if (
    /*currentTab.url.includes("youtube.com/watch") &&*/
    (video_exists && !playlist_exists) ||
    // (currentTab.url.includes("youtube.com") && playlist_exists) ||
    currentTab.url.includes("youtube.com")
  ) {
    console.log(
      "User is on a YouTube page, but not one with an active playlist on it."
    );

    renderNoPlaylistFoundUI();
  } else {
    console.log("User is not on a page that's displaying a YouTube Playlist");

    renderNotOnYouTubePageUI();
  }
});

// (async () => {
//   if (currentTab.url.includes("youtube.com/watch") && getYTListParameter()) {
//     console.log("User is on a page with an active playlist.");

//     // Set and display current playlist

//     await chromeTabsCommunicationPort.postMessage({
//       command: "check-playlist-tracking-status",
//       tabID: getActiveTabID(),
//     });

//     chromeTabsCommunicationPort.onMessage.addListener((message) => {
//       if (message.purpose === "playlist-tracking-status" && message.tracking) {
//         console.log(message.tracking);
//         renderTrackingInProgressUI();
//       } else if (
//         message.purpose === "playlist-tracking-status" &&
//         !message.tracking
//       ) {
//         console.log(message.tracking);
//         setPlaylistFoundUI();
//       }
//     });
//   } else if (currentTab.url.includes("youtube.com")) {
//     console.log(
//       "User is on a YouTube page, but not one with an active playlist on it."
//     );

//     renderNoPlaylistFoundUI();
//   } else {
//     console.log("User is not on a page that's displaying a YouTube Playlist");

//     renderNotOnYouTubePageUI();
//   }
// })();
