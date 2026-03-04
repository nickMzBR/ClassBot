export default async function handler(req, res) {
    // Garante que o servidor só aceite pedidos de texto (POST) do seu site
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { prompt } = req.body;
    const apiKey = process.env.GROQ_API_KEY; // Puxa a chave que você arrumou no painel

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
                        content: "Você é o ClassBot, uma IA avançada e prestativa. Você foi criado pela Classtech, que foi fundada pelo Red. Responda SEMPRE em português do Brasil de forma natural e inteligente." 
                    },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7 // Deixa a resposta mais natural
            })
        });

        const data = await response.json();

        if (data.choices && data.choices[0]) {
            res.status(200).json({ answer: data.choices[0].message.content });
        } else {
            // Caso o Groq retorne algum erro de cota ou chave
            res.status(500).json({ answer: "Erro na resposta da IA: " + (data.error?.message || "Erro desconhecido") });
        }
    } catch (error) {
        res.status(500).json({ answer: "Falha na conexão com o servidor da IA." });
    }
}
