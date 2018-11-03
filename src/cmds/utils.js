const commandFramework = require("../core/commandFramework");

async function helpCommand(msg) {
  if (!msg.args[1]) {
    await msg.channel.send("Help sent to your DM!");
    await msg.author.send(
      Object.entries(commandFramework.commandGroups)
        .sort(([a], [b]) => a - b)
        .map(([groupName, group]) => helpForGroup(groupName, group, msg))
        .filter(groupDescription => groupDescription !== null)
        .join("\n"),
      {split: true}
    );
  } else {
    const groupName = msg.args[1];
    const group = commandFramework.commandGroups[groupName];
    if (!group) {
      return await msg.channel.send("That command group doesn't exist!");
    }
    await msg.channel.send(helpForGroup(groupName, group, msg), {split: true});
  }
}

function helpForGroup(groupName, group, msg) {
  const commandDescriptions = group.commands
    .filter(command => !commandFramework.permissionCheck(command, msg))
    .sort((a, b) => {
      const triggerA = Array.isArray(a.trigger) ? a.trigger[0] : a.trigger;
      const triggerB = Array.isArray(b.trigger) ? b.trigger[0] : b.trigger;
      return triggerA - triggerB;
    })
    .map(
      command =>
        `**${commandFramework.prefix}${command.trigger}** - ${
          command.description
        }${command.permissions || command.adminOnly ? " :lock:" : ""}`
    );
  return commandDescriptions.length
    ? `[**${groupName.toUpperCase()}**]\n${commandDescriptions.join("\n")}`
    : null;
}

async function pingCommand(msg) {
  await msg.channel.send("Pong!");
}

module.exports.commands = [
  {
    trigger: "help",
    description: "Help with commands",
    execute: helpCommand
  },
  {
    trigger: "ping",
    description: "Responds with pong!",
    execute: pingCommand
  }
];
