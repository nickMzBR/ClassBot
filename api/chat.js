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
                model: "llama-3.2-11b-vision-preview", 
                messages: [
                    {
                        role: "system",
                        content: "Você é o ClassBot da Classtech. Adolescente gênio e sarcástico. Analise imagens com deboche."
                    },
                    ...mensagens
                ],
                temperature: 0.7,
                max_tokens: 1024 // Importante definir para respostas com imagem
            })
        });

        const data = await response.json();

        // Se o Groq retornar erro (ex: imagem muito grande ou API key)
        if (data.error) {
            console.error("Erro da API Groq:", data.error);
            return res.status(400).json({ answer: "O Groq reclamou de algo: " + data.error.message });
        }

        res.status(200).json({ answer: data.choices[0].message.content });
    } catch (error) {
        console.error("Erro no Servidor:", error);
        res.status(500).json({ answer: "Deu pau no servidor. Provavelmente a imagem é pesada demais." });
    }
}
