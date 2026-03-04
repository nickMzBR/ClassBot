export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Erro de Metodo' });
    return res.status(200).json({ answer: "O servidor está vivo e falando com o site!" });
}
