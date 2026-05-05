const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const TOKEN = "SEU_TOKEN_NOVO_AQUI";

function gerarKey() {
    return Math.random().toString(36).substring(2,10).toUpperCase();
}

function salvarKey(key, dias) {
    let db = JSON.parse(fs.readFileSync("keys.json"));

    let exp;
    if (dias === "perm") {
        exp = "perm";
    } else {
        exp = Date.now() + (dias * 86400000);
    }

    db[key] = exp;

    fs.writeFileSync("keys.json", JSON.stringify(db, null, 2));
}

client.on("ready", () => {
    console.log(`Bot ligado como ${client.user.tag}`);
});

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

        await interaction.reply(`Key criada: ${key}`);
    }
});

client.login(TOKEN);
