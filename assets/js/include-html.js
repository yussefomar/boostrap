async function includeHtmlPartials() {
  const getIncludeFile = (placeholder) => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const isTablet = window.matchMedia("(min-width: 768px) and (max-width: 1280px)").matches;

    if (isMobile && placeholder.hasAttribute("data-include-mobile")) {
      return placeholder.getAttribute("data-include-mobile");
    }

    if (isTablet && placeholder.hasAttribute("data-include-tablet")) {
      return placeholder.getAttribute("data-include-tablet");
    }

    return placeholder.getAttribute("data-include");
  };

  if (window.location.protocol === "file:") {
    document.querySelectorAll("[data-include]").forEach((placeholder) => {
      const file = getIncludeFile(placeholder);
      placeholder.innerHTML = `
        <div class="section-card text-warning">
          Para cargar ${file}, abr&iacute; esta p&aacute;gina desde localhost.
          Us&aacute; el archivo abrir-home-gaming.bat.
        </div>
      `;
    });

    return;
  }

  const placeholders = document.querySelectorAll("[data-include]");

  await Promise.all(
    [...placeholders].map(async (placeholder) => {
      const file = getIncludeFile(placeholder);

      try {
        const response = await fetch(file);

        if (!response.ok) {
          throw new Error(`No se pudo cargar ${file}`);
        }

        placeholder.outerHTML = await response.text();
      } catch (error) {
        placeholder.innerHTML = `<div class="section-card text-danger">Error cargando ${file}</div>`;
        console.error(error);
      }
    })
  );

  initMobileMenu();
  initVideoCarousels();
}

function initMobileMenu() {
  const header = document.querySelector(".mobile-header");
  const button = document.querySelector(".mobile-menu-btn");

  if (!header || !button) {
    return;
  }

  button.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-menu-open");
    const icon = button.querySelector(".bi");

    button.setAttribute("aria-expanded", String(isOpen));

    if (icon) {
      icon.classList.toggle("bi-list", !isOpen);
      icon.classList.toggle("bi-x-lg", isOpen);
    }
  });

  header.querySelectorAll(".mobile-menu a").forEach((link) => {
    link.addEventListener("click", () => {
      const icon = button.querySelector(".bi");

      header.classList.remove("is-menu-open");
      button.setAttribute("aria-expanded", "false");

      if (icon) {
        icon.classList.add("bi-list");
        icon.classList.remove("bi-x-lg");
      }
    });
  });
}

function initVideoCarousels() {
  document.querySelectorAll(".videos-panel, .mobile-videos-panel").forEach((carousel) => {
    const list = carousel.querySelector(".video-list, .mobile-video-list");
    const previousButton = carousel.querySelector(".panel-arrow-left, .mobile-panel-arrow-left");
    const nextButton = carousel.querySelector(".panel-arrow-right, .mobile-panel-arrow-right");
    const dots = [...carousel.querySelectorAll(".video-dots span, .mobile-video-dots span")];

    if (!list || !previousButton || !nextButton) {
      return;
    }

    let activeIndex = 0;

    const getCards = () => [...list.children];

    const updateDots = () => {
      if (!dots.length) {
        return;
      }

      dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === activeIndex % dots.length);
      });
    };

    const scrollMobileList = () => {
      const cards = getCards();
      const activeCard = cards[activeIndex % cards.length];

      if (!activeCard || list.scrollWidth <= list.clientWidth) {
        return;
      }

      list.scrollTo({
        left: activeCard.offsetLeft - list.offsetLeft,
        behavior: "smooth",
      });
    };

    const rotateCards = (direction) => {
      const cards = getCards();
      const hasHorizontalScroll = list.scrollWidth > list.clientWidth + 1;

      if (cards.length <= 1) {
        return;
      }

      if (hasHorizontalScroll) {
        activeIndex = (activeIndex + direction + cards.length) % cards.length;
        updateDots();
        scrollMobileList();
        return;
      }

      if (direction > 0) {
        list.append(cards[0]);
        activeIndex = (activeIndex + 1) % cards.length;
      } else {
        list.prepend(cards[cards.length - 1]);
        activeIndex = (activeIndex - 1 + cards.length) % cards.length;
      }

      updateDots();
      scrollMobileList();
    };

    nextButton.addEventListener("click", () => rotateCards(1));
    previousButton.addEventListener("click", () => rotateCards(-1));

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        const cards = getCards();
        const total = cards.length;
        const target = index % total;
        const hasHorizontalScroll = list.scrollWidth > list.clientWidth + 1;

        if (hasHorizontalScroll) {
          activeIndex = target;
          updateDots();
          scrollMobileList();
          return;
        }

        const steps = (target - activeIndex + total) % total;

        for (let step = 0; step < steps; step += 1) {
          list.append(list.children[0]);
        }

        activeIndex = target;
        updateDots();
        scrollMobileList();
      });
    });

    updateDots();
  });
}

includeHtmlPartials();
