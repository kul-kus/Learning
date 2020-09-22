let chalk = require("chalk")
var inquirer = require('inquirer');
var spawn = require('child_process').spawn;
var config = require("./../config")
const clipboardy = require('clipboardy');

module.exports = {
    "homePath": config.homePath,
    "wmioPath": config.wmioPath,
    "gitPath": config.gitPath,
    "alexa_code": config.alexa_code,

    copyStringToClipBoard: function (str) {
        clipboardy.writeSync(str);
    },


    checkIfFileExist: function (fileName) {
        return new Promise(async function (res, rej) {
            try {
                let FileList = await self.getFileList()
                return (FileList.includes(fileName)) ? res(true) : res(false)
            } catch (error) {
                return rej(false)
            }
        })
    },
    addEscapeToSpace: function (str) {
        return str.replace(/(\s+)/g, '\\$1')
    },
    getFileList: function (filterParam, excludeConfig, command) {
        return new Promise((res, rej) => {
            var cmdToGetFile = spawn(`cd "$@" && ls ${(command && command == "git") ? (self.gitPath) : (self.wmioPath)}`, {
                shell: true
            });
            cmdToGetFile.stdout.on('data', function (data) {
                wmioFileName = data.toString().split("\n").filter(Boolean)
                if (filterParam && filterParam.length && filterParam[0]) {
                    wmioFileName = wmioFileName.filter(curr => curr.toLowerCase().startsWith(filterParam[0].toLowerCase()))
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
                    return res(answers)
                });
            } catch (error) {
                return rej(error)
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
    },
    openFileInNanoEditor(filename, param, command) {
        let editior = "nano"
        if (param && Array.isArray(param) && param.length && param[1] == "--code") {
            editior = "code"
        }

        let tempPath = `${self.homePath}/${filename}`
        if (command && command == "git") {
            tempPath = `${self.gitPath}/${filename}`
        }
        if (command && command == "config") {
            tempPath = self.homePath
        }
        if (command && command == "code") {
            tempPath = self.alexa_code
        }

        let updateCommand = spawn(editior, [tempPath], {
            stdio: 'inherit',
            detached: true
        })
        updateCommand.stdout.on("data", function (data) {
            process.stdout.pipe(data);
        });
    }


}
var self = module.exports
