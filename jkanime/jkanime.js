/****************
 * MAIN FUNCTIONS
 ****************/

async function searchResults(keyword) {
  try {
    const searchUrl = `https://jkanime.net/buscar/${encodeURIComponent(keyword)}/`;
    const res = await fetch(searchUrl);  // res ya es el HTML como string
    const doc = new DOMParser().parseFromString(res, "text/html");

    const results = [];

    doc.querySelectorAll("div.let-post").forEach(post => {
      const title = post.querySelector("h2")?.textContent?.trim();
      const linkEl = post.querySelector("a");
      const url = linkEl?.getAttribute("href");
      const imgEl = post.querySelector("img");
      const img = imgEl?.getAttribute("src");

      if (title && url) {
        results.push({
          title,
          image: img || "",
          href: url.startsWith("http") ? url : `https://jkanime.net${url}`
        });
      }
    });

    return JSON.stringify(results);
  } catch (e) {
    console.error("[searchResults] Error:", e);
    return JSON.stringify([]);
  }
}

async function extractDetails(url) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    const description = doc.querySelector(".anime__details__text p")?.textContent?.trim() || "";
    const aliases = doc.querySelector(".anime__details__title h3")?.textContent?.trim() || "";
    const airdate = "";

    return JSON.stringify([{ description, aliases, airdate }]);
  } catch (e) {
    console.error("[extractDetails] Error:", e);
    return JSON.stringify([{ description: "", aliases: "", airdate: "" }]);
  }
}

async function extractEpisodes(url) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    const episodes = [];

    doc.querySelectorAll(".episodios li a").forEach((el) => {
      const epUrl = el.getAttribute("href");
      const epText = el.textContent?.trim();
      const numberMatch = epUrl.match(/-(\d+)\//);
      const number = numberMatch ? parseInt(numberMatch[1]) : null;

      if (epUrl && number !== null) {
        episodes.push({
          href: epUrl.startsWith("http") ? epUrl : `https://jkanime.net${epUrl}`,
          number: number,
          title: epText || `Episodio ${number}`
        });
      }
    });

    return JSON.stringify(episodes);
  } catch (e) {
    console.error("[extractEpisodes] Error:", e);
    return JSON.stringify([]);
  }
}

async function extractStreamUrl(url) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const iframe = html.match(/<iframe.+?src="(https:\/\/[^"]+)"/);
    if (iframe && iframe[1]) {
      return iframe[1];
    }
    return null;
  } catch (e) {
    console.error("[extractStreamUrl] Error:", e);
    return null;
  }
}
