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
                model: "llama-3.2-11b-vision-preview", // Modelo que aceita imagem
                messages: [
                    {
                        role: "system",
                        content: `Você é o ClassBot, criado pela Classtech (fundada por Red). 
                        Personalidade: Adolescente gênio, sarcástico, inteligente e direto. 
                        Se receber uma imagem, analise-a com precisão, mas mantenha o deboche sobre o que está vendo.`
                    },
                    ...mensagens
                ],
                temperature: 0.7 // Temperatura ajustada conforme pedido
            })
        });

        const data = await response.json();
        res.status(200).json({ answer: data.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ answer: "Erro ao processar sua imagem ou texto." });
    }
}