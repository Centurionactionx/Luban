(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const menuToggle = document.querySelector("[data-menu-toggle]");
  const primaryNav = document.querySelector("[data-primary-nav]");
  const searchToggle = document.querySelector("[data-search-toggle]");
  const searchPanel = document.querySelector("[data-search-panel]");
  const searchForm = document.getElementById("site-search-form");
  const searchInput = document.getElementById("site-search-input");
  const searchClear = document.querySelector("[data-search-clear]");
  const searchStatus = document.querySelector("[data-search-status]");

  const setMenuOpen = (open, restoreFocus = false) => {
    if (!menuToggle || !primaryNav) return;
    menuToggle.setAttribute("aria-expanded", String(open));
    primaryNav.dataset.open = String(open);

    if (open) {
      window.requestAnimationFrame(() => primaryNav.querySelector("a")?.focus());
    } else if (restoreFocus) {
      menuToggle.focus();
    }
  };

  const setSearchOpen = (open, restoreFocus = false) => {
    if (!searchToggle || !searchPanel) return;
    searchToggle.setAttribute("aria-expanded", String(open));
    searchPanel.hidden = !open;

    if (open) {
      setMenuOpen(false);
      window.requestAnimationFrame(() => searchInput?.focus());
    } else if (restoreFocus) {
      searchToggle.focus();
    }
  };

  menuToggle?.addEventListener("click", () => {
    const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
    if (willOpen) setSearchOpen(false);
    setMenuOpen(willOpen);
  });

  primaryNav?.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });

  searchToggle?.addEventListener("click", () => {
    const willOpen = searchToggle.getAttribute("aria-expanded") !== "true";
    setSearchOpen(willOpen);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (searchToggle?.getAttribute("aria-expanded") === "true") {
      setSearchOpen(false, true);
      return;
    }

    if (menuToggle?.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false, true);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 880) setMenuOpen(false);
  });

  const posterWall = document.querySelector("[data-poster-wall]");
  const posters = Array.from(document.querySelectorAll("[data-poster]"));

  const activatePoster = (selected) => {
    posters.forEach((poster) => {
      poster.dataset.active = String(poster === selected);
    });
  };

  posters.forEach((poster) => {
    poster.addEventListener("pointerenter", () => activatePoster(poster));
    poster.addEventListener("pointerdown", () => activatePoster(poster));
    poster.addEventListener("focusin", () => activatePoster(poster));
  });

  posterWall?.addEventListener("pointerleave", () => {
    const focusedPoster = document.activeElement?.closest?.("[data-poster]");
    activatePoster(focusedPoster || posters[0]);
  });

  posterWall?.addEventListener("focusout", () => {
    window.requestAnimationFrame(() => {
      const focusedPoster = document.activeElement?.closest?.("[data-poster]");
      activatePoster(focusedPoster || posters[0]);
    });
  });

  let previousSearchTarget = null;

  const clearSearchMarks = () => {
    document.querySelectorAll("mark.search-highlight").forEach((mark) => {
      const parent = mark.parentNode;
      mark.replaceWith(document.createTextNode(mark.textContent || ""));
      parent?.normalize();
    });

    if (previousSearchTarget) {
      previousSearchTarget.removeAttribute("tabindex");
      previousSearchTarget = null;
    }
  };

  const highlightTextNodes = (root, query) => {
    const nodes = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || !node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
        if (parent.closest("script, style, svg, mark, input, textarea, button, .visually-hidden")) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    while (walker.nextNode()) nodes.push(walker.currentNode);

    let matches = 0;
    let firstMark = null;
    const needle = query.toLocaleLowerCase();

    nodes.forEach((node) => {
      const source = node.nodeValue || "";
      const sourceLower = source.toLocaleLowerCase();
      let cursor = 0;
      let index = sourceLower.indexOf(needle, cursor);
      if (index === -1) return;

      const fragment = document.createDocumentFragment();

      while (index !== -1) {
        fragment.append(document.createTextNode(source.slice(cursor, index)));

        const mark = document.createElement("mark");
        mark.className = "search-highlight";
        mark.textContent = source.slice(index, index + query.length);
        fragment.append(mark);

        firstMark ||= mark;
        matches += 1;
        cursor = index + query.length;
        index = sourceLower.indexOf(needle, cursor);
      }

      fragment.append(document.createTextNode(source.slice(cursor)));
      node.replaceWith(fragment);
    });

    return { matches, firstMark };
  };

  searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    clearSearchMarks();

    const query = searchInput.value.trim();
    if (!query) {
      searchStatus.textContent = "Type a word or phrase to search this page.";
      searchInput.focus();
      return;
    }

    let count = 0;
    let firstMatch = null;

    document.querySelectorAll("main [data-searchable]").forEach((root) => {
      const result = highlightTextNodes(root, query);
      count += result.matches;
      firstMatch ||= result.firstMark;
    });

    if (!firstMatch) {
      searchStatus.textContent = `No matches for "${query}". Try a program name or "university".`;
      return;
    }

    const containingDetails = firstMatch.closest("details");
    if (containingDetails) containingDetails.open = true;

    const target =
      firstMatch.closest("h1, h2, h3, p, li, summary, dt, dd") ||
      firstMatch.parentElement;

    if (target) {
      previousSearchTarget = target;
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      target.scrollIntoView({
        behavior: reducedMotion.matches ? "auto" : "smooth",
        block: "center",
      });
    }

    searchStatus.textContent = `${count} ${count === 1 ? "match" : "matches"} for "${query}".`;
  });

  searchClear?.addEventListener("click", () => {
    clearSearchMarks();
    searchInput.value = "";
    searchStatus.textContent = "";
    searchInput.focus();
  });

  searchInput?.addEventListener("input", () => {
    if (!searchInput.value) {
      clearSearchMarks();
      searchStatus.textContent = "";
    }
  });

  const contactForm = document.getElementById("contact-form");
  const submitButton = document.getElementById("form-submit");
  const submitLabel = document.querySelector("[data-submit-label]");
  const formStatus = document.querySelector("[data-form-status]");

  if (contactForm && submitButton && submitLabel && formStatus) {
    const publicKey = contactForm.dataset.emailjsPublicKey;
    const serviceId = contactForm.dataset.emailjsService;
    const templateId = contactForm.dataset.emailjsTemplate;

    if (window.emailjs && publicKey) {
      window.emailjs.init(publicKey);
    }

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!contactForm.checkValidity()) {
        formStatus.dataset.state = "error";
        formStatus.setAttribute("role", "alert");
        formStatus.textContent = "Please complete the required fields and try again.";
        contactForm.reportValidity();
        return;
      }

      contactForm.setAttribute("aria-busy", "true");
      submitButton.disabled = true;
      submitLabel.textContent = "Sending…";
      formStatus.dataset.state = "";
      formStatus.setAttribute("role", "status");
      formStatus.textContent = "Sending your message.";

      const params = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        message: document.getElementById("message").value.trim(),
      };

      try {
        if (!window.emailjs || !serviceId || !templateId) {
          throw new Error("Email service unavailable");
        }

        await window.emailjs.send(serviceId, templateId, params);
        contactForm.reset();
        formStatus.dataset.state = "success";
        formStatus.setAttribute("role", "status");
        formStatus.textContent = "Thanks. Your message has been sent to Luban.";
        submitLabel.textContent = "Send another message";
      } catch (error) {
        console.error("Luban contact form:", error);
        formStatus.dataset.state = "error";
        formStatus.setAttribute("role", "alert");
        formStatus.textContent = "We couldn't send your message. Check your connection and try again.";
        submitLabel.textContent = "Try sending again";
      } finally {
        contactForm.removeAttribute("aria-busy");
        submitButton.disabled = false;
      }
    });
  }
})();
