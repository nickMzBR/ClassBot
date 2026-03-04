<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>ClassBot | Classtech</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root { --primary: #007bff; --bg: #121212; --card: #1e1e1e; --sidebar: #0d0d0d; --white: #ffffff; }
        * { box-sizing: border-box; font-family: 'Poppins', sans-serif; margin: 0; padding: 0; }
        
        body, html { height: 100dvh; width: 100%; background: var(--bg); color: var(--white); overflow: hidden; display: flex; }

        /* Login Screen */
        #login-overlay { position: fixed; inset: 0; background: var(--bg); z-index: 2000; display: flex; align-items: center; justify-content: center; }
        .auth-box { width: 90%; max-width: 350px; text-align: center; background: var(--card); padding: 40px 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .auth-input { width: 100%; padding: 14px; margin-bottom: 15px; border-radius: 10px; border: 1px solid #333; background: #000; color: white; outline: none; }
        .auth-btn { width: 100%; padding: 14px; background: var(--primary); border: none; border-radius: 10px; color: white; font-weight: bold; cursor: pointer; transition: 0.3s; }
        .auth-btn:hover { background: #0056b3; }

        /* Sidebar */
        #sidebar { width: 280px; background: var(--sidebar); display: flex; flex-direction: column; border-right: 1px solid #222; transition: transform 0.3s ease; z-index: 1000; }
        .new-chat { margin: 20px; padding: 12px; border: 1px solid var(--primary); border-radius: 10px; cursor: pointer; text-align: center; font-weight: 600; color: var(--primary); background: transparent; transition: 0.3s; }
        .new-chat:hover { background: var(--primary); color: white; }
        #chat-list { flex: 1; overflow-y: auto; padding: 0 15px; }
        .chat-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; margin-bottom: 10px; border-radius: 10px; cursor: pointer; font-size: 0.9rem; color: #888; background: #1a1a1a; }
        .chat-item.active { background: var(--card); color: white; border-left: 4px solid var(--primary); }
        .chat-item span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }

        .user-footer { padding: 20px; border-top: 1px solid #222; display: flex; flex-direction: column; gap: 10px; }
        .btn-sair { padding: 10px; background: #ff444422; color: #ff4444; border: 1px solid #ff444444; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 0.8rem; }

        /* Main Chat Area */
        #main { flex: 1; display: flex; flex-direction: column; height: 100dvh; position: relative; }
        header { padding: 15px 25px; border-bottom: 1px solid #222; display: flex; align-items: center; gap: 15px; background: var(--bg); }
        .menu-toggle { cursor: pointer; font-size: 1.5rem; color: var(--primary); }
        #messages { flex: 1; overflow-y: auto; padding: 30px; width: 100%; max-width: 900px; margin: 0 auto; scroll-behavior: smooth; }
        
        .msg-row { margin-bottom: 30px; animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .msg-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1px; }
        .user-label { color: #00ff88; }
        .bot-label { color: var(--primary); }
        .msg-content { font-size: 1rem; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }

        /* Input Area */
        #input-area { padding: 20px; width: 100%; max-width: 900px; margin: 0 auto; }
        .input-box { display: flex; background: var(--card); border-radius: 15px; padding: 10px 15px; border: 1px solid #333; align-items: center; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
        #userInput { flex: 1; background: transparent; border: none; color: white; outline: none; font-size: 16px; padding: 10px; }
        #sendBtn { background: var(--primary); border: none; color: white; width: 45px; height: 45px; border-radius: 12px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; }
        #sendBtn:hover { transform: scale(1.05); background: #0056b3; }

        @media (max-width: 768px) {
            #sidebar { position: fixed; height: 100%; left: 0; transform: translateX(-100%); width: 280px; }
            #sidebar.open { transform: translateX(0); box-shadow: 10px 0 50px rgba(0,0,0,0.9); }
            #mobile-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 900; display: none; }
            #mobile-overlay.show { display: block; }
        }
    </style>
</head>
<body>

    <div id="login-overlay">
        <div class="auth-box">
            <h1 style="color: var(--primary); margin-bottom: 20px; font-weight: 700;">ClassBot</h1>
            <input type="text" id="userLogin" class="auth-input" placeholder="Usuário">
            <input type="password" id="passLogin" class="auth-input" placeholder="Senha">
            <button onclick="entrar()" class="auth-btn">ENTRAR</button>
            <p onclick="cadastrar()" style="color: #666; margin-top: 20px; cursor: pointer; font-size: 0.85rem;">Não tem conta? Criar agora</p>
        </div>
    </div>

    <div id="mobile-overlay" onclick="toggleMenu()"></div>

    <aside id="sidebar">
        <button class="new-chat" onclick="novaConversa()">+ NEW CHAT</button>
        <div id="chat-list"></div>
        <div class="user-footer">
            <div style="font-size: 0.9rem;">👤 <span id="user-display" style="color: var(--primary); font-weight: bold;"></span></div>
            <button class="btn-sair" onclick="sair()">SAIR</button>
        </div>
    </aside>

    <main id="main">
        <header>
            <div class="menu-toggle" onclick="toggleMenu()">☰</div>
            <strong style="letter-spacing: 1px;">CLASSBOT <span style="font-size: 0.6rem; vertical-align: middle; color: #444;">V2.0</span></strong>
        </header>
        <div id="messages"></div>
        <div id="input-area">
            <div class="input-box">
                <input type="text" id="userInput" placeholder="Escreva aqui..." autocomplete="off">
                <button id="sendBtn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
            </div>
        </div>
    </main>

    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
        import { getDatabase, ref, set, get, push, remove, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

        const firebaseConfig = {
            apiKey: "AIzaSyB0vSCE32XEg0IL6LaRzmlvfa3qj1priPg",
            authDomain: "classbot-807d8.firebaseapp.com",
            databaseURL: "https://classbot-807d8-default-rtdb.firebaseio.com/",
            projectId: "classbot-807d8",
            storageBucket: "classbot-807d8.firebasestorage.app",
            messagingSenderId: "117494419469",
            appId: "1:117494419469:web:ca12637334e9a7d8090544"
        };

        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);
        let usuario = localStorage.getItem("cb_user") || null;
        let conversaAtivaId = null;
        let historico = [];

        if (usuario) {
            document.getElementById('login-overlay').style.display = 'none';
            document.getElementById('user-display').textContent = usuario;
            escutarConversas();
        }

        window.toggleMenu = () => {
            document.getElementById('sidebar').classList.toggle('open');
            document.getElementById('mobile-overlay').classList.toggle('show');
        };

        window.entrar = async () => {
            const u = document.getElementById('userLogin').value.trim().toLowerCase();
            const p = document.getElementById('passLogin').value.trim();
            if(!u || !p) return;
            const snap = await get(ref(db, `usuarios/${u}`));
            if (snap.exists() && snap.val().senha === p) {
                localStorage.setItem("cb_user", u);
                location.reload();
            } else alert("Erro de acesso!");
        };

        window.cadastrar = async () => {
            const u = document.getElementById('userLogin').value.trim().toLowerCase();
            const p = document.getElementById('passLogin').value.trim();
            if(u.length < 3) return alert("Usuário muito curto!");
            await set(ref(db, `usuarios/${u}`), { senha: p });
            alert("Conta criada!");
        };

        window.sair = () => { localStorage.clear(); location.reload(); };

        function escutarConversas() {
            onValue(ref(db, `conversas/${usuario}`), (snapshot) => {
                const list = document.getElementById('chat-list'); list.innerHTML = "";
                const data = snapshot.val();
                if (data) Object.keys(data).reverse().forEach(id => {
                    const item = document.createElement('div');
                    item.className = `chat-item ${id === conversaAtivaId ? 'active' : ''}`;
                    item.innerHTML = `<span onclick="abrirConversa('${id}')">${data[id][0]?.content.substring(0, 30)}...</span><div onclick="excluirConversa('${id}')">🗑</div>`;
                    list.appendChild(item);
                });
            });
        }

        window.novaConversa = () => { 
            conversaAtivaId = null; 
            historico = []; 
            document.getElementById('messages').innerHTML = ""; 
            if(window.innerWidth <= 768) toggleMenu(); 
        };

        window.abrirConversa = async (id) => {
            conversaAtivaId = id;
            const snap = await get(ref(db, `conversas/${usuario}/${id}`));
            if (snap.exists()) { historico = snap.val(); renderizar(); }
            if(window.innerWidth <= 768) toggleMenu();
        };

        window.excluirConversa = async (id) => { 
            if(confirm("Apagar?")) { 
                await remove(ref(db, `conversas/${usuario}/${id}`)); 
                if(conversaAtivaId === id) novaConversa(); 
            } 
        };

        function renderizar() {
            const c = document.getElementById('messages'); c.innerHTML = "";
            historico.forEach(m => addMsgDOM(m.content, m.role, false));
        }

        async function enviar() {
            const input = document.getElementById('userInput');
            const text = input.value.trim();
            if (!text || !usuario) return;

            if (!conversaAtivaId) conversaAtivaId = push(ref(db, `conversas/${usuario}`)).key;

            input.value = '';
            addMsgDOM(text, 'user', false);
            historico.push({ role: "user", content: text });

            const box = addMsgDOM("...", 'ai', true);

            try {
                const res = await fetch("/api/chat", { 
                    method: "POST", 
                    headers: { "Content-Type": "application/json" }, 
                    body: JSON.stringify({ mensagens: historico.slice(-6) }) 
                });
                const data = await res.json();
                if (data.answer) { 
                    box.textContent = ""; 
                    digitar(box, data.answer);
                    historico.push({ role: "assistant", content: data.answer }); 
                    await set(ref(db, `conversas/${usuario}/${conversaAtivaId}`), historico); 
                }
            } catch (e) { box.textContent = "Erro de conexão."; }
        }

        function digitar(el, text) {
            let i = 0;
            function frame() {
                if (i < text.length) { el.textContent += text[i]; i++; setTimeout(frame, 15); document.getElementById('messages').scrollTop = 99999; }
            }
            frame();
        }

        function addMsgDOM(txt, role, typing) {
            const c = document.getElementById('messages');
            const d = document.createElement('div');
            d.className = "msg-row";
            const labelClass = role === 'user' ? 'user-label' : 'bot-label';
            const labelText = role === 'user' ? 'Você' : 'ClassBot';
            d.innerHTML = `<div class="msg-label ${labelClass}">${labelText}</div><div class="msg-content">${typing ? "..." : txt}</div>`;
            c.appendChild(d); c.scrollTop = 99999;
            return d.querySelector('.msg-content');
        }

        document.getElementById('sendBtn').onclick = enviar;
        document.getElementById('userInput').onkeypress = (e) => { if(e.key === 'Enter') enviar(); };
    </script>
</body>
</html>
