// Market Lab guide: highlights the step you're reading in the contents,
// filters the contents from the search box, and folds the contents away on
// phones.
(() => {
  const nav = document.querySelector("[data-docs-nav]");
  const search = document.querySelector("[data-docs-search]");
  const empty = document.querySelector("[data-docs-empty]");
  if (!nav) return;

  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const entries = links
    .map((link) => ({ link, section: document.getElementById(link.hash.slice(1)) }))
    .filter((entry) => entry.section);

  // Contents start open on wide screens and folded on phones.
  const narrow = window.matchMedia("(max-width: 820px)");
  const syncOpen = () => { nav.open = !narrow.matches; };
  syncOpen();
  narrow.addEventListener("change", syncOpen);
  nav.addEventListener("click", (event) => {
    if (narrow.matches && event.target.closest("a")) nav.open = false;
  });

  // The current step is the last one whose top has scrolled past the bar.
  const setCurrent = () => {
    const line = parseFloat(getComputedStyle(nav).top) || 120;
    let current = null;
    for (const entry of entries) {
      if (entry.section.getBoundingClientRect().top - line <= 40) current = entry;
    }
    for (const entry of entries) {
      if (entry === current) entry.link.setAttribute("aria-current", "true");
      else entry.link.removeAttribute("aria-current");
    }
    // Keep the highlighted link inside the sidebar's own scroll area.
    const link = current?.link;
    if (link && !narrow.matches) {
      const top = link.getBoundingClientRect().top - nav.getBoundingClientRect().top + nav.scrollTop;
      if (top < nav.scrollTop || top + link.offsetHeight > nav.scrollTop + nav.clientHeight) {
        nav.scrollTop = top - nav.clientHeight / 2;
      }
    }
  };
  window.addEventListener("scroll", setCurrent, { passive: true });
  setCurrent();

  if (!search) return;
  // Matches step titles and the words inside each step.
  const haystack = new Map(entries.map(({ link, section }) => [link, `${link.textContent} ${section.textContent}`.toLowerCase()]));
  search.addEventListener("input", () => {
    const query = search.value.trim().toLowerCase();
    let shown = 0;
    for (const { link } of entries) {
      const match = !query || haystack.get(link).includes(query);
      link.parentElement.hidden = !match;
      if (match) shown += 1;
    }
    // Hide a group heading when every link under it is hidden.
    for (const list of nav.querySelectorAll("ul:not(.docs-nav__pinned)")) {
      const visible = [...list.children].some((item) => !item.hidden);
      list.hidden = !visible;
      const heading = list.previousElementSibling;
      if (heading?.classList.contains("docs-nav__group")) heading.hidden = !visible;
    }
    if (empty) empty.hidden = shown > 0;
    if (query) nav.open = true;
  });
  search.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const first = entries.find(({ link }) => !link.parentElement.hidden);
    if (first) {
      event.preventDefault();
      first.section.scrollIntoView();
      history.replaceState(null, "", first.link.hash);
    }
  });
})();
