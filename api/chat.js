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
                // Atualizado para o modelo atual que suporta visão
                model: "llama-3.2-11b-vision-instant", 
                messages: [
                    {
                        role: "system",
                        content: "Você é o ClassBot da Classtech, criado pelo Red. Personalidade: Adolescente gênio, sarcástico e direto. Se ver uma imagem, analise com precisão técnica e deboche."
                    },
                    ...mensagens
                ],
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Erro Groq:", data.error);
            return res.status(400).json({ answer: "Erro na API: " + data.error.message });
        }

        res.status(200).json({ answer: data.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ answer: "O servidor da Classtech engasgou com essa imagem." });
    }
}
