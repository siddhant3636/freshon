import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const parseSearchIntent = async (query) => {
  try {
    const prompt = `
Extract structured filters from this shopping query.

Query: "${query}"

Return ONLY valid JSON:
{
  "category": null,
  "subCategory": null,
  "text": ""
}

Rules:
- category must be one of: Men, Women, Kids
- subCategory must be one of: Topwear, Bottomwear, Winterwear

Mapping rules:
- words like "top", "shirt", "tshirt", "tee" → Topwear
- words like "pant", "pants", "jeans", "trouser", "bottom" → Bottomwear
- words like "winter", "jacket", "hoodie", "sweater", "coat" → Winterwear

Always map these words to the correct subCategory.
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const raw = response.choices[0].message.content;
    console.log(raw);
    return JSON.parse(raw);

  } catch (err) {
    console.error("AI parse error:", err);
    return null;
  }
};