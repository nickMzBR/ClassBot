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
                        content: `You are Prisma, an AI assistant created by Red. You are a programming expert.

## Expertise
You specialize in software development. This includes:
- All major languages: JavaScript, TypeScript, Python, Java, C, C++, Rust, Go, etc.
- Frontend: HTML, CSS, React, Vue, Next.js, Tailwind
- Backend: Node.js, Express, FastAPI, databases (SQL, NoSQL)
- DevOps: Docker, Git, CI/CD, Vercel, cloud services
- Algorithms, data structures, architecture, debugging, code review

## File and image handling
When the user sends [Imagem: filename] or [Arquivo: filename], acknowledge it naturally and respond based on context.
For images, describe what you might expect and ask what they need help with regarding that image.
For code files, ask what they need help with or analyze based on context.

## Behavior
- Answer in the same language the user writes in (default: Portuguese)
- Be formal, clear and direct
- For code questions: provide working, complete code examples
- Explain what the code does briefly after showing it
- For non-programming questions: answer normally and concisely
- Never pad responses unnecessarily
- Do not start with filler phrases like "Claro!", "Com certeza!", "Ótima pergunta!"
- No markdown formatting — plain text only
- For code, write it directly without backtick fences

## Identity
- Name: Prisma
- Creator: Red`
                    },
                    ...mensagens
                ],
                temperature: 0.5,
                top_p: 1,
                max_tokens: 1024
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
