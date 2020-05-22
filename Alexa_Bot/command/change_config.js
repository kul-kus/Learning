var spawn = require('child_process').spawn;
var inquirer = require('inquirer');
var basefile = "config.json"
var basepath = "wmio/.connector/"
var comm = require("./common")
const chalk = require('chalk');
module.exports = {
    change_config: function (para) {
        var cmdToGetFile = spawn('cd "$@" && ls wmio/.connector', {
            shell: true
        });
        let wmioFileName = []
        cmdToGetFile.stdout.on('data', function (data) {
            wmioFileName = data.toString().split("\n").filter(Boolean)
            if (para.length) {
                wmioFileName = wmioFileName.filter(curr => curr.startsWith(para[0]))
            }
            if (wmioFileName.length) {
                self.showOptions(wmioFileName)
            } else {
                comm.showError("No records found..")
            }
        });
        cmdToGetFile.on('exit', function (exitCode) {
        })
    },

    showOptions: function (arr) {
        let opt = [{
            name: "alexa",
            type: 'list',
            message: "select the file",
            pageSize: 5,
            choices: arr
        }];

        return inquirer.prompt(opt).then(data => {
            let copyCommand = spawn(`cd "$@" && cp ${basepath}${data.alexa} ${basepath}${basefile}`, {
                shell: true
            })
            copyCommand.stdout.on('data', function (data) {
                // console.log(data.toString());
            })
            copyCommand.stderr.on('data', function (err) {
                comm.showError(err.toString());
            })
            copyCommand.stdout.on("end", function (err) {
                let readCommand = spawn(`cd "$@" && cat ${basepath}${basefile}`, {
                    shell: true
                })
                readCommand.stdout.on('data', function (data) {
                    let finalData = JSON.parse(data.toString())
                    if (finalData.access_token) {
                        delete finalData.access_token
                    }
                    console.log(finalData)
                    comm.showMessage("<------------ Successful -------------->")
                })
                readCommand.stderr.on('data', function (err) {
                    comm.showError(err.toString());
                });
            })
        });
    }
}

var self = module.exports