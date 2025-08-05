export default async function handler(req, res) {
  const { prompt } = await req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: "Falta el prompt." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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"
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024"
      })
    });

    const data = await response.json();
    res.status(200).json({ imageUrl: data.data[0].url });
  } catch (err) {
    console.error("Error en la generación:", err);
    res.status(500).json({ error: "Error interno generando la imagen" });
  }
}