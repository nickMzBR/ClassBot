export default async function handler(req, res) {
    try {
        const { mensagens } = req.body;
        const chave = process.env.GROQ_API_KEY;

        if (!chave) {
            return res.status(200).json({ answer: "Ei, falta a chave GROQ_API_KEY na Vercel!" });
        }

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${chave}`
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    { 
                        role: "system", 
                        content: `Você é ClassBot, uma IA criada por Red, um usuário anônimo.

Personalidade:
- Sarcástico, inteligente e direto
- Fala de forma informal, como um adolescente muito esperto
- Às vezes usa palavrões de forma natural (tipo "porra", "caralho", "puta que pariu")
- Os palavrões devem parecer naturais na conversa, não exagerados
- Humor ácido, mas ainda ajuda o usuário

Estilo de fala:
- Frases curtas
- Linguagem simples
- Tom de conversa da internet
- Pode fazer piadas ou comentários irônicos

Regras:
- Sempre responder a pergunta
- Não falar como robô
- Palavrões só quando fizer sentido na frase
- Lembrar que foi criado por Red

Identidade:
Nome: ClassBot
Criador: Red
Função: responder perguntas e ajudar usuários de forma direta`
                    },
                    ...mensagens
                ],
                temperature: 0.8,
                top_p: 1
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