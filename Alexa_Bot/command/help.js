

var Table = require('cli-table3');
var colors = require('colors');

colors.setTheme({
    "heading": "red"
})

module.exports = {
    help: function () {

        let output = ""
        output += ' \n';
        output += '          ░█████╗░██╗░░░░░███████╗░██╗░░██╗░█████╗░\n';
        output += '          ██╔══██╗██║░░░░░██╔════╝░╚██╗██╔╝██╔══██╗\n';
        output += '          ███████║██║░░░░░█████╗░░░░╚███╔╝░███████║\n';
        output += '          ██╔══██║██║░░░░░██╔══╝░░░░██╔██╗░██╔══██║\n';
        output += '          ██║░░██║███████╗███████╗░██╔╝╚██╗██║░░██║\n';
        output += '          ╚═╝░░╚═╝╚══════╝╚══════╝░╚═╝░░╚═╝╚═╝░░╚═╝\n';

        let esy = ""
        esy += ' \n';
        esy += '          █████████╗░████████╗███╗░░░░███╗\n';
        esy += '          ██╔══════╝██╔══════╝╚███╗░░███╔╝\n';
        esy += '          ███████╗░░╚███████╗░░╚███████╔╝░\n';
        esy += '          ██╔════╝░░░╚═════██╗░░░╚███╔╝░░\n';
        esy += '          █████████╗████████╔╝░░░░███║░░░\n';
        esy += '          ╚════════╝╚═══════╝░░░░░╚══╝░░░\n';


        table = new Table({ head: ["Title", "Command", "Info"] });
        // table = new Table({ style: { head: [], border: [] } })

        table.push(
            // [{ colSpan: 3, content: output }],
            // ["Title".heading, "Command".heading, "Info".heading],
            ["Who", "esy whoami", "Shows config file content"],
            ["Open", "esy open", "Opens the .connector folder in Visual studio Code."],
            ["Change Config", "esy change <filter param> [--deploy]", "Provides a list of file to set config.json and the connector to specified tenant."],
            ["Show Config", "esy show <filter param>", "Provides a list of file to show File Content."],
            ["Create File", "esy create <file name> [--code | --nano]", "Create a new file with user specified name."],
            ["Update File", "esy update <filter param> [--code | --nano]", "Updates the content of specified file."],
            ["Rename File", "esy rename <filter param> [-- new file name]", "Rename specific file."],
            ["Delete File", "esy delete  <filter param>", "Deletes the selected file."],
            ["Migrate", "esy migrate", "Migrates the conncetor to specified tenant."],
            ["Create Schema", "esy schema", "Create schema for specified json object."],
            ["Create common file", "esy create_common", "creates common file with user defined functions to develop Connectors."],
            ["Opens specified Repo", "esy open [git | config] <file name>", "Provides list of Repository and opens them in Visual studio Code."],
            ["Checkout Specific github Branch", "esy checkout <branch name>", "Checkout to a specific branch."],
            ["Push code on github", "esy push <commit message> [--copy | -c ]", "Push code on current branch."],
            ["Pull current branch", "esy pull", "Pull code on current branch."],
            ["Shutdown Laptop", "esy shutdown | esy off | esy poweroff", "Shutdown the Laptop"],
            ["Restart Laptop", "esy restart | esy reboot", "Restarts the Laptop"],
            ["Store Git Credential", "esy store", "Store Git credentials, (git config credential.helper store)"],
            ["Night Node", "esy nightmode < on | off >", "Enable Night Node"],
            ["Kill Process", "esy kill <Port number> [-a]", "Kills process of a specific port"],
            ["Help", "esy help or esy", "List all commands"],
            ["Version", "esy --version | esy -v", "List version of your esy bot"]

        );
        console.log()


        console.log(esy);

        console.log(table.toString());
        console.log()
    }
}