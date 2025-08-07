/****************
 * MAIN FUNCTIONS
 ****************/

async function searchResults(keyword) {
  try {
    const searchUrl = `https://jkanime.net/buscar/${encodeURIComponent(keyword)}/`;
    const res = await fetch(searchUrl); // res es HTML directamente en Sora WebUI
    const doc = new DOMParser().parseFromString(res, "text/html");

    const results = [];

    doc.querySelectorAll(".anime__item").forEach(card => {
      const title = card.querySelector(".anime__item__text h5 a")?.textContent?.trim();
      const url = card.querySelector(".anime__item__text h5 a")?.getAttribute("href");
      const img = card.querySelector(".anime__item__pic")?.getAttribute("data-setbg");

      if (title && url) {
        results.push({
          title,
          href: url.startsWith("http") ? url : `https://jkanime.net${url}`,
          image: img || ""
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
    const res = await fetch(url); // res es ya un string (HTML)
    const doc = new DOMParser().parseFromString(res, "text/html");

    const description = doc.querySelector(".anime__details__text p")?.textContent?.trim() || "";
    const aliases = doc.querySelector(".anime__details__title h3")?.textContent?.trim() || "";
    const airdate = ""; // JKAnime no tiene fecha visible directa

    return JSON.stringify([{
      description,
      aliases,
      airdate
    }]);
  } catch (e) {
    console.error("[extractDetails] Error:", e);
    return JSON.stringify([{
      description: "",
      aliases: "",
      airdate: ""
    }]);
  }
}

async function extractEpisodes(url) {
  try {
    const res = await fetch(url);
    const html = res; // Sora ya lo trata como texto directamente
    console.log("[extractEpisodes] HTML:", html.slice(0, 500)); // ✅ Ahora sí

    const doc = new DOMParser().parseFromString(html, "text/html");

    const episodes = [];

    doc.querySelectorAll("#episodes-content .epcontent").forEach(el => {
      const epUrl = el.querySelector("a")?.getAttribute("href");
      const epTitle = el.querySelector(".cap_num span")?.textContent?.trim();
      const number = el.dataset.number ? parseInt(el.dataset.number) : null;

      if (epUrl && number !== null) {
        episodes.push({
          href: epUrl.startsWith("http") ? epUrl : `https://jkanime.net${epUrl}`,
          number,
          title: epTitle || `Episodio ${number}`
        });
      }
    });

    console.log("[extractEpisodes] Total encontrados:", episodes.length);
    return JSON.stringify(episodes);
  } catch (e) {
    console.error("[extractEpisodes] Error:", e);
    return JSON.stringify([]);
  }
}



async function extractStreamUrl(url) {
  try {
    const res = await fetch(url);
    const doc = new DOMParser().parseFromString(res, "text/html");

    const servers = Array.from(doc.querySelectorAll(".server-item"));
    let targetServer = servers.find(el => el.dataset.name?.toLowerCase().includes("streamwish"));

    if (!targetServer && servers.length > 0) {
      targetServer = servers[0];
    }

    if (!targetServer) {
      console.error("[extractStreamUrl] No se encontraron servidores.");
      return null;
    }

    const serverId = targetServer.dataset.id;
    console.log("[extractStreamUrl] Usando servidor con ID:", serverId);

    const response = await fetch("https://jkanime.net/api/episode/iframe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: serverId })
    });

    const iframeHTML = await response.text(); // ✅ CORREGIDO AQUÍ
    console.log("[extractStreamUrl] Respuesta del iframe:", iframeHTML.slice(0, 200));

    const iframeMatch = iframeHTML.match(/<iframe[^>]+src="([^"]+)"/);
    if (iframeMatch && iframeMatch[1]) {
      const finalUrl = iframeMatch[1];
      console.log("[extractStreamUrl] URL final del video:", finalUrl);
      return finalUrl;
    } else {
      console.error("[extractStreamUrl] No se encontró el iframe en la respuesta.");
      return null;
    }
  } catch (e) {
    console.error("[extractStreamUrl] Error:", e);
    return null;
  }
}




