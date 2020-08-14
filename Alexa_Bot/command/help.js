

var Table = require('cli-table3');

module.exports = {
    help: function () {
        table = new Table({ head: ["Title", "Command", "Info"] });
        table.push(
            ["Who", "alexa whoami", "Shows config file content"],
            ["Open", "alexa open", "Opens the .connector folder in Visual studio Code."],
            ["Change Config", "alexa change <filter param>", "Provides a list of file to set config.json"],
            ["Show Config", "alexa show <filter param>", "Provides a list of file to show File Content."],
            ["Create File", "alexa create <file name> [--code | --nano]", "Create a new file with user specified name."],
            ["Update File", "alexa update <filter param> [--code | --nano]", "Updates the content of specified file."],
            ["Rename File", "alexa rename <filter param> [-- new file name]", "Rename specific file."],
            ["Delete File", "alexa delete  <filter param>", "Deletes the selected file."],
            ["Migrate", "alexa migrate", "Migrates the conncetor to specified tenant."],
            ["Create Schema", "alexa schema", "Create schema for specified json object."],
            ["Create common file", "alexa create_common", "creates common file with user defined functions to develop Connectors."]
        );
        console.log()
        console.log(table.toString());
        console.log()
    }
}