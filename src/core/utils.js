const child_process = require("child_process");

function execCommand(command) {
  return new Promise(function(resolve, reject) {
    child_process.exec(command, {windowsHide: true}, function(
      err,
      stdout,
      stderr
    ) {
      if (err) {
        reject({
          stderr: stderr || "",
          err,
          stdout: stdout || ""
        });
      } else {
        resolve({
          stdout: stdout || "",
          stderr: stderr || ""
        });
      }
    });
  });
}

module.exports = {execCommand};
