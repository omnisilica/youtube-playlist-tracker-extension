import { getActiveTabURL } from "./utils.js";

const viewRoot = document.querySelector(".view-root");
const currentTab = await getActiveTabURL();
const currentTabParameters = currentTab.url.split("?")[1];
const ytURLParameters = new URLSearchParams(currentTabParameters);
const ytListParameter = ytURLParameters.get("list");
const activeTab = await getActiveTabURL();
const activeTabID = activeTab.id;

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

const renderNoPlaylistFoundUI = () => {
  // Create elements
  const not_a_yt_page_with_active_playlist_div = document.createElement("div");
  const not_a_yt_page_with_active_playlist_paragraph =
    document.createElement("p");

  // Add classes
  not_a_yt_page_with_active_playlist_div.className =
    "no-active-playlist-container";

  // Add text
  not_a_yt_page_with_active_playlist_paragraph.innerHTML =
    "It looks like you're not on a YouTube page with an active playlist on it.";

  // Build Node structure (nest elements)
  not_a_yt_page_with_active_playlist_div.appendChild(
    not_a_yt_page_with_active_playlist_paragraph
  );

  viewRoot.replaceChildren(not_a_yt_page_with_active_playlist_div);
};

const getCurrentPlaylistDetails = async (api_key) => {
  const playlistSnippetRequest = await fetch(
    `https://youtube.googleapis.com/youtube/v3/playlists?part=snippet&id=${ytListParameter}&key=${api_key}`
  );

  const response = await playlistSnippetRequest.json();

  return response;
};

const renderPlaylistFoundUI = (playlistTitle, thumbnailURL, trackingStatus) => {
  // Create elements
  const playlistDetails_section = document.createElement("section");
  const playlistDetails_section_img = document.createElement("img");
  const playlistDetails_sectionTitle_div = document.createElement("div");
  const playlistDetails_sectionTitle_paragraph = document.createElement("p");
  const record_button = document.createElement("button");
  const playlistDetails_sectionRecordOptionDiv = document.createElement("div");
  const playlistDetails_sectionRecordParagraph = document.createElement("p");

  // Add attributes
  playlistDetails_section_img.src = thumbnailURL;
  playlistDetails_section_img.alt = `Thumbnail image for ${playlistTitle}`;
  playlistDetails_section_img.title = `Thumbnail image for ${playlistTitle}`;

  // Add classes
  playlistDetails_section.className = "playlist-details";
  playlistDetails_sectionTitle_div.className = "playlist-title";
  playlistDetails_sectionRecordOptionDiv.className = "record-playlist";
  record_button.classList.add("record-button");

  // Add text
  playlistDetails_sectionTitle_paragraph.innerHTML = playlistTitle;
  playlistDetails_sectionRecordParagraph.innerHTML = "Record";

  // Build Node structure (nest elements)
  record_button.appendChild(playlistDetails_sectionRecordParagraph);

  playlistDetails_sectionRecordOptionDiv.appendChild(record_button);

  playlistDetails_sectionTitle_div.appendChild(
    playlistDetails_sectionTitle_paragraph
  );

  playlistDetails_section.appendChild(playlistDetails_section_img);
  playlistDetails_section.appendChild(playlistDetails_sectionTitle_div);
  playlistDetails_section.appendChild(playlistDetails_sectionRecordOptionDiv);

  viewRoot.appendChild(playlistDetails_section);

  console.log("DOM title: ", title);
  console.log("DOM thumbnail: ", thumbnailURL);
  console.log("DOM status: ", trackingStatus);
};

const setPlaylistFoundUI = () => {
  getApiKey().then(async (result) => {
    let config = JSON.parse(result)[0];

    let playlistDetailsPromise = await getCurrentPlaylistDetails(
      config.YT_API_KEY
    );
    let playlistDetails = playlistDetailsPromise.items[0].snippet;

    let myPort = chrome.runtime.connect({
      name: "port-from-background-service",
    });

    await myPort.postMessage({
      command: "check-playlist-tracking-status",
      tabID: activeTabID,
    });

    myPort.onMessage.addListener((message) => {
      console.log("In view, received message from background script: ");
      if (
        message.purpose === "playlist-tracking-status" &&
        !message.trackingSatus
      ) {
        console.log(message);
        renderPlaylistFoundUI(
          playlistDetails.title,
          playlistDetails.thumbnails.default.url,
          false
        );
      }
    });

    console.log(playlistDetails.title);
    console.log(playlistDetails.thumbnails.default.url);
    console.log("The key: ", config.YT_API_KEY);
    console.log(getCurrentPlaylistDetails(config.YT_API_KEY));
  });
};

(async () => {
  if (currentTab.url.includes("youtube.com/watch") && ytListParameter) {
    console.log("User is on a page with an active playlist.");

    // Set and display current playlist
    setPlaylistFoundUI();
  } else if (currentTab.url.includes("youtube.com")) {
    console.log(
      "User is on a YouTube page, but not one with an active playlist on it."
    );

    renderNoPlaylistFoundUI();
  } else {
    console.log("User is not on a page that's displaying a YouTube Playlist");

    renderNotOnYouTubePageUI();
  }
})();
