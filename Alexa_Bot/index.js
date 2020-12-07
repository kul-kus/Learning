#!/usr/bin/env node


var changeConfig = require("./command/change_config")
var createCommon = require("./command/create_common_fun_file")
var migrate = require("./command/migrate")
var killProcess = require("./command/kill_process")

var commandFun = require("./command/CURD_command")
var help = require("./command/help")

var schema_generator = require("./command/schema_generator")
var comm = require("./command/common")

var parameters = process.argv.slice(2)
let command = parameters.splice(0, 1)
if (command && Array.isArray(command) && command.length) {
  command = command[0].toLocaleLowerCase()
}
// console.log("command", command)
// console.log("parameters", parameters)

if (parameters && parameters.length) {
  if (parameters[0].includes("--")) {
    parameters.unshift(null)
  }
}


if (command == "change" || command == "config") {
  return changeConfig.change_config(parameters)
} else if (command == "show" || command == "whoami" || command == "alias") {
  return commandFun.show(command, parameters)
}
else if (command == "create_common") {
  return createCommon.copy_common()
} else if (command == "schema") {
  try {
    let obj = parameters[0]
    if (comm.checkJson(obj)) {
      obj = comm.convertJson(obj)
    }
    if (typeof obj == "object") {
      return schema_generator.buildSchema(obj)
    } else {
      return comm.showError("Please enter valid object.")
    }
  } catch (error) {
    return comm.showError(error)
  }
} else if (command == "migrate") {
  return migrate.migrate()
} else if (command == "delete") {
  return commandFun.delete(parameters)
} else if (command == "update") {
  return commandFun.update(parameters)
} else if (command == "create") {
  return commandFun.create(parameters)
} else if (command == "shutdown" || command == "off" || command == "poweroff") {
  return commandFun.shutdown()
}
else if (command == "reboot" || command == "restart") {
  return commandFun.restart()
}
else if (command == "store") {
  return commandFun.store()
}
else if (command == "nightmode" || command == "dim") {
  return commandFun.nightmode(parameters)
}
// else if (command == "vscode" || command == "wmio") {
//   return commandFun.vsCode()
// } 
else if (command == "rename") {
  return commandFun.rename(parameters)
} else if (command == "open") {
  return require("./command/open").open(parameters)
}
else if (command == "git") {
  parameters.unshift("git")
  return require("./command/open").open(parameters)
}
else if (command == "code") {
  parameters.unshift("code")
  return require("./command/open").open(parameters)
}
else if (command == "checkout" || command == "check" || command == "chk") {
  return require("./command/Git/checkout").checkout(parameters)
}
else if (command == "pull") {
  return require("./command/Git/pull").pull()
}
else if (command == "push") {
  return require("./command/Git/push").push(parameters)
}
else if (command == "branch") {
  return require("./command/Git/branch").branch(parameters)
}
else if (command == "version" || command == "--version" || command == "-v") {
  return commandFun.version()
}
else if (command == "kill") {
  return killProcess.kill(parameters)
}
else if (command == "help" || command == "--help" || command.length == 0) {
  help.help()
}
else {
  comm.showError("Invalid Command.. 😞 ")
  comm.showMessageOrange("Type 'alexa help' to list all the Commands.")
}