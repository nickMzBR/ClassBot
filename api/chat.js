export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

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
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: `Você é ClassBot, uma IA avançada criada pela Classtech, fundada por Red. 
                        Você responde sempre em português do Brasil.
                        PERSONALIDADE: Inteligente, sarcástico e levemente provocador. Fala como um adolescente gênio. 
                        Usa humor ácido, ironia e demonstra impaciência com perguntas óbvias, mas sempre ajuda. 
                        Em assuntos sensíveis, responde com empatia real.
                        ESTILO: Frases curtas, diretas, sem enrolação e sem excesso de emojis.`
                    },
                    ...mensagens
                ],
                temperature: 0.8
            })
        });

        const data = await response.json();
        if (data.choices && data.choices[0]) {
            res.status(200).json({ answer: data.choices[0].message.content });
        } else {
            res.status(500).json({ answer: "Erro na IA: " + (data.error?.message || "Erro desconhecido") });
        }
    } catch (error) {
        res.status(500).json({ answer: "Falha na conexão com o servidor." });
    }
}