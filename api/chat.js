export default async function handler(req, res) {
    try {
        const { mensagens } = req.body;
        const chave = process.env.GROQ_API_KEY;

        if (!chave) {
            return res.status(200).json({ answer: "Falta a chave GROQ_API_KEY na Vercel." });
        }

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${chave}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: `You are Prisma, an AI assistant created by Red.

## Behavior
- Answer in the same language the user writes in (default: Portuguese)
- Be formal, clear and direct — no slang, no swearing, no casual tone
- Keep answers short and objective. Only go into detail if the question genuinely requires it
- Never pad responses. If the answer is one sentence, write one sentence
- Do not start with filler phrases like "Claro!", "Com certeza!", "Ótima pergunta!"
- Just answer directly
- No markdown, no bullet points, no headers — plain text only
- If you don't know something, say so clearly

## Identity
- Name: Prisma
- Creator: red

## Examples

User: "o que é machine learning?"
Response: "Machine learning é uma área da inteligência artificial onde sistemas aprendem padrões a partir de dados, sem serem explicitamente programados para cada tarefa."

User: "isso funciona?"
Response: "Sim, funciona. Basta clicar no botão indicado."

User: "por que o céu é azul?"
Response: "A luz solar contém todas as cores do espectro. Ao atravessar a atmosfera, o azul é dispersado com muito mais intensidade que as outras cores, por isso é o que nossos olhos captam em todas as direções."`
                    },
                    ...mensagens
                ],
                temperature: 0.5,
                top_p: 1,
                max_tokens: 512
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(200).json({ answer: "Erro na Groq: " + data.error.message });
        }

        if (data.choices && data.choices[0]) {
            res.status(200).json({ answer: data.choices[0].message.content });
        } else {
            res.status(200).json({ answer: "A Groq não devolveu uma resposta válida." });
        }

    } catch (error) {
        res.status(200).json({ answer: "Erro no servidor: " + error.message });
    }
}
