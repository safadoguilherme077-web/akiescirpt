const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const express = require("express");

// 🔐 CONFIG
const TOKEN = process.env.TOKEN;
const CLIENT_ID = "1501071462667391037";
const GUILD_ID = "1501054844469772439";

// 🌐 API
const app = express();
const PORT = process.env.PORT || 3000;

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});


// ---------------------------------------------------
// 🔑 BANCO DE KEYS
// ---------------------------------------------------

function gerarKey() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function lerDB() {
    try {
        return JSON.parse(fs.readFileSync("key.json"));
    } catch {
        return {};
    }
}

function salvarDB(db) {
    fs.writeFileSync("key.json", JSON.stringify(db, null, 2));
}

function salvarKey(key, dias) {
    let db = lerDB();

    let exp;
    if (dias === "perm") {
        exp = "perm";
    } else {
        exp = Date.now() + (dias * 86400000);
    }

    db[key] = exp;
    salvarDB(db);
}


// ---------------------------------------------------
// 🌐 ROTA PRA ROBLOX (ESSENCIAL)
// ---------------------------------------------------

app.get("/keys", (req, res) => {
    const db = lerDB();
    res.json(db);
});

app.listen(PORT, () => {
    console.log(`🌍 API rodando na porta ${PORT}`);
});


// ---------------------------------------------------
// 📡 COMANDOS
// ---------------------------------------------------

const commands = [

    new SlashCommandBuilder()
        .setName("key")
        .setDescription("Gerar key")
        .addStringOption(option =>
            option.setName("tipo")
                .setDescription("Tipo da key")
                .setRequired(true)
                .addChoices(
                    { name: "diaria", value: "diaria" },
                    { name: "3dias", value: "3dias" },
                    { name: "mensal", value: "mensal" },
                    { name: "perm", value: "perm" }
                )
        ),

    new SlashCommandBuilder()
        .setName("remover")
        .setDescription("Remover key")
        .addStringOption(option =>
            option.setName("key")
                .setDescription("Key para remover")
                .setRequired(true)
        )

].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

async function deployCommands() {
    try {
        console.log("🔄 Registrando comandos...");

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
        );

        console.log("✅ Comandos registrados!");
    } catch (err) {
        console.error(err);
    }
}


// ---------------------------------------------------
// 🚀 BOT ONLINE
// ---------------------------------------------------

client.on("clientReady", async () => {
    console.log(`🤖 Bot ligado como ${client.user.tag}`);
    await deployCommands();
});


// ---------------------------------------------------
// 🎮 COMANDOS
// ---------------------------------------------------

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // 🔑 GERAR KEY
    if (interaction.commandName === "key") {
        const tipo = interaction.options.getString("tipo");

        let dias = 1;
        if (tipo === "3dias") dias = 3;
        if (tipo === "mensal") dias = 30;
        if (tipo === "perm") dias = "perm";

        const key = gerarKey();
        salvarKey(key, dias);

        await interaction.reply(
            `🔑 **Aqui está sua key:** \`${key}\`\n👤 ID: ${interaction.user.id}`
        );
    }

    // ❌ REMOVER KEY
    if (interaction.commandName === "remover") {
        const key = interaction.options.getString("key");

        let db = lerDB();

        if (!db[key]) {
            return interaction.reply("❌ Key não encontrada");
        }

        delete db[key];
        salvarDB(db);

        await interaction.reply(`🗑️ Key removida: ${key}`);
    }
});


// ---------------------------------------------------
// 🔥 LOGIN
// ---------------------------------------------------

client.login(TOKEN);
