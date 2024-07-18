import { getActiveTabURL } from "./utils.js";

const viewRoot = document.querySelector(".view-root");
const currentTab = await getActiveTabURL();
const currentTabParameters = currentTab.url.split("?")[1];
const ytURLParameters = new URLSearchParams(currentTabParameters);
const ytListParameter = ytURLParameters.get("list");

const xhttp = new XMLHttpRequest();

const returnAPIKey = (responseText) => {
  //console.log("respoinse text: ", responseText);
  let config = JSON.parse(responseText);
  let API_KEY = config[0].YT_API_KEY;
  return API_KEY;
};

const getApiKey = () => {
  return new Promise((resolve) => {
    //let API_KEY;
    xhttp.open("GET", "config.json");

    xhttp.onload = () => {
      // console.log(xhttp.responseText.config);
      //console.log(xhttp.responseText);

      //let config = JSON.parse(xhttp.responseText);

      //returnAPIKey(xhttp.responseText);
      //API_KEY = xhttp.responseText;
      //console.log(API_KEY);
      //return API_KEY;
      resolve(xhttp.responseText);
    };

    xhttp.send();
  });
};

const requestPlaylistDetails = async () => {
  console.log(
    "API Key: ",
    getApiKey().then((result) => {
      console.log(result);
    })
  );
  // const videoSnippetRequest = await fetch(
  //   `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${ytListParameter}&key=${getApiKey()}`
  // );

  //return await videoSnippetRequest.json();
};

const getCurrentPlaylistThumbnail = () => {
  return requestPlaylistDetails().items[0].snippet.thumbnails.default.url;
};

const getCurrentPlaylistTitle = () => {
  return requestPlaylistDetails().items[0].snippet.title;
};

const getCurrentPlaylistDetails = () => {
  return {
    thumbnail: getCurrentPlaylistThumbnail(),
    title: getCurrentPlaylistTitle(),
  };
};

(async () => {
  //viewRoot.innerHTML = '<div class="title">lkThis is not a youtube video page.</div>';
  if (currentTab.url.includes("youtube.com/watch") && ytListParameter) {
    console.log("User is on a page with an active playlist.");

    //display current playlist
    console.log("thumbnail: ", getCurrentPlaylistDetails().thumbnail);
    console.log("thumbnail: ", getCurrentPlaylistDetails().title);
  } else if (currentTab.url.includes("youtube.com")) {
    console.log(
      "User is on a YouTube page, but not one with an active playlist on it."
    );

    // Create elements
    const not_a_yt_page_with_active_playlist_div =
      document.createElement("div");
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
  } else {
    console.log("User is not on a page that's displaying a YouTube Playlist");

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
  }
})();
