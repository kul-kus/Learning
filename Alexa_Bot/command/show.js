var inquirer = require('inquirer');
var spawn = require('child_process').spawn;
module.exports = {
    show: function (command) {
        var cmdToGetFile = spawn('cd "$@" && ls wmio/.connector', {
            shell: true
        });
        let wmioFileName = []
        
        if (command == "whoami") {
            self.show_file("config.json")
        } else {
            cmdToGetFile.stdout.on('data', function (data) {
                wmioFileName = data.toString().split("\n").filter(Boolean)
                self.showOptions(wmioFileName)
            });
            cmdToGetFile.on('exit', function (exitCode) {
            })
        }
    },

    showOptions: function (arr) {
        let opt = [{
            name: "alexa",
            type: 'list',
            message: "select the file to show",
            pageSize: 5,
            choices: arr
        }];

        return inquirer.prompt(opt).then(data => {
            // console.log("TCL: ab - >", data.alexa)
            return self.show_file(data.alexa)
        });
    },
    show_file(fileName) {
        let readCommand = spawn(`cd "$@" && cat wmio/.connector/${fileName}`, {
            shell: true
        })
        readCommand.stdout.on('data', function (data) {
            let finalData = JSON.parse(data.toString())
            if (finalData.access_token) {
                delete finalData.access_token
            }
            console.log(finalData)
        });
    }
}

var self = module.exports