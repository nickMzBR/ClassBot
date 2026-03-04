export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    const { mensagens } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile", // Modelo de texto ultra estável
                messages: [
                    {
                        role: "system",
                        content: "Você é o ClassBot da Classtech, criado pelo Red. Personalidade: Adolescente gênio, sarcástico, direto e inteligente. Não use emojis. Se o usuário for burro, dê um leve esporro técnico."
                    },
                    ...mensagens
                ],
                temperature: 0.7 
            })
        });

        const data = await response.json();
        res.status(200).json({ answer: data.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ answer: "Meu cérebro fritou. Tenta mandar de novo." });
    }
}