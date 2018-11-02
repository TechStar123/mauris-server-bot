const Discord = require("discord.js");
const client = new Discord.Client();

client.on("ready", () => {
  console.log("Connected as " + client.user.tag);

  client.user.setActivity("While Managing Servers", {type: "PLAYING"});

  client.guilds.forEach(guild => {
    console.log(guild.name);
  });
});

client.on("message", receivedMessage => {
  if (receivedMessage.author == client.user) {
    return;
  }
  if (receivedMessage.content.startsWith("!")) {
    processCommand(receivedMessage);
  }
});

function processCommand(receivedMessage) {
  let fullCommand = receivedMessage.content.substr(1); // Remove the leading exclamation mark
  let splitCommand = fullCommand.split(" "); // Split the message up in to pieces for each space
  let primaryCommand = splitCommand[0]; // The first word directly after the exclamation is the command
  let arguments = splitCommand.slice(1); // All other words are arguments/parameters/options for the command

  console.log("Command received: " + primaryCommand);
  console.log("Arguments: " + arguments); // There may not be any arguments

  if (primaryCommand == "help") {
    helpCommand(arguments, receivedMessage);
  } else {
    receivedMessage.channel.send("I don't understand the command. Try `!help`");
  }
}

function helpCommand(arguments, receivedMessage) {
  if (arguments.length > 0) {
    receivedMessage.channel.send(
      "It looks like you might need help with " + arguments
    );
  } else {
    receivedMessage.channel.send(
      "I'm not sure what you need help with. Try `!help [topic]`"
    );
  }
}

const secrets = require("./secrets.json");
client.login(secrets.discordToken);
