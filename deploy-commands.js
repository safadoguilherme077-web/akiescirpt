const { REST, Routes, SlashCommandBuilder } = require("discord.js");

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
        )
];

const rest = new REST({ version: "10" }).setToken("SEU_TOKEN");

(async () => {
    await rest.put(
        Routes.applicationCommands("SEU_CLIENT_ID"),
        { body: commands }
    );
    console.log("Comandos registrados!");
})();
