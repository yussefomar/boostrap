async function includeHtmlPartials() {
  const getIncludeFile = (placeholder) => {
    const isTablet = window.matchMedia("(min-width: 768px) and (max-width: 1280px)").matches;

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
}

includeHtmlPartials();
