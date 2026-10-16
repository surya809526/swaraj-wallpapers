
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=3600");

  const allowed = [
    "nature", "galaxy", "anime", "gaming", "cars",
    "cyberpunk", "amoled", "abstract", "architecture", "all"
  ];

  const category = String(req.query.category || "all").toLowerCase();
  const page = Math.max(1, Math.min(20, Number(req.query.page) || 1));
  const search = String(req.query.q || "").slice(0, 80).trim();

  if (!allowed.includes(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  const terms = {
    nature: "nature wallpaper",
    galaxy: "galaxy space wallpaper",
    anime: "anime illustration wallpaper",
    gaming: "gaming setup wallpaper",
    cars: "sports car wallpaper",
    cyberpunk: "cyberpunk neon wallpaper",
    amoled: "dark black abstract wallpaper",
    abstract: "abstract art wallpaper",
    architecture: "modern architecture wallpaper",
    all: "wallpaper"
  };

  const query = search || terms[category] || terms.all;
  const key = process.env.PIXABAY_API_KEY;

  if (!key) {
    return res.status(500).json({ error: "API key is not configured in Vercel." });
  }

  try {
    const params = new URLSearchParams({
      key,
      q: query,
      image_type: "photo",
      orientation: "vertical",
      safesearch: "true",
      order: "latest",
      page: String(page),
      per_page: "100"
    });

    const response = await fetch("https://pixabay.com/api/?" + params);

    if (!response.ok) {
      return res.status(502).json({
        error: "Pixabay API request failed. Check your API key and limits."
      });
    }

    const data = await response.json();

    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({
      total: data.totalHits || 0,
      images: (data.hits || []).map((image) => ({
        id: image.id,
        title: (image.tags || "Wallpaper").split(",")[0],
        tags: image.tags || "",
        url: image.webformatURL,
        source: image.pageURL,
        creator: image.user || "Pixabay contributor"
      }))
    });
  } catch (error) {
    return res.status(500).json({ error: "Unable to load wallpapers right now." });
  }
}
