export default async function handler(req, res) {
    // Garante que apenas pedidos POST sejam aceites
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { prompt } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    // Verifica se a chave foi configurada na Vercel
    if (!apiKey) {
        return res.status(500).json({ error: 'Erro interno: API Key não configurada.' });
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { 
                        role: "system", 
                        content: "Você é o ClassBot, uma inteligência artificial prestativa e educada. Responda de forma clara e objetiva em Português." 
                    },
                    { 
                        role: "user", 
                        content: prompt 
                    }
                ],
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        const data = await response.json();

        if (data.choices && data.choices[0]) {
            res.status(200).json({ answer: data.choices[0].message.content });
        } else {
            res.status(500).json({ error: 'Resposta inválida da API do Groq.' });
        }

    } catch (error) {
        console.error("Erro na API:", error);
        res.status(500).json({ error: 'Falha ao conectar com o cérebro da IA.' });
    }
}