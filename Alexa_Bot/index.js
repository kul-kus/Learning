#!/usr/bin/env node


var changeConfig = require("./command/change_config")
var createCommon = require("./command/create_common_fun_file")
var migrate = require("./command/migrate")
var commandFun = require("./command/CURD_command")
var help = require("./command/help")

var schema_generator = require("./command/schema_generator")
var comm = require("./command/common")

var parameters = process.argv.slice(2)
let command = parameters.splice(0, 1)
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
} 
// else if (command == "vscode" || command == "wmio") {
//   return commandFun.vsCode()
// } 
else if (command == "rename") {
  return commandFun.rename(parameters)
} else if (command == "open") {
  return require("./command/open").open(parameters)
} 
else if (command == "checkout") {
  return require("./command/checkout").checkout(parameters)
} 
// else if (command == "git") {
//   return require("./command/git").git(parameters)
// }

 else if (command == "push") {
  return require("./command/push").push(parameters)
}
else {
  help.help()
}