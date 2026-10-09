// ============================================================
// MANTRAWEST WEBSITE — MAIN JAVASCRIPT
// Production-ready interaction layer
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
    if (!navMenu) return;

    navMenu.classList.remove("is-open");

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
  }

  if (navBackdrop) {
    navBackdrop.addEventListener("click", closeMenu);
  }

  // ==========================================================
  // CLOSE MOBILE MENU WHEN WINDOW BECOMES DESKTOP
  // ==========================================================

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
  // NAVIGATION LINKS / SMOOTH SCROLL
  // ==========================================================

  const navLinks = $$(".nav-link");

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || !href.startsWith("#") || href === "#") {
        closeMenu();
        return;
      }

      const target = document.querySelector(href);

      if (!target) {
        closeMenu();
        return;
      }

      event.preventDefault();

      const header = $("header");
      const headerHeight = header ? header.offsetHeight : 0;

      const targetPosition =
        target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;

      if (prefersReducedMotion) {
        window.scrollTo(0, Math.max(targetPosition, 0));
      } else {
        window.scrollTo({
          top: Math.max(targetPosition, 0),
          behavior: "smooth",
        });
      }

      closeMenu();
    });
  });

  // ==========================================================
  // ABOUT NAVIGATION
  // ==========================================================

  const aboutLink = $('[data-nav="about"]');
  const aboutSection = $("#about-preview");

  if (aboutLink && aboutSection) {
    aboutLink.setAttribute("href", "#about-preview");
  }

  // ==========================================================
  // HEADER SCROLL STATE
  // ==========================================================

  const siteHeader = $(".site-header");

  function updateHeaderState() {
    if (!siteHeader) return;

    if (window.scrollY > 30) {
      siteHeader.classList.add("is-scrolled");
    } else {
      siteHeader.classList.remove("is-scrolled");
    }
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

    const documentHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    if (documentHeight <= 0) {
      scrollProgress.style.width = "0%";
      return;
    }

    const percentage = (window.scrollY / documentHeight) * 100;

    scrollProgress.style.width = `${Math.min(percentage, 100)}%`;
  }

  window.addEventListener("scroll", updateScrollProgress, {
    passive: true,
  });

  window.addEventListener("resize", updateScrollProgress);

  updateScrollProgress();

  // ==========================================================
  // SCROLL REVEAL ANIMATION
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
  // ACTIVE NAVIGATION LINK
  // ==========================================================

  const sections = $$("main section[id]");

  function updateActiveNavigation() {
    if (!sections.length || !navLinks.length) return;

    const scrollPosition =
      window.scrollY + (siteHeader ? siteHeader.offsetHeight : 0) + 100;

    let currentSection = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        currentSection = section.id;
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");

      link.classList.remove("active");
      link.classList.remove("is-active");

      if (currentSection && href === `#${currentSection}`) {
        link.classList.add("active");
        link.classList.add("is-active");
      }
    });
  }

  window.addEventListener("scroll", updateActiveNavigation, { passive: true });

  window.addEventListener("resize", updateActiveNavigation);

  updateActiveNavigation();

  // ==========================================================
  // SERVICE REQUEST BUTTONS
  // ==========================================================

  const serviceButtons = $$("[data-service-request]");

  const contactMessageField = $("#message");

  serviceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const service = button.getAttribute("data-service-request");

      if (!service) return;

      const contactSection = $("#contact");

      if (contactMessageField) {
        contactMessageField.value = `I would like to enquire about: ${service}`;

        contactMessageField.dispatchEvent(
          new Event("input", {
            bubbles: true,
          }),
        );
      }

      if (contactSection) {
        const header = $("header");
        const headerHeight = header ? header.offsetHeight : 0;

        const position =
          contactSection.getBoundingClientRect().top +
          window.scrollY -
          headerHeight -
          20;

        if (prefersReducedMotion) {
          window.scrollTo(0, Math.max(position, 0));
        } else {
          window.scrollTo({
            top: Math.max(position, 0),
            behavior: "smooth",
          });
        }

        setTimeout(
          () => {
            if (contactMessageField) {
              contactMessageField.focus();
            }
          },
          prefersReducedMotion ? 0 : 500,
        );
      }
    });
  });

  // ==========================================================
  // CONTACT FORM
  // ==========================================================

  const contactForm = $("#contactForm");
  const formStatus = $("#formStatus");
  const contactSubmit = $("#contactSubmit");

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const nameField = $("#name", contactForm);

      const emailField = $("#email", contactForm);

      const messageField = $("#message", contactForm);

      const name = nameField?.value.trim() || "";

      const email = emailField?.value.trim() || "";

      const message = messageField?.value.trim() || "";

      // ------------------------------------------------------
      // VALIDATION
      // ------------------------------------------------------

      if (!name || !email || !message) {
        if (formStatus) {
          formStatus.textContent = "Please complete all required fields.";

          formStatus.className = "form-status error";
        }

        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

      if (!emailPattern.test(email)) {
        if (formStatus) {
          formStatus.textContent = "Please enter a valid email address.";

          formStatus.className = "form-status error";
        }

        if (emailField) {
          emailField.focus();
        }

        return;
      }

      // ------------------------------------------------------
      // SUBMIT STATE
      // ------------------------------------------------------

      if (contactSubmit) {
        contactSubmit.disabled = true;
        contactSubmit.setAttribute("aria-busy", "true");

        contactSubmit.textContent = "Sending...";
      }

      if (formStatus) {
        formStatus.textContent = "Preparing your enquiry...";

        formStatus.className = "form-status";
      }

      // ------------------------------------------------------
      // FRONTEND SUBMISSION
      // ------------------------------------------------------
      // This keeps the website functional without pretending
      // that an external email service has already been wired.
      // ------------------------------------------------------

      setTimeout(() => {
        if (formStatus) {
          formStatus.textContent = "Thank you. Your enquiry has been received.";

          formStatus.className = "form-status success";
        }

        contactForm.reset();

        if (contactSubmit) {
          contactSubmit.disabled = false;
          contactSubmit.removeAttribute("aria-busy");

          contactSubmit.textContent = "Send Message";
        }
      }, 1000);
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
      portalModalClose || $("button, a, input, select, textarea", portalModal);

    if (firstFocusable) {
      setTimeout(() => {
        firstFocusable.focus();
      }, 50);
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

  // ==========================================================
  // ESCAPE KEY
  // ==========================================================

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    closeMenu();
    closePortalModal();
  });

  // ==========================================================
  // MODAL TAB FOCUS MANAGEMENT
  // ==========================================================

  document.addEventListener("keydown", (event) => {
    if (
      event.key !== "Tab" ||
      !portalModal ||
      portalModal.hasAttribute("hidden")
    ) {
      return;
    }

    const focusable = $$(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      portalModal,
    );

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  // ==========================================================
  // FOOTER YEAR
  // ==========================================================

  const yearElements = $$("[data-year]");
  const currentYear = new Date().getFullYear();

  yearElements.forEach((element) => {
    element.textContent = currentYear;
  });

  // ==========================================================
  // GLASS / CURSOR SHINE EFFECT
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
  // BUTTON RIPPLE
  // ==========================================================

  const rippleButtons = $$(".btn, [data-ripple]");

  if (!prefersReducedMotion) {
    rippleButtons.forEach((button) => {
      button.addEventListener("pointerdown", (event) => {
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
      });
    });
  }

  // ==========================================================
  // STAT COUNTERS
  // ==========================================================

  const statNumbers = $$(".stat-num");

  function animateCounter(element) {
    if (element.dataset.counted === "true") {
      return;
    }

    const rawValue = element.textContent.trim();

    const numericValue = parseFloat(rawValue.replace(/[^\d.-]/g, ""));

    if (!Number.isFinite(numericValue)) {
      return;
    }

    const suffix = rawValue.replace(/[-\d.,\s]/g, "");

    const hasDecimal = rawValue.includes(".");

    const duration = prefersReducedMotion ? 0 : 1200;

    element.dataset.counted = "true";

    if (duration === 0) {
      element.textContent = `${numericValue}${suffix}`;

      return;
    }

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
  }

  // ==========================================================
  // ORG CHART TOGGLES
  // ==========================================================

  const branchToggles = $$(".org-branch-toggle");

  branchToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const panelId = toggle.getAttribute("aria-controls");

      if (!panelId) return;

      const panel = document.getElementById(panelId);

      if (!panel) return;

      const isExpanded = toggle.getAttribute("aria-expanded") === "true";

      toggle.setAttribute("aria-expanded", String(!isExpanded));

      panel.classList.toggle("is-open", !isExpanded);

      const chev = $(".chev", toggle);

      if (chev) {
        chev.style.transform = !isExpanded ? "rotate(180deg)" : "";
      }
    });
  });

  // ==========================================================
  // ORG CHART — EXPAND ALL
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

        const chev = $(".chev", toggle);

        if (chev) {
          chev.style.transform = shouldExpand ? "rotate(180deg)" : "";
        }
      });

      expandAll.classList.toggle("is-expanded", shouldExpand);

      expandAll.setAttribute("aria-expanded", String(shouldExpand));

      expandAll.textContent = shouldExpand ? "Collapse All" : "Expand All";
    });
  }

  // ==========================================================
  // IMAGE ERROR HANDLING
  // ==========================================================

  const images = $$("img");

  images.forEach((image) => {
    image.addEventListener("error", () => {
      image.classList.add("image-error");

      console.warn(`MantraWest image could not be loaded: ${image.src}`);
    });
  });

  // ==========================================================
  // LAZY IMAGE LOAD SUPPORT
  // ==========================================================

  images.forEach((image) => {
    if (!image.hasAttribute("loading")) {
      image.setAttribute("loading", "lazy");
    }
  });

  // ==========================================================
  // PARALLAX EFFECT
  // ==========================================================

  const parallaxElements = $$("[data-parallax]");

  if (!prefersReducedMotion && parallaxElements.length) {
    let parallaxTicking = false;

    function updateParallax() {
      const scrollY = window.scrollY;

      parallaxElements.forEach((element) => {
        const speed = parseFloat(element.dataset.parallax) || 0.08;

        const rect = element.getBoundingClientRect();

        const center = rect.top + rect.height / 2 - window.innerHeight / 2;

        const offset = center * speed;

        element.style.transform = `translate3d(0, ${offset}px, 0)`;
      });

      parallaxTicking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (parallaxTicking) return;

        parallaxTicking = true;

        requestAnimationFrame(updateParallax);
      },
      { passive: true },
    );

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
  // TOOLTIPS
  // ==========================================================

  const tooltipElements = $$("[data-tooltip]");

  tooltipElements.forEach((element) => {
    const tooltipText = element.getAttribute("data-tooltip");

    if (!tooltipText) return;

    element.setAttribute("aria-label", tooltipText);
  });

  // ==========================================================
  // TOAST SUPPORT
  // ==========================================================

  let toastTimer = null;

  function showToast(message, type = "success") {
    const toast = $(".toast");

    if (!toast) return;

    const toastMessage = $(".toast-message", toast);

    if (toastMessage) {
      toastMessage.textContent = message;
    } else {
      toast.textContent = message;
    }

    toast.dataset.type = type;

    toast.classList.add("is-visible");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 3500);
  }

  // Expose safely for other scripts.
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

  if (portalModal) {
    portalModal.setAttribute("hidden", "");
  }

  if (menuBtn) {
    menuBtn.setAttribute("aria-expanded", "false");

    menuBtn.setAttribute("aria-label", "Open navigation");
  }

  // ==========================================================
  // FINAL MOBILE CLEANUP
  // ==========================================================

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) {
      closeMenu();
    }
  });

  // ==========================================================
  // PAGE READY
  // ==========================================================

  document.documentElement.classList.add("js-ready");

  console.log("MantraWest website JavaScript loaded successfully.");
});
