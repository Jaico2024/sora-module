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
          poster: img,
        });
      }
    });

    return results;
  }
});
