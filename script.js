// ============================================================
// MANTRAWEST WEBSITE — MAIN JAVASCRIPT
// Multi-page website interactions and animations
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // ==========================================================
  // HELPER FUNCTIONS
  // ==========================================================

  const $ = (selector, parent = document) => parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    Array.from(parent.querySelectorAll(selector));

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const pageName = (
    document.body.dataset.page ||
    window.location.pathname.split("/").pop().replace(".html", "") ||
    "home"
  ).toLowerCase();

  // ==========================================================
  // MOBILE NAVIGATION
  // ==========================================================

  const menuBtn = $("#navToggle");
  const navMenu = $("#mainNav");
  const navBackdrop = $("#navBackdrop");

  function openMenu() {
    if (!navMenu) return;

    navMenu.classList.add("is-open");

    if (menuBtn) {
      menuBtn.classList.add("is-open");
      menuBtn.setAttribute("aria-expanded", "true");
      menuBtn.setAttribute("aria-label", "Close navigation");
    }

    if (navBackdrop) {
      navBackdrop.classList.add("is-open");
    }

    document.body.classList.add("menu-open");
  }

  function closeMenu() {
    if (navMenu) {
      navMenu.classList.remove("is-open");
    }

    if (menuBtn) {
      menuBtn.classList.remove("is-open");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "Open navigation");
    }

    if (navBackdrop) {
      navBackdrop.classList.remove("is-open");
    }

    document.body.classList.remove("menu-open");
  }

  function toggleMenu() {
    if (!navMenu) return;

    if (navMenu.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", toggleMenu);
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open navigation");
  }

  if (navBackdrop) {
    navBackdrop.addEventListener("click", closeMenu);
  }

  // Close the mobile menu when the screen becomes desktop-sized.

  const desktopBreakpoint = window.matchMedia("(min-width: 1024px)");

  function handleBreakpointChange(event) {
    if (event.matches) {
      closeMenu();
    }
  }

  if (desktopBreakpoint.addEventListener) {
    desktopBreakpoint.addEventListener("change", handleBreakpointChange);
  } else {
    desktopBreakpoint.addListener(handleBreakpointChange);
  }

  // ==========================================================
  // NAVIGATION LINKS
  // Supports both separate pages and same-page anchors.
  // ==========================================================

  const navLinks = $$(".nav-link");

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") {
        closeMenu();
        return;
      }

      let targetURL;

      try {
        targetURL = new URL(href, window.location.href);
      } catch (error) {
        closeMenu();
        return;
      }

      const samePage =
        targetURL.origin === window.location.origin &&
        targetURL.pathname === window.location.pathname;

      // Let the browser navigate normally to another HTML page.
      if (!samePage) {
        closeMenu();
        return;
      }

      // If the link points to an anchor on this page, scroll to it.
      if (targetURL.hash) {
        const target = document.getElementById(
          decodeURIComponent(targetURL.hash.slice(1)),
        );

        if (!target) {
          closeMenu();
          return;
        }

        event.preventDefault();

        const header = $("header");
        const headerHeight = header ? header.offsetHeight : 0;

        const targetPosition =
          target.getBoundingClientRect().top +
          window.scrollY -
          headerHeight -
          20;

        window.scrollTo({
          top: Math.max(targetPosition, 0),
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });

        // Update the URL hash without causing another jump.
        history.replaceState(null, "", targetURL.hash);
      }

      closeMenu();
    });
  });

  // ==========================================================
  // HEADER SCROLL STATE
  // ==========================================================

  const siteHeader = $(".site-header");

  function updateHeaderState() {
    if (!siteHeader) return;

    siteHeader.classList.toggle("is-scrolled", window.scrollY > 30);
  }

  window.addEventListener("scroll", updateHeaderState, {
    passive: true,
  });

  updateHeaderState();

  // ==========================================================
  // SCROLL PROGRESS BAR
  // ==========================================================

  const scrollProgress = $("#scrollProgress");

  function updateScrollProgress() {
    if (!scrollProgress) return;

    const scrollableHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    if (scrollableHeight <= 0) {
      scrollProgress.style.width = "0%";
      return;
    }

    const percentage = (window.scrollY / scrollableHeight) * 100;

    scrollProgress.style.width = `${clamp(percentage, 0, 100)}%`;
  }

  window.addEventListener("scroll", updateScrollProgress, {
    passive: true,
  });

  window.addEventListener("resize", updateScrollProgress);

  updateScrollProgress();

  // ==========================================================
  // SCROLL REVEAL ANIMATIONS
  // Elements with class "reveal" animate into view.
  // ==========================================================

  const revealElements = $$(".reveal");

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  }

  // ==========================================================
  // ACTIVE NAVIGATION
  // Highlights the current page in the navigation menu.
  // ==========================================================

  const pageNavigationMap = {
    home: "home",
    services: "services",
    about: "about",
    projects: "projects",
    blog: "projects",
    contact: "contact",
  };

  function updateActiveNavigation() {
    navLinks.forEach((link) => {
      const navKey = link.dataset.nav || "";
      const navPage = pageNavigationMap[navKey] || navKey;

      const isCurrentPage = navPage === pageName;

      link.classList.toggle("active", isCurrentPage);
      link.classList.toggle("is-active", isCurrentPage);

      if (isCurrentPage) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  updateActiveNavigation();

  // ==========================================================
  // SERVICE REQUEST BUTTONS
  // Send visitors to the contact page with their chosen service.
  // ==========================================================

  const serviceButtons = $$("[data-service-request]");

  serviceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const service = button.getAttribute("data-service-request")?.trim();

      if (!service) return;

      const contactForm = $("#contactForm");
      const messageField = $("#message");

      // If the contact form is on this page, populate it directly.
      if (contactForm && messageField) {
        messageField.value = `I would like to enquire about: ${service}`;

        messageField.dispatchEvent(new Event("input", { bubbles: true }));

        const header = $("header");
        const headerHeight = header ? header.offsetHeight : 0;

        const target = $("#quote-form") || $("#contact") || contactForm;

        const targetPosition =
          target.getBoundingClientRect().top +
          window.scrollY -
          headerHeight -
          20;

        window.scrollTo({
          top: Math.max(targetPosition, 0),
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });

        messageField.focus();
        return;
      }

      // Otherwise, navigate to the separate contact page.
      const params = new URLSearchParams();
      params.set("service", service);

      window.location.href = `contact.html?${params.toString()}#quote-form`;
    });
  });

  // ==========================================================
  // CONTACT FORM — READ SERVICE FROM URL
  // Example: contact.html?service=EPCIC#quote-form
  // ==========================================================

  const contactForm = $("#contactForm");
  const formStatus = $("#formStatus");
  const contactSubmit = $("#contactSubmit");

  const contactMessageField = contactForm ? $("#message", contactForm) : null;

  if (contactMessageField) {
    const params = new URLSearchParams(window.location.search);
    const selectedService = params.get("service");

    if (selectedService && !contactMessageField.value.trim()) {
      contactMessageField.value = `I would like to enquire about: ${selectedService}`;
    }
  }

  // ==========================================================
  // CONTACT FORM VALIDATION
  // IMPORTANT: A backend or form service is needed to deliver
  // submitted enquiries to MantraWest.
  // ==========================================================

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const nameField = $("#name", contactForm);
      const emailField = $("#email", contactForm);
      const messageField = $("#message", contactForm);

      const name = nameField?.value.trim() || "";
      const email = emailField?.value.trim() || "";
      const message = messageField?.value.trim() || "";

      function showFormStatus(messageText, statusType) {
        if (!formStatus) return;

        formStatus.textContent = messageText;
        formStatus.className = "form-status";

        if (statusType) {
          formStatus.classList.add(statusType);
        }

        formStatus.setAttribute("role", "status");
        formStatus.setAttribute("aria-live", "polite");
      }

      // Validate required fields.
      if (!name || !email || !message) {
        showFormStatus("Please complete all required fields.", "error");

        if (!name && nameField) {
          nameField.focus();
        } else if (!email && emailField) {
          emailField.focus();
        } else if (messageField) {
          messageField.focus();
        }

        return;
      }

      // Validate email address.
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

      if (!emailPattern.test(email)) {
        showFormStatus("Please enter a valid email address.", "error");

        if (emailField) {
          emailField.focus();
        }

        return;
      }

      // Prevent repeated submissions while processing.
      if (contactSubmit) {
        contactSubmit.disabled = true;
        contactSubmit.setAttribute("aria-busy", "true");
        contactSubmit.textContent = "Sending...";
      }

      showFormStatus("Your details have been validated.", "success");

      /*
       * No backend submission is performed here.
       *
       * Connect this form to a secure server endpoint or a
       * trusted form service before treating enquiries as
       * delivered to MantraWest.
       */

      if (contactSubmit) {
        contactSubmit.disabled = false;
        contactSubmit.removeAttribute("aria-busy");
        contactSubmit.textContent = "Send Message";
      }
    });
  }

  // ==========================================================
  // CLIENT PORTAL MODAL
  // ==========================================================

  const portalModal = $("#portalModal");
  const portalModalClose = $("#portalModalClose");
  const portalModalBackdrop = $("#portalModalBackdrop");

  const openModalButtons = $$("[data-open-modal]");

  let lastFocusedElement = null;

  function openPortalModal() {
    if (!portalModal) return;

    lastFocusedElement = document.activeElement;

    portalModal.removeAttribute("hidden");
    portalModal.classList.add("is-open");

    document.body.classList.add("modal-open");

    const firstFocusable =
      portalModalClose ||
      $("button, a[href], input, select, textarea", portalModal);

    if (firstFocusable) {
      firstFocusable.focus();
    }
  }

  function closePortalModal() {
    if (!portalModal) return;

    portalModal.classList.remove("is-open");
    portalModal.setAttribute("hidden", "");

    document.body.classList.remove("modal-open");

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }

    lastFocusedElement = null;
  }

  openModalButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openPortalModal();
    });
  });

  if (portalModalClose) {
    portalModalClose.addEventListener("click", closePortalModal);
  }

  if (portalModalBackdrop) {
    portalModalBackdrop.addEventListener("click", closePortalModal);
  }

  if (portalModal) {
    portalModal.setAttribute("hidden", "");
  }

  // ==========================================================
  // KEYBOARD ACCESSIBILITY
  // Escape closes menus and modals.
  // ==========================================================

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      closePortalModal();
    }
  });

  // Keep keyboard focus inside the open modal.
  document.addEventListener("keydown", (event) => {
    if (
      event.key !== "Tab" ||
      !portalModal ||
      portalModal.hasAttribute("hidden")
    ) {
      return;
    }

    const focusableElements = $$(
      [
        "button:not([disabled])",
        "a[href]",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        '[tabindex]:not([tabindex="-1"])',
      ].join(","),
      portalModal,
    ).filter((element) => {
      return element.getClientRects().length > 0;
    });

    if (!focusableElements.length) return;

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  // ==========================================================
  // AUTOMATIC FOOTER YEAR
  // ==========================================================

  const yearElements = $$("[data-year]");
  const currentYear = new Date().getFullYear();

  yearElements.forEach((element) => {
    element.textContent = currentYear;
  });

  // ==========================================================
  // GLASS CARD CURSOR SHINE
  // ==========================================================

  const glassCards = $$(".glass-shine");

  if (!prefersReducedMotion) {
    glassCards.forEach((card) => {
      card.addEventListener(
        "pointermove",
        (event) => {
          const rect = card.getBoundingClientRect();

          if (!rect.width || !rect.height) return;

          const x = ((event.clientX - rect.left) / rect.width) * 100;

          const y = ((event.clientY - rect.top) / rect.height) * 100;

          card.style.setProperty("--mx", `${clamp(x, 0, 100)}%`);

          card.style.setProperty("--my", `${clamp(y, 0, 100)}%`);
        },
        { passive: true },
      );

      card.addEventListener("pointerleave", () => {
        card.style.removeProperty("--mx");
        card.style.removeProperty("--my");
      });
    });
  }

  // ==========================================================
  // BUTTON RIPPLE EFFECT
  // ==========================================================

  const rippleButtons = $$(".btn, [data-ripple]");

  if (!prefersReducedMotion) {
    rippleButtons.forEach((button) => {
      button.addEventListener("pointerdown", (event) => {
        // Do not add a pointer ripple for non-primary clicks.
        if (event.button !== 0) return;

        const rect = button.getBoundingClientRect();

        const size = Math.max(rect.width, rect.height) * 1.4;

        const ripple = document.createElement("span");

        ripple.className = "btn-ripple";

        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;

        ripple.style.left = `${event.clientX - rect.left - size / 2}px`;

        ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

        button.appendChild(ripple);

        ripple.addEventListener(
          "animationend",
          () => {
            ripple.remove();
          },
          { once: true },
        );

        // Remove the ripple if its animation cannot complete.
        window.setTimeout(() => {
          if (ripple.isConnected) {
            ripple.remove();
          }
        }, 2000);
      });
    });
  }

  // ==========================================================
  // ANIMATED STAT COUNTERS
  // ==========================================================

  const statNumbers = $$(".stat-num");

  function animateCounter(element) {
    if (element.dataset.counted === "true") return;

    const originalText = element.textContent.trim();

    const numericValue = parseFloat(originalText.replace(/[^\d.-]/g, ""));

    if (!Number.isFinite(numericValue)) return;

    const suffix = originalText.replace(/[-\d.,\s]/g, "");
    const hasDecimal = originalText.includes(".");

    element.dataset.counted = "true";

    if (prefersReducedMotion) {
      element.textContent = `${numericValue}${suffix}`;
      return;
    }

    const duration = 1200;
    const startTime = performance.now();

    function updateCounter(now) {
      const progress = Math.min((now - startTime) / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numericValue * eased;

      element.textContent = hasDecimal
        ? `${current.toFixed(1)}${suffix}`
        : `${Math.round(current)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        // Ensure the exact final number is displayed.
        element.textContent = `${numericValue}${suffix}`;
      }
    }

    requestAnimationFrame(updateCounter);
  }

  if (statNumbers.length && "IntersectionObserver" in window) {
    const statObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          animateCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.5,
      },
    );

    statNumbers.forEach((stat) => {
      statObserver.observe(stat);
    });
  } else {
    statNumbers.forEach(animateCounter);
  }

  // ==========================================================
  // ORGANISATION CHART BRANCH TOGGLES
  // ==========================================================

  const branchToggles = $$(".org-branch-toggle");

  branchToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const panelId = toggle.getAttribute("aria-controls");

      if (!panelId) return;

      const panel = document.getElementById(panelId);

      if (!panel) return;

      const isExpanded = toggle.getAttribute("aria-expanded") === "true";

      const shouldExpand = !isExpanded;

      toggle.setAttribute("aria-expanded", String(shouldExpand));

      panel.classList.toggle("is-open", shouldExpand);

      const chevron = $(".chev", toggle);

      if (chevron) {
        chevron.style.transform = shouldExpand ? "rotate(180deg)" : "";
      }
    });
  });

  // ==========================================================
  // ORGANISATION CHART — EXPAND OR COLLAPSE ALL
  // ==========================================================

  const expandAll = $("#orgExpandAll");

  if (expandAll) {
    expandAll.addEventListener("click", () => {
      const shouldExpand = !expandAll.classList.contains("is-expanded");

      branchToggles.forEach((toggle) => {
        const panelId = toggle.getAttribute("aria-controls");

        const panel = panelId ? document.getElementById(panelId) : null;

        toggle.setAttribute("aria-expanded", String(shouldExpand));

        if (panel) {
          panel.classList.toggle("is-open", shouldExpand);
        }

        const chevron = $(".chev", toggle);

        if (chevron) {
          chevron.style.transform = shouldExpand ? "rotate(180deg)" : "";
        }
      });

      expandAll.classList.toggle("is-expanded", shouldExpand);

      expandAll.setAttribute("aria-expanded", String(shouldExpand));

      expandAll.textContent = shouldExpand ? "Collapse All" : "Expand All";
    });
  }

  // ==========================================================
  // IMAGE ERROR HANDLING
  // Logs image-loading errors for easier debugging.
  // ==========================================================

  const images = $$("img");

  images.forEach((image) => {
    image.addEventListener("error", () => {
      image.classList.add("image-error");

      console.warn("MantraWest image could not be loaded:", image.src);
    });

    // Apply lazy loading unless the image already specifies it.
    if (!image.hasAttribute("loading")) {
      image.setAttribute("loading", "lazy");
    }
  });

  // ==========================================================
  // PARALLAX EFFECT
  // Elements can use data-parallax="0.08".
  // ==========================================================

  const parallaxElements = $$("[data-parallax]");

  if (!prefersReducedMotion && parallaxElements.length) {
    let parallaxTicking = false;

    function updateParallax() {
      const viewportCenter = window.innerHeight / 2;

      parallaxElements.forEach((element) => {
        const speed = parseFloat(element.dataset.parallax) || 0.08;

        const rect = element.getBoundingClientRect();

        const elementCenter = rect.top + rect.height / 2;

        const offset = (elementCenter - viewportCenter) * speed;

        element.style.transform = `translate3d(0, ${offset}px, 0)`;
      });

      parallaxTicking = false;
    }

    function requestParallaxUpdate() {
      if (parallaxTicking) return;

      parallaxTicking = true;
      requestAnimationFrame(updateParallax);
    }

    window.addEventListener("scroll", requestParallaxUpdate, { passive: true });

    window.addEventListener("resize", requestParallaxUpdate);

    updateParallax();
  }

  // ==========================================================
  // MAGNETIC BUTTON EFFECT
  // ==========================================================

  const magneticElements = $$(".magnetic");

  if (!prefersReducedMotion) {
    magneticElements.forEach((element) => {
      element.addEventListener("pointermove", (event) => {
        const rect = element.getBoundingClientRect();

        const x = event.clientX - rect.left - rect.width / 2;

        const y = event.clientY - rect.top - rect.height / 2;

        const strength = parseFloat(element.dataset.magnetic) || 0.15;

        element.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });

      element.addEventListener("pointerleave", () => {
        element.style.transform = "";
      });
    });
  }

  // ==========================================================
  // TOOLTIP ACCESSIBILITY
  // ==========================================================

  const tooltipElements = $$("[data-tooltip]");

  tooltipElements.forEach((element) => {
    const tooltipText = element.getAttribute("data-tooltip");

    if (!tooltipText) return;

    if (!element.hasAttribute("aria-label")) {
      element.setAttribute("aria-label", tooltipText);
    }
  });

  // ==========================================================
  // TOAST NOTIFICATIONS
  // Other scripts can call MantraWest.showToast().
  // ==========================================================

  let toastTimer = null;

  function showToast(message, type = "success") {
    const toast = $(".toast");

    if (!toast) {
      console.info("MantraWest notification:", message);
      return;
    }

    const toastMessage = $(".toast-message", toast);

    if (toastMessage) {
      toastMessage.textContent = message;
    } else {
      toast.textContent = message;
    }

    toast.dataset.type = type;
    toast.classList.add("is-visible");

    window.clearTimeout(toastTimer);

    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 3500);
  }

  // ==========================================================
  // EXPOSE FUNCTIONS FOR OTHER SCRIPTS
  // ==========================================================

  window.MantraWest = {
    showToast,
    openMenu,
    closeMenu,
    openPortalModal,
    closePortalModal,
  };

  // ==========================================================
  // INITIAL PAGE STATE
  // ==========================================================

  document.documentElement.classList.add("js-ready");

  console.log(
    `MantraWest JavaScript loaded successfully on the "${pageName}" page.`,
  );
});
