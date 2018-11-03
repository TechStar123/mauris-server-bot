const utils = require("../core/utils");

async function execCommand(msg) {
  try {
    const {stderr, stdout} = await utils.execCommand(msg.suffix);
    const combinedOutput = (stdout + "\n" + stderr).trim();
    await msg.channel.send(combinedOutput, {
      code: true,
      split: true
    });
  } catch (err) {
    const {stdout, stderr} = err;
    const combinedOutput = (stdout + "\n" + stderr).trim();
    await msg.channel.send(`Command failed! Exited with ${err.err.code}`);
    await msg.channel.send(combinedOutput, {
      code: true,
      split: true
    });
  }
}

module.exports.commands = [
  {
    trigger: "exec",
    description: "Runs commands",
    execute: execCommand,
    adminOnly: true
  }
];
