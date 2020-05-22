#!/usr/bin/env node

var change = require("./command/change_config")
var copy = require("./command/create_common_fun_file")
var show = require("./command/show")
var schema_generator = require("./command/schema_generator")
var comm = require("./command/common")
const chalk = require('chalk');

var parameters = process.argv.slice(2)
let command = parameters.splice(0, 1)
// console.log("command", command)
// console.log("parameters", parameters)


if (command == "change" || command == "config") {
  return change.change_config(parameters)
} else if (command == "show" || command == "whoami") {
  return show.show(command)
}
else if (command == "create_common") {
  return copy.copy_common()
} else if (command == "schema") {
  console.log("parameters", parameters[0])
  try {
    let obj = parameters[0]
    if (comm.checkJson(obj)) {
      obj = comm.convertJson(obj)
    }
    if (typeof obj == "object") {
      return schema_generator.buildSchema(obj)
    } else {
      comm.showError("Please enter valid object.")
    }
  } catch (error) {
    comm.showError(error)
  }
  // return copy.copy_common()
  JSON.stringify
}
else {
  console.log("<-------------- lisit of commands alexa can perform ----------------->")
  console.log(chalk.cyan("alexa whoami"), chalk.grey(":"), chalk.white("Shows config file content"))
  console.log(chalk.cyan("alexa change"), chalk.grey(":"), chalk.white("Provides a list of file to set config.json"))
  console.log(chalk.cyan("alexa show"), chalk.grey(":"), chalk.white("Provides a list of file to show"))
  console.log(chalk.cyan("alexa schema"), chalk.grey(":"), chalk.white("Create schema for specified json object."))
  console.log(chalk.cyan("alexa create_common"), chalk.grey(":"), chalk.white("creates common file with user defined functions to develop Connectors"))
}