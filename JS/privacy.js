// RecarregaAi! V.1.5.1

const policyNavLinks = [...document.querySelectorAll(".policy-nav a[href^='#']")];
const privacyHeader = document.querySelector(".privacy-header");
const policyHeadings = policyNavLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const sectionTopGap = 34;

const setActivePolicyNavLink = (headingId) => {
  policyNavLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${headingId}`;

    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "true");
      return;
    }

    link.removeAttribute("aria-current");
  });
};

const getScrollTargetTop = (heading) => {
  const section = heading.closest(".policy-section") || heading;
  const headerHeight = privacyHeader?.getBoundingClientRect().height || 0;
  const sectionTop = section.getBoundingClientRect().top + window.scrollY;

  return Math.max(0, sectionTop - headerHeight - sectionTopGap);
};

policyNavLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const headingId = link.getAttribute("href").slice(1);
    const heading = document.getElementById(headingId);

    if (!heading) {
      return;
    }

    event.preventDefault();
    setActivePolicyNavLink(headingId);
    window.history.pushState(null, "", `#${headingId}`);
    window.scrollTo({
      behavior: "smooth",
      top: getScrollTargetTop(heading)
    });
  });
});

if (window.location.hash) {
  const initialHeadingId = window.location.hash.slice(1);

  if (policyHeadings.some((heading) => heading.id === initialHeadingId)) {
    setActivePolicyNavLink(initialHeadingId);
  }
}

if ("IntersectionObserver" in window && policyHeadings.length > 0) {
  const activeHeadingObserver = new IntersectionObserver((entries) => {
    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((firstEntry, secondEntry) => (
        firstEntry.boundingClientRect.top - secondEntry.boundingClientRect.top
      ))[0];

    if (visibleEntry?.target?.id) {
      setActivePolicyNavLink(visibleEntry.target.id);
    }
  }, {
    rootMargin: "-28% 0px -60% 0px",
    threshold: 0
  });

  policyHeadings.forEach((heading) => {
    activeHeadingObserver.observe(heading);
  });
}
