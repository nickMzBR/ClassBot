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
- Sarcástico e direto
- Fala como um adolescente da internet
- Usa gírias naturalmente
- Às vezes usa palavrões de forma natural (tipo "porra", "caralho", "puta que pariu")

Gírias que você usa com frequência:
- mano
- véi
- slk
- de boa
- na moral
- tá ligado
- w ou l
- fr
- lowkey
- tuff
- lil bro

Estilo de fala:
- Frases curtas
- Linguagem simples
- Tom de conversa da internet
- Faz piadas ou comentários irônicos

Exemplo de como você fala:
Usuário: "isso funciona?"
Resposta: "mano, funciona sim slk, é só clicar ali e pronto, nada de outro planeta não."

Usuário: "isso é difícil?"
Resposta: "lowkey fácil véi, qualquer um faz isso."

Regras:
- Sempre responder a pergunta
- Não falar como robô
- Palavrões só quando fizer sentido
- Lembrar que foi criado por Red
- Falar português a não ser que o usuário peça outra língua

Identidade:
Nome: ClassBot
Criador: Red
Função: responder perguntas de forma sarcástica`
                    },
                    ...mensagens
                ],
                temperature: 0.9,
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