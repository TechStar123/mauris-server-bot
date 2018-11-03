const {client} = require("../../my_bot.js");
const prefix = "!";
const fs = require("fs-extra");
const secrets = require("../../secrets.json");

const commandGroups = {};

async function setup(client) {
  const commandGroupFiles = await fs.readdir("src/cmds");
  for (const commandGroupFile of commandGroupFiles) {
    // Emacs turds
    if (commandGroupFile.endsWith(".js") && !commandGroupFile.startsWith("#"))
      // Chop last 3 characters off (.js)
      await loadGroup(client, commandGroupFile.slice(0, -3));
  }
  client.on("message", onMessage);
}

async function loadGroup(client, commandGroupFile) {
  try {
    const group = require(`../cmds/${commandGroupFile}`);
    if (group.hooks) {
      for (const eventName in hooks) {
        switch (eventName) {
          case "load": {
            await hooks.load(client);
            break;
          }
          case "unload": {
            break;
          }
          default: {
            client.on(eventName, hooks[eventName]);
          }
        }
      }
    }

    commandGroups[commandGroupFile] = group;
  } catch (err) {
    console.error(
      `Error loading ${commandGroupFile}! Continuing without it loaded!`,
      err
    );
  }
}

async function unloadGroup(client, commandGroupFile) {
  const commandGroup = commandGroups[commandGroupFile];
  if (commandGroup) {
    for (const eventName in commandGroup.hooks) {
      switch (eventName) {
        case "load": {
          break;
        }
        case "unload": {
          await hooks.unload(client);
          break;
        }
        default: {
          client.removeListener(eventName, hooks[eventName]);
        }
      }
    }
    delete commandGroups[commandGroupFile];
  }
  delete require.cache[require.resolve(commandGroupFile)];
}

async function onMessage(msg) {
  // not us!
  if (!msg.content.startsWith(prefix)) return;

  let command = null;

  const args = argsParse(msg.content.substring(prefix.length), prefix);
  const commandName = args[0];

  for (const commandGroup in commandGroups) {
    // I don't like this but oh well
    if (command !== null) break;
    for (const potentialCommand of commandGroups[commandGroup].commands) {
      const isMatch = Array.isArray(potentialCommand.trigger)
        ? potentialCommand.trigger.includes(commandName)
        : potentialCommand.trigger === commandName;
      if (isMatch) {
        command = potentialCommand;
        break;
      }
    }
  }

  if (!command) return;

  const permissionMessage = permissionCheck(command, msg);
  if (permissionMessage instanceof String)
    await msg.channel.send(permissionMessage);
  if (permissionMessage) return;

  msg.args = args;
  msg.suffix = msg.content.substring(prefix.length + commandName.length);
  msg.prefix = prefix;

  try {
    await command.execute(msg);
  } catch (err) {
    await msg.channel.send(
      "An unexpected error occurred while running that command!"
    );
    console.error("Fatal error encountered!", err);
  }
}

function permissionCheck(command, msg) {
  if (command.adminOnly && !secrets.admins.includes(msg.author.id)) {
    return true;
  }

  if ((command.guildOnly || command.permissions) && !msg.guild) {
    return "This command doesn't work in DMs!";
  }

  if (command.permissions) {
    const missing = msg.member.permissions.missing(command.permissions);
    if (missing.length) return;
    `Missing permissions: ${missing.join(",")}`;
  }

  return false;
}

// Magical argument parser
function argsParse(message, prefix) {
  //Split the input by spaces
  let word_array = message.split(" ");
  let args_array = [];
  let temp_arg = "";
  let found_end = false;

  for (let key = 0; key < word_array.length; key++) {
    //If an element start with quotes, it's the start of a string'
    if (word_array[key][0] == '"' || word_array[key][0] == "'") {
      found_end = false;

      //Search for the end of the string and also inceremnt the key counter
      for (let j = key; j < word_array.length && !found_end; j++, key++) {
        //Add the word to the argument
        temp_arg += word_array[j] + " ";

        //If there's another quote at the end, we've reached the end of the argument
        if (
          word_array[j][word_array[j].length - 1] == '"' ||
          word_array[j][word_array[j].length - 1] == "'"
        ) {
          found_end = true;
        }
      }
      //Add the final argument to the argument array
      args_array.push(temp_arg.substring(1, temp_arg.length - 2));
    } else {
      args_array.push(word_array[key]);
    }
  }

  return args_array;
}

module.exports = {
  loadGroup,
  unloadGroup,
  setup,
  onMessage,
  argsParse,
  commandGroups,
  prefix,
  permissionCheck
};
