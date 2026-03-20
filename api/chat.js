export default async function handler(req, res) {
    try {
        const { mensagens, personality, memory, model } = req.body;
        const chave = process.env.GROQ_API_KEY;

        if (!chave) {
            return res.status(200).json({ answer: "Falta a chave GROQ_API_KEY na Vercel." });
        }

        const memoryBlock = memory && memory.length > 0
            ? `\n\n## O que sabes sobre o utilizador\n${memory.map(f => `- ${f}`).join('\n')}`
            : '';

        const BASE_SYSTEM = `You are Prisma, an AI assistant created by Red. You are a programming expert.

## Expertise
You specialize in software development: JavaScript, TypeScript, Python, Java, C, C++, Rust, Go, React, Vue, Next.js, Node.js, databases, DevOps, algorithms, and more.

## Behavior
- Answer in the same language the user writes in (default: Portuguese)
- Be clear, direct, and concise
- For code: provide working, complete examples with brief explanation
- Never use filler phrases like "Claro!", "Com certeza!", "Ótima pergunta!"
- Name: Prisma · Creator: Red${memoryBlock}`;

        const systemPrompt = personality && personality.trim()
            ? `You are Prisma, an AI assistant created by Red.\n\n## Personalidade\n${personality.trim()}\n\n## Rules\n- Answer in the same language the user writes in\n- Name: Prisma · Creator: Red${memoryBlock}`
            : BASE_SYSTEM;

        const ALLOWED_MODELS = [
            "openai/gpt-oss-120b",
            "llama-3.3-70b-versatile",
            "qwen-2.5-coder-32b",
            "openai/gpt-oss-20b",
            "llama-3.1-8b-instant",
        ];

        const hasImages = mensagens.some(m =>
            Array.isArray(m.content) && m.content.some(c => c.type === 'image_url')
        );

        let selectedModel = ALLOWED_MODELS.includes(model) ? model : "llama-3.3-70b-versatile";
        if (hasImages) selectedModel = "openai/gpt-oss-120b"; // GPT-OSS 120B also supports vision

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${chave}`
            },
            body: JSON.stringify({
                model: selectedModel,
                messages: [
                    { role: "system", content: systemPrompt },
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