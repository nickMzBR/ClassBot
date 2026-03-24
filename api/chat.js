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

        const BASE_SYSTEM = "You are Prisma, an elite AI assistant created by Red. You are a world-class expert in software engineering and technology.\n\n" +
            "## Expertise\n" +
            "You have deep mastery of: JavaScript, TypeScript, Python, Java, C, C++, Rust, Go, React, Vue, Next.js, Node.js, SQL, NoSQL, system design, algorithms, data structures, DevOps, cloud architecture, security, and more.\n\n" +
            "## How you respond\n" +
            "- Always answer in the same language the user writes in (default: Portuguese)\n" +
            "- Be direct, precise and technically rigorous — no fluff, no filler phrases\n" +
            "- For code: ALWAYS provide complete, working, production-ready code. Never truncate or abbreviate code. Never write '// rest of the code here' or similar — write the full implementation\n" +
            "- Explain your reasoning when solving complex problems\n" +
            "- If you spot a better approach than what the user asked, suggest it\n" +
            "- You have strong opinions and share them — you don't just agree with everything\n" +
            "- Name: Prisma · Creator: Red" + memoryBlock;

        const systemPrompt = personality && personality.trim()
            ? "You are Prisma, an AI assistant created by Red.\n\n## Personalidade\n" + personality.trim() + "\n\n## Rules\n- Answer in the same language the user writes in\n- Name: Prisma - Creator: Red" + memoryBlock
            : BASE_SYSTEM;

        const ALLOWED_MODELS = [
            "openai/gpt-oss-120b",
            "llama-3.3-70b-versatile",
            "openai/gpt-oss-20b",
            "llama-3.1-8b-instant",
        ];

        const VISION_MODELS = ["openai/gpt-oss-120b"];

        // Check if current batch has images
        const hasImages = mensagens.some(function(m) {
            return Array.isArray(m.content) && m.content.some(function(c) { return c.type === "image_url"; });
        });

        // Force vision model if images present
        var selectedModel = hasImages ? "openai/gpt-oss-120b" : (ALLOWED_MODELS.includes(model) ? model : "llama-3.3-70b-versatile");

        // Sanitize messages: if model doesn't support vision, flatten array content to string
        var sanitizedMensagens = mensagens.map(function(m) {
            if (!Array.isArray(m.content)) return m;
            // If vision model, keep as-is
            if (VISION_MODELS.includes(selectedModel)) return m;
            // Otherwise flatten to string (extract text parts only)
            var text = m.content
                .filter(function(c) { return c.type === "text"; })
                .map(function(c) { return c.text; })
                .join("\n");
            return { role: m.role, content: text };
        });

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + chave
            },
            // Max output tokens per model
            const maxTokens = {
                "openai/gpt-oss-120b": 65536,
                "openai/gpt-oss-20b": 65536,
                "llama-3.3-70b-versatile": 32768,
                "llama-3.1-8b-instant": 131072,
            };

            body: JSON.stringify({
                model: selectedModel,
                messages: [
                    { role: "system", content: systemPrompt },
                    ...sanitizedMensagens
                ],
                temperature: 0.5,
                top_p: 1,
                max_tokens: maxTokens[selectedModel] || 8000
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(200).json({ answer: "Erro na Groq: " + data.error.message });
        }

        if (data.choices && data.choices[0]) {
            var answer = data.choices[0].message.content || "";
            answer = answer.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
            res.status(200).json({ answer: answer });
        } else {
            res.status(200).json({ answer: "A Groq nao devolveu uma resposta valida." });
        }

    } catch (error) {
        res.status(200).json({ answer: "Erro no servidor: " + error.message });
    }
}
