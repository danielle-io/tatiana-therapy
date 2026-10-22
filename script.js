document.documentElement.classList.add("js");

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#main-nav");
const mobileViewport = window.matchMedia("(max-width: 820px)");

function setMenuOpen(open, returnFocus = false) {
  menuButton.setAttribute("aria-expanded", String(open));
  navigation.classList.toggle("is-open", open);
  if (returnFocus) menuButton.focus();
}

menuButton.hidden = false;
menuButton.addEventListener("click", () => {
  setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
});

navigation.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link || !mobileViewport.matches) return;
  setMenuOpen(false);
  const target = document.querySelector(link.hash);
  if (target) {
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false, true);
  }
});

document.addEventListener("click", (event) => {
  if (mobileViewport.matches && !event.target.closest(".site-header")) setMenuOpen(false);
});

mobileViewport.addEventListener("change", () => setMenuOpen(false));
