registerProvider({
  id: "jkanime",
  name: "JKAnime",
  type: "anime",
  language: "es",

  async search(query) {
    const searchUrl = `https://jkanime.net/buscar/${encodeURIComponent(query)}/`;

    const res = await fetch(searchUrl);
    const html = await res.text();

    const doc = new DOMParser().parseFromString(html, "text/html");
    const results = [];

    doc.querySelectorAll(".anime__item").forEach(card => {
      const title = card.querySelector(".anime__item__text h5")?.textContent?.trim();
      const url = card.querySelector("a")?.getAttribute("href");
      const img = card.querySelector("img")?.getAttribute("src");

      if (title && url && img) {
        results.push({
          title,
          url: url.startsWith("http") ? url : `https://jkanime.net${url}`,
          poster: img
        });
      }
    });

    return results;
  },

  async anime(url) {
    const res = await fetch(url);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    const title = doc.querySelector(".anime__details__title h3")?.textContent?.trim() || "Sin título";
    const poster = doc.querySelector(".anime__details__pic img")?.getAttribute("src") || "";
    const description = doc.querySelector(".anime__details__text p")?.textContent?.trim() || "";

    const episodes = [];

    doc.querySelectorAll(".episodios li a").forEach((el) => {
      const epUrl = el.getAttribute("href");
      const epTitle = el.textContent?.trim();
      const numberMatch = epUrl.match(/-(\d+)\//);
      const number = numberMatch ? parseInt(numberMatch[1]) : null;

      if (epUrl && number !== null) {
        episodes.push({
          number,
          title: epTitle || `Episodio ${number}`,
          url: epUrl.startsWith("http") ? epUrl : `https://jkanime.net${epUrl}`
        });
      }
    });

    // Ordenar episodios por número ascendente
    episodes.sort((a, b) => a.number - b.number);

    return {
      title,
      description,
      poster,
      episodes
    };
  }
});
