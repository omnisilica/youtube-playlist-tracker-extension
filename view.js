import { getActiveTabURL } from "./utils.js";

const viewRoot = document.querySelector(".view-root");
const xhttp = new XMLHttpRequest();

const chromeTabsCommunicationPort = chrome.runtime.connect({
  name: "port-from-background-service",
});

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
  const ytURLParameters = await getYTUrlParameters();
  const ytListParameter = ytURLParameters.get("list");

  return ytListParameter;
};

const getYTVideoParameter = async () => {
  const ytURLParameters = await getYTUrlParameters();
  const ytVideoParameter = ytURLParameters.get("v");
  console.log(ytVideoParameter);

  return ytVideoParameter;
};

const renderNotTargetPalylistUI = async (tracking) => {
  // Create elements
  const not_target_playlist_div = document.createElement("div");
  const not_target_playlist_div_paragraph = document.createElement("p");

  // Add classes
  not_target_playlist_div.className = "not-target-playlist-container";

  // Add text
  not_target_playlist_div_paragraph.innerHTML =
    "You're already tracking another playlist.";

  // Build Node structure (nest elements)
  not_target_playlist_div.appendChild(not_target_playlist_div_paragraph);

  viewRoot.replaceChildren(not_target_playlist_div);
};

const playlistExists = async () => {
  let ytPlaylistExists = false;
  const ytListParameter = await getYTListParameter();

  if (ytListParameter !== null) {
    ytPlaylistExists = true;
  }

  return ytPlaylistExists;
};

const videoExists = async () => {
  let ytVideoExists = false;
  const ytVideoParameter = await getYTVideoParameter();

  if (ytVideoParameter !== null) {
    ytVideoExists = true;
  }

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
  const recordOption_divContainer = document.createElement("div");

  // Add classes
  recordOption_divContainer.classList.add("record-options-container");

  viewRoot.appendChild(recordOption_divContainer);
};

const addTrackedVideosToList = async (trackedVideos) => {
  const configDetails = await getApiKey();
  const config = JSON.parse(configDetails);
  const api_key = config[0].YT_API_KEY;

  // let listOfVidoesFile;
  // const videosToDownload = trackedVideos;
  // const stopRecordingButton = document.querySelector(".stop-recording-button");

  // let videoTitle;
  let trackedVideoTitles = [];

  for (let videoCount = 0; videoCount < trackedVideos.length; videoCount++) {
    const video_id = trackedVideos[videoCount].videoID;
    const videoSnippetResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${video_id}&key=${api_key}`
    );
    const videoDetails = await videoSnippetResponse.json();
    const videoTitle = videoDetails.items[0].snippet.title;
    // const videoThumnailURL = videoDetails.items[0].snippet.thumbnails.default.url;

    // videoTitle = videoDetails.items[0].snippet.title;
    trackedVideoTitles.push(videoTitle);
    // trackedVideoTitles.push("\n");
  }

  trackedVideoTitles = trackedVideoTitles.join("\n");

  console.log(trackedVideoTitles);

  return trackedVideoTitles;
};

const generateTextFile = async (trackedVideos) => {
  const trackedVideoTitles = await addTrackedVideosToList(trackedVideos);
  console.log(trackedVideoTitles);
  let listOfVidoesFile;
  let fileData = new Blob([trackedVideoTitles], { type: "text/plain" });

  if (listOfVidoesFile !== null) {
    window.URL.revokeObjectURL(listOfVidoesFile);
  }

  listOfVidoesFile = window.URL.createObjectURL(fileData);

  return listOfVidoesFile;
};

const createLinkForDownload = async (trackedVideos) => {
  // Create Element
  const downloadLink_a = document.createElement("a");

  // Add class
  downloadLink_a.classList.add(".download-link");

  // Add attribute
  downloadLink_a.download = "tracked-videos.txt";
  downloadLink_a.href = await generateTextFile(trackedVideos);

  // Add style
  // downloadLink_a.style.display = "block";

  // Build Node structure (nest elements)
  // viewRoot.appendChild(downloadLink_a);

  downloadLink_a.click();
};

const downloadListEventHandler = async () => {
  const activeTabID = await getActiveTabID();
  const ytListParameter = await getYTListParameter();

  console.log("downloadListEventHandler()");

  await chromeTabsCommunicationPort.postMessage({
    command: "retrieve-tracked-videos",
    tabID: activeTabID,
    playlistID: ytListParameter,
  });

  chromeTabsCommunicationPort.onMessage.addListener((message) => {
    console.log(message);
    if (message.purpose === "tracked-videos") {
      console.log("Works");
      // console.log(message.videos);
      createLinkForDownload(message.videos);
    }
  });
};

const renderDownloadUI = () => {
  // Create elements
  const recordOption_divContainer = document.querySelector(
    ".record-options-container"
  );
  const viewAll_button = document.createElement("button");
  const download_button = document.createElement("button");

  // Add classes
  viewAll_button.classList.add("view-all-button");
  download_button.classList.add("download-button");

  // Add text
  viewAll_button.innerHTML = "View All";
  download_button.innerHTML = "Download";

  // Build Node structure (nest elements)
  recordOption_divContainer.replaceChildren(viewAll_button, download_button);

  viewAll_button.addEventListener("click", viewAllEventHandler);
  download_button.addEventListener("click", downloadListEventHandler);
};

// const stopTrackingPlaylist = () => {
//   renderDownloadUI();
// };

const stopTrackingEventHandler = async () => {
  const activeTabID = await getActiveTabID();
  const ytListParameter = await getYTListParameter();

  // renderDownloadUI();

  await chromeTabsCommunicationPort.postMessage({
    command: "stop-tracking-playlist",
    tabID: activeTabID,
    playlistID: ytListParameter,
  });
};

const renderTrackedVideos = async (trackedVideos) => {
  console.log(trackedVideos);
  console.log(trackedVideos[0]);
  // Get video details
  const configDetails = await getApiKey();
  const config = JSON.parse(configDetails);
  const api_key = config[0].YT_API_KEY;
  const viewAll_button = document.querySelector(".view-all-button");

  console.log(configDetails);
  console.log(config);
  console.log(api_key);
  // const videoSnippetRequest

  // Create elements
  const trackedVideos_div = document.createElement("div");

  // Add attributes

  // Add classes
  trackedVideos_div.classList.add("list-videos");

  // Add text

  // Build Node structure (nest elements)

  // loop through trackedVideos
  for (let videoCount = 0; videoCount < trackedVideos.length; videoCount++) {
    // Get video details
    const video_id = trackedVideos[videoCount].videoID;
    console.log(video_id);
    const videoSnippetResponse = await fetch(
      `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${video_id}&key=${api_key}`
    );
    const videoDetails = await videoSnippetResponse.json();
    const videoTitle = videoDetails.items[0].snippet.title;
    const videoThumnailURL =
      videoDetails.items[0].snippet.thumbnails.default.url;
    console.log(video_id);
    console.log(videoTitle);
    console.log(videoThumnailURL);

    // Create elements
    const videoItem_div = document.createElement("div");
    const videoItem_img = document.createElement("img");
    const videoItem_paragraph = document.createElement("p");

    // Add attributes
    videoItem_img.src = videoThumnailURL;
    videoItem_img.alt = `Thumbnail image for ${videoTitle}`;
    videoItem_img.title = `Thumbnail image for ${videoTitle}`;

    // Add classes
    videoItem_div.classList.add("video-item-container");
    videoItem_img.classList.add("current-video-item-img");
    videoItem_paragraph.classList.add("current-video-title");

    // Add text
    videoItem_paragraph.innerText = videoTitle;

    // Build node structure (nest elements)
    videoItem_div.appendChild(videoItem_img);
    videoItem_div.appendChild(videoItem_paragraph);
    trackedVideos_div.appendChild(videoItem_div);
  }

  viewAll_button.disabled = true;
  viewRoot.appendChild(trackedVideos_div);
};

const viewAllEventHandler = async () => {
  const activeTabID = await getActiveTabID();
  const ytListParameter = await getYTListParameter();

  await chromeTabsCommunicationPort.postMessage({
    command: "retrieve-tracked-videos",
    tabID: activeTabID,
    playlistID: ytListParameter,
  });

  chromeTabsCommunicationPort.onMessage.addListener((message) => {
    if (message.purpose === "tracked-videos") {
      console.log("Works");
      // console.log(message.videos);
      renderTrackedVideos(message.videos);
    }
  });
};

const renderTrackingInProgressUI = () => {
  console.log("Render Tracking");
  // Create elements
  const recordOption_divContainer = document.querySelector(
    ".record-options-container"
  );
  const viewAll_button = document.createElement("button");
  const stopRecording_button = document.createElement("button");

  // Add classes
  viewAll_button.classList.add("view-all-button");
  stopRecording_button.classList.add("stop-recording-button");

  // Add text
  viewAll_button.innerHTML = "View All";
  stopRecording_button.innerHTML = "Stop Recording";

  // Build Node structure (nest elements)
  recordOption_divContainer.replaceChildren(
    viewAll_button,
    stopRecording_button
  );

  viewAll_button.addEventListener("click", viewAllEventHandler);
  stopRecording_button.addEventListener("click", stopTrackingEventHandler);
};

const startTrackingEventHandler = async () => {
  const activeTab = await getCurrentTab();
  const activeTabID = await getActiveTabID();
  const ytListParameter = await getYTListParameter();

  renderTrackingInProgressUI();

  await chromeTabsCommunicationPort.postMessage({
    command: "start-tracking-playlist",
    tab: activeTab,
    // tabID: activeTabID,
    playlistID: ytListParameter,
  });
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

    let playlistDetails = playlistDetailsPromise.items[0].snippet;

    renderPlaylistDetailsUI(
      playlistDetails.title,
      playlistDetails.thumbnails.default.url,
      false
    );
  });
};

const renderStopTrackingUI = (playlistTitle, thumbnailURL, tracking) => {
  const playlistDetails = document.querySelector(".playlist-details");
  console.log(playlistDetails);

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

  viewRoot.replaceChildren(playlistDetails_section);

  renderRecordOptionsNode();
  renderDownloadUI();
};

const setStopTrackingUI = () => {
  getApiKey().then(async (result) => {
    const activeTabID = await getActiveTabID();
    let config = JSON.parse(result)[0];

    let playlistDetailsPromise = await getCurrentPlaylistDetails(
      config.YT_API_KEY
    );
    console.log(playlistDetailsPromise);
    let playlistDetails = playlistDetailsPromise.items[0].snippet;

    renderStopTrackingUI(
      playlistDetails.title,
      playlistDetails.thumbnails.default.url,
      false
    );
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
      console.log("Terminate Status", message.terminate);
      console.log("Tab ID", activeTabID);
      console.log(message.initialize);

      if (
        !message.tracking &&
        message.terminate &&
        activePlaylist === message.playlistID
      ) {
        console.log("First if");
        setStopTrackingUI();
      } else if (
        message.tracking &&
        !message.initialize &&
        activePlaylist !== message.playlistID
      ) {
        console.log("Second if");
        console.log(message.playlistID);
        renderNotTargetPalylistUI(message.tracking);
      } else if (message.tracking && !message.initialize) {
        console.log("Third if");
        renderPlaylistFoundUI();
      } else if (!message.tracking && !message.initialize) {
        console.log("Fourth if");
        setPlaylistFoundUI();
      }
    });
  } else if (
    (video_exists && !playlist_exists) ||
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
