

var Table = require('cli-table3');

module.exports = {
    help: function () {
        table = new Table({ head: ["Title", "Command", "Info"] });
        table.push(
            ["Who", "alexa whoami", "Shows config file content"],
            ["Change Config", "alexa change", "Provides a list of file to set config.json"],
            ["Show Config", "alexa show", "Provides a list of file to show"],
            ["Create File", "alexa create", "Create specific file."],
            ["Update File", "alexa update", "Update specific file."],
            ["Rename File", "alexa rename", "Rename specific file."],
            ["Delete File", "alexa delete", "Delete specific json object."],
            ["Migrate", "alexa migrate", "Migrates the conncetor to specified tenant."],
            ["Create Schema", "alexa schema", "Create schema for specified json object."],
            ["Create common file", "alexa create_common", "creates common file with user defined functions to develop Connectors."]
        );
        console.log()
        console.log(table.toString());
    }
}