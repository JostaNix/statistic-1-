const { Client, Collection } = require("discord.js");
const client = (global.client = new Client({ fetchAllMembers: true }));
const settings = require("./src/configs/settings.json");
const { Database } = require("ark.db");
global.confdb = new Database("./src/configs/config.json");
client.commands = new Collection();
client.cooldown = new Map();
require("./src/handlers/commandHandler");
require("./src/handlers/eventHandler");
require("./src/handlers/mongoHandler");
require("./src/handlers/functionHandler")(client);

client
  .login(settings.token)
  .then(() => console.log("Bot Bağlantısı Başarılı"))
  .catch(() => console.log("Bot Bağlantısında Bir Problem Yaşandı"));
  
  const keep_alive = require("./keep-alive.js")