const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");

// 🔐 TOKEN VIA RAILWAY (NÃO COLOCAR NO CÓDIGO)
const TOKEN = process.env.TOKEN;

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// 🔑 GERAR KEY
function gerarKey() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// 📂 LER BANCO
function lerDB() {
    try {
        return JSON.parse(fs.readFileSync("key.json"));
    } catch {
        return {};
    }
}

// 💾 SALVAR KEY
function salvarKey(key, dias) {
    let db = lerDB();

    let exp;
    if (dias === "perm") {
        exp = "perm";
    } else {
        exp = Date.now() + (dias * 86400000);
    }

    db[key] = exp;

    fs.writeFileSync("key.json", JSON.stringify(db, null, 2));
}

// 🚀 BOT ONLINE
client.on("ready", () => {
    console.log(`Bot ligado como ${client.user.tag}`);
});

// 🎮 COMANDOS
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "key") {
        const tipo = interaction.options.getString("tipo");

        let dias = 1;
        if (tipo === "3dias") dias = 3;
        if (tipo === "mensal") dias = 30;
        if (tipo === "perm") dias = "perm";

        const key = gerarKey();
        salvarKey(key, dias);

        await interaction.reply(`✅ Key criada: ${key}`);
    }

    // ❌ REMOVER KEY
    if (interaction.commandName === "remover") {
        const key = interaction.options.getString("key");

        let db = lerDB();

        if (!db[key]) {
            return interaction.reply("❌ Key não encontrada");
        }

        delete db[key];

        fs.writeFileSync("key.json", JSON.stringify(db, null, 2));

        await interaction.reply(`🗑️ Key removida: ${key}`);
    }
});

// 🔥 LOGIN
client.login(TOKEN);
