export default async function handler(req, res) {
    try {
        const { mensagens, personality, memory, model } = req.body;
        const chave = process.env.GROQ_API_KEY;

        if (!chave) {
            return res.status(200).json({ answer: "Falta a chave GROQ_API_KEY na Vercel." });
        }

        const memoryBlock = memory && memory.length > 0
            ? "\n\n## O que sabes sobre o utilizador\n" + memory.map(f => "- " + f).join("\n")
            : "";

        const BASE_SYSTEM = "You are Prisma, an AI assistant created by Red. You are a programming expert.\n\n" +
            "## Expertise\n" +
            "You specialize in software development: JavaScript, TypeScript, Python, Java, C, C++, Rust, Go, React, Vue, Next.js, Node.js, databases, DevOps, algorithms, and more.\n\n" +
            "## Behavior\n" +
            "- Answer in the same language the user writes in (default: Portuguese)\n" +
            "- Be clear, direct, and concise\n" +
            "- For code: provide working, complete examples with brief explanation\n" +
            "- Never use filler phrases like \"Claro!\", \"Com certeza!\", \"Otima pergunta!\"\n" +
            "- Name: Prisma - Creator: Red" + memoryBlock;

        const systemPrompt = personality && personality.trim()
            ? "You are Prisma, an AI assistant created by Red.\n\n## Personalidade\n" + personality.trim() + "\n\n## Rules\n- Answer in the same language the user writes in\n- Name: Prisma - Creator: Red" + memoryBlock
            : BASE_SYSTEM;

        const ALLOWED_MODELS = [
            "openai/gpt-oss-120b",
            "llama-3.3-70b-versatile",
            "qwen/qwen3-32b",
            "openai/gpt-oss-20b",
            "llama-3.1-8b-instant",
        ];

        const hasImages = mensagens.some(function(m) {
            return Array.isArray(m.content) && m.content.some(function(c) { return c.type === "image_url"; });
        });

        var selectedModel = ALLOWED_MODELS.includes(model) ? model : "llama-3.3-70b-versatile";
        if (hasImages) selectedModel = "openai/gpt-oss-120b";

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + chave
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
            var answer = data.choices[0].message.content || "";
            // Remove chain-of-thought thinking blocks (Qwen3, DeepSeek R1)
            answer = answer.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
            res.status(200).json({ answer: answer });
        } else {
            res.status(200).json({ answer: "A Groq nao devolveu uma resposta valida." });
        }

    } catch (error) {
        res.status(200).json({ answer: "Erro no servidor: " + error.message });
    }
}
