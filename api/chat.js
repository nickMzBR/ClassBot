export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

    const { prompt } = req.body;
    const apiKey = process.env.GROQ_API_KEY; // Ele vai ler o "Valor" que você salvou

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }]
            })
        });

        const data = await response.json();
        res.status(200).json({ answer: data.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ answer: "Erro ao conectar com a IA. Verifique a chave!" });
    }
}
