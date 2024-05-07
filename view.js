import { getActiveTabURL } from "./utils.js";

/*(() => {
  const p = document.createElement("p");
  p.innerHTML = "placeholder text";
  document.querySelector("ext-root").appendChild(p);
})();*/

/*
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementsByClassName("container")[0];

  container.innerHTML =
    '<div class="title">This is not a youtube video page.</div>';
});*/

(async () => {
  const viewRoot = document.querySelector(".view-root");
  viewRoot.innerHTML =
    '<div class="title">lkThis is not a youtube video page.</div>';

  //const viewRoot = document.querySelector(".view-root");
  const currentTab = await getActiveTabURL();
})();
