let chalk = require("chalk")
var inquirer = require('inquirer');
var spawn = require('child_process').spawn;

var wmioPath = "wmio/.connector"

module.exports = {
    "homePath":"/home/kulk@eur.ad.sag/wmio/.connector",
    "wmioPath": "wmio/.connector",

    getFileList: function (filterParam, excludeConfig) {
        return new Promise((res, rej) => {
            var cmdToGetFile = spawn(`cd "$@" && ls ${self.wmioPath}`, {
                shell: true
            });
            cmdToGetFile.stdout.on('data', function (data) {
                wmioFileName = data.toString().split("\n").filter(Boolean)
                // console.log("wmioFileName", wmioFileName)
                if (filterParam && filterParam.length) {
                    wmioFileName = wmioFileName.filter(curr => curr.startsWith(filterParam[0]))
                }
                if (excludeConfig) {
                    wmioFileName = wmioFileName.filter(e => e !== 'config.json' && e !== 'alias.json');
                }
                return res(wmioFileName)
            })
            cmdToGetFile.stdout.on("error", (err) => {
                return rej(err)
            })
        })
    },
    showError: function (msg) {
        console.log(chalk.keyword("red")("Error-> " + msg))
    },
    showMessage: function (msg) {
        console.log(chalk.keyword('brown')(msg))
    },
    showMessageOrange: function (msg) {
        console.log(chalk.keyword('orange')(msg))
    },
    showMessageRandom: function (msg, color) {
        console.log(chalk.keyword(color || 'orange')(msg))
    },
    convertJson: function (str) {
        try {
            str = (str && typeof str === "string") ? JSON.parse(str) : str;
        } catch (e) {
            return str;
        }
        return str;
    },

    checkJson: function (str) {
        try {
            (str && typeof str === "string") ? JSON.parse(str) : str;
        } catch (e) {
            return false;
        }
        return true;
    },
    showOptions: function (arr, msg) {
        return new Promise((res, rej) => {
            try {
                let opt = [{
                    name: "alexa",
                    type: 'list',
                    message: (msg) ? (msg) : "select the file to show",
                    pageSize: 5,
                    choices: arr
                }];

                inquirer.prompt(opt).then(data => {
                    res(data.alexa)
                });

            } catch (error) {
                rej(error)
            }
        })

    },
    confirmOptions: function (msg) {
        return new Promise((res, rej) => {
            try {
                let opt = [{
                    name: "alexa",
                    type: 'confirm',
                    message: (msg) ? (msg) : "Confirm"
                }];
                inquirer.prompt(opt).then(data => {
                    res(data.alexa)
                });
            } catch (error) {
                rej(error)
            }
        })

    },
    getInput: function (questions) {
        return new Promise((res, rej) => {
            try {
                inquirer.prompt(questions).then((answers) => {
                    // console.log(JSON.stringify(answers, null, '  '));
                    res(answers)
                });
            } catch (error) {
                rej(error)
            }
        })

    },
    readFile(fileName) {
        return new Promise((res, rej) => {
            try {
                let readCommand = spawn(`cd "$@" && cat ${self.wmioPath}/${fileName}`, {
                    shell: true
                })
                readCommand.stdout.on('data', function (data) {
                    data = data.toString()
                    if (self.checkJson(data)) {
                        data = self.convertJson(data)
                    }
                    return res(data)
                });
                readCommand.stdout.on("error", (err) => {
                    return rej(err)
                })
            } catch (error) {
                return rej(error)
            }
        })
    },
    createFile(fileName) {
        return new Promise((res, rej) => {
            try {
                let createCommand = spawn(`cd "$@" && touch ${self.wmioPath}/${fileName}`, {
                    shell: true
                })
                createCommand.stdout.on("end", (data) => {
                    return res(data)
                })
                createCommand.stdout.on('data', function (data) {
                    data = data.toString()
                    if (self.checkJson(data)) {
                        data = self.convertJson(data)
                    }
                    return res(data)
                });
                createCommand.stdout.on("error", (err) => {
                    return rej(err)
                })
            } catch (error) {
                return rej(error)
            }
        })
    },
    copyFile(source, dest) {
        return new Promise((res, rej) => {
            try {
                let copyCommand = spawn(`cd "$@" && cp ${source} ${dest}`, {
                    shell: true
                })
                copyCommand.stdout.on('data', function (data) {
                    // console.log(data.toString());
                })
                copyCommand.stderr.on('error', function (err) {
                    self.showError(err.toString());
                })
                copyCommand.stdout.on("end", async function (data) {
                    res("done")
                })
            } catch (error) {
                return rej(error)
            }
        })
    }


}
var self = module.exports
