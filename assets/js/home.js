(() => {
  "use strict";

  const menuToggle = document.querySelector("[data-menu-toggle]");
  const primaryNav = document.querySelector("[data-primary-nav]");
  const dropdown = document.querySelector("[data-nav-dropdown]");
  const dropdownToggle = document.querySelector("[data-nav-dropdown-toggle]");
  const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));

  const setDropdownOpen = (open, restoreFocus = false) => {
    if (!dropdown || !dropdownToggle) return;
    dropdown.dataset.open = String(open);
    dropdownToggle.setAttribute("aria-expanded", String(open));

    if (restoreFocus) dropdownToggle.focus();
  };

  const setMenuOpen = (open, restoreFocus = false) => {
    if (!menuToggle || !primaryNav) return;
    menuToggle.setAttribute("aria-expanded", String(open));
    primaryNav.dataset.open = String(open);

    if (open) {
      window.requestAnimationFrame(() =>
        primaryNav.querySelector("a")?.focus(),
      );
    } else {
      setDropdownOpen(false);
      if (restoreFocus) menuToggle.focus();
    }
  };

  menuToggle?.addEventListener("click", () => {
    const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
    setMenuOpen(willOpen);
  });

  dropdownToggle?.addEventListener("click", () => {
    const willOpen = dropdownToggle.getAttribute("aria-expanded") !== "true";
    setDropdownOpen(willOpen);
  });

  primaryNav?.addEventListener("click", (event) => {
    if (!event.target.closest("a")) return;
    setDropdownOpen(false);
    setMenuOpen(false);
  });

  document.addEventListener("pointerdown", (event) => {
    if (dropdown && !dropdown.contains(event.target)) setDropdownOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (dropdownToggle?.getAttribute("aria-expanded") === "true") {
      setDropdownOpen(false, true);
      return;
    }

    if (menuToggle?.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false, true);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 880) {
      setMenuOpen(false);
      setDropdownOpen(false);
    }
  });

  const trackedSections = navLinks
    .map((link) => {
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("#")) return null;
      const section = document.querySelector(href);
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  let scrollFrame = 0;

  const syncCurrentNav = () => {
    scrollFrame = 0;
    if (!trackedSections.length) return;

    const header = document.querySelector("[data-site-header]");
    const threshold =
      window.scrollY + (header?.getBoundingClientRect().height || 0) + 48;
    let current = trackedSections[0];

    trackedSections.forEach((item) => {
      if (item.section.offsetTop <= threshold) current = item;
    });

    if (
      Math.ceil(window.scrollY + window.innerHeight) >=
      document.documentElement.scrollHeight - 2
    ) {
      current = trackedSections[trackedSections.length - 1];
    }

    navLinks.forEach((link) => link.removeAttribute("aria-current"));
    current.link.setAttribute("aria-current", "location");
  };

  const requestNavSync = () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(syncCurrentNav);
  };

  window.addEventListener("scroll", requestNavSync, { passive: true });
  window.addEventListener("resize", requestNavSync);
  window.addEventListener("hashchange", requestNavSync);
  window.addEventListener(
    "load",
    () => window.setTimeout(requestNavSync, 120),
    { once: true },
  );
  syncCurrentNav();

  document.querySelectorAll("[data-lesson-tabs]").forEach((tabsRoot) => {
    const tablist = tabsRoot.querySelector("[data-lesson-tablist]");
    const tabs = Array.from(tabsRoot.querySelectorAll("[data-lesson-tab]"));
    const panels = Array.from(tabsRoot.querySelectorAll("[data-lesson-panel]"));

    if (!tablist || !tabs.length || !panels.length) return;

    const activateTab = (nextTab, moveFocus = false) => {
      const panelId = nextTab.getAttribute("aria-controls");

      tabs.forEach((tab) => {
        const selected = tab === nextTab;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });

      panels.forEach((panel) => {
        panel.hidden = panel.id !== panelId;
      });

      if (moveFocus) nextTab.focus();
    };

    const selectedTab =
      tabs.find((tab) => tab.getAttribute("aria-selected") === "true") ||
      tabs[0];
    tablist.hidden = false;
    activateTab(selectedTab);

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activateTab(tab));
      tab.addEventListener("keydown", (event) => {
        let nextIndex = index;

        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          nextIndex = (index + 1) % tabs.length;
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = tabs.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        activateTab(tabs[nextIndex], true);
      });
    });
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
        formStatus.textContent =
          "Please complete the required fields and try again.";
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
        formStatus.textContent =
          "We couldn't send your message. Check your connection and try again.";
        submitLabel.textContent = "Try sending again";
      } finally {
        contactForm.removeAttribute("aria-busy");
        submitButton.disabled = false;
      }
    });
  }
})();
