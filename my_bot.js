const Discord = require("discord.js");
const commandFramework = require("./src/core/commandFramework");
const utils = require("./src/core/utils");
const secrets = require("./secrets.json");

const client = new Discord.Client();

client.login(secrets.discordToken).then(function() {
  console.log("Connected as " + client.user.tag);

  client.user.setActivity("While Managing Servers", {type: "PLAYING"});
});

client.login(secrets.discordToken);

commandFramework.setup(client);

module.exports = client;

process.on("unhandledRejection", function(err) {
  throw err;
});
