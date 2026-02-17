(() => {
  "use strict";

  const isImageElement = (node) => node instanceof HTMLImageElement;

  const hasImageTarget = (target) => {
    if (!target || !(target instanceof Element)) return false;
    if (isImageElement(target)) return true;
    return !!target.closest("img");
  };

  const preventIfImage = (event) => {
    if (!hasImageTarget(event.target)) return;
    event.preventDefault();
  };

  const protectImageNode = (img) => {
    if (!isImageElement(img)) return;
    img.setAttribute("draggable", "false");
    img.style.webkitUserDrag = "none";
    img.style.userSelect = "none";
    img.style.webkitTouchCallout = "none";
  };

  const protectAllImages = () => {
    document.querySelectorAll("img").forEach(protectImageNode);
  };

  document.addEventListener("contextmenu", preventIfImage, true);
  document.addEventListener("dragstart", preventIfImage, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", protectAllImages, { once: true });
  } else {
    protectAllImages();
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (isImageElement(node)) {
          protectImageNode(node);
          continue;
        }
        node.querySelectorAll("img").forEach(protectImageNode);
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
