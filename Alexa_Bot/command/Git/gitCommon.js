let chalk = require("chalk")
var comm = require("./../common")
var spawn = require('child_process').spawn;

module.exports = {
    hexColors: {
        red: "#e88388",
        yellow: "#dbab78",
        green: "#a8cc8c",
        blue: "#71bef2",
        magenta: "#d290e4",
        cyan: "#66c2cd",
        grey: "#b9c0cb"
    },

    getBranchDeatils: function (filterParam, pwd, oraspinner) {
        let currentBranch = ""
        return new Promise(async (res, rej) => {
            let branchCommand = `git branch`
            if (filterParam) {
                if (filterParam.includes("--all") || filterParam.includes("-a")) {
                    branchCommand = branchCommand + " --all"
                }
            }
            let gitBool = true
            self.startSpinner(oraspinner, "Fetching Branch Details", "none")
            setTimeout(() => {

                let getBranch = spawn(`cd ${pwd} "$@" && ${branchCommand}`, { shell: true });
                getBranch.stdout.on('error', function (data) {
                    return rej(`Get git branch failed Error-> ${data}`)
                })

                getBranch.stdout.on('close', async function (data) {
                    if (gitBool) {
                        return rej(self.stopSpinnerAndShowMessage(oraspinner, "fail", "Not a Git Repository :(", "#e88388"))
                    }
                })
                getBranch.stdout.on('data', async function (data) {
                    gitBool = false
                    let regex = /^(\*\ )/gi
                    let allBranchName = self.formatData(data)
                    let allBranchNameTemp = allBranchName.filter(curr => Boolean(curr)).map(curr => {
                        curr = curr.trim()
                        if (curr.match(regex)) {
                            curr = curr.replace(regex, "")
                            currentBranch = curr
                            curr = chalk.keyword("orange")(curr)
                        }
                        return curr
                    })
                    self.stopSpinnerAndShowMessage(oraspinner)
                    return res({
                        "allBranchName": allBranchNameTemp,
                        "currBranch": currentBranch
                    })
                })
            }, 100);
        })
    },
    pullChanges: function (pwd, currentBranch, oraspinner) {
        return new Promise((res, rej) => {
            self.startSpinner(oraspinner, "Fetching Latest pull", "none")
            let pullGitBool = true
            var pullChanges = spawn(`cd ${pwd} "$@" && git pull origin ${currentBranch}`, {
                shell: true
            });

            pullChanges.stdout.on('error', function (error) {
                return rej(self.stopSpinnerAndShowMessage(oraspinner, "fail", "Git Pull Command Failed Error:" + error), "pink")
                // return comm.showError(error)
            })

            pullChanges.stdout.on('close', function (error) {
                if (pullGitBool) {
                    return rej(self.stopSpinnerAndShowMessage(oraspinner, "fail", "Pull command Failed. Please Check your connection and try again.", "pink"))
                }
            })

            pullChanges.stdout.on('data', function (pullData) {
                self.stopSpinner(oraspinner)
                pullGitBool = false

                pullData = self.formatData(pullData)
                console.log(chalk.keyword("lightgreen")("  Git Pull Data:"))
                // comm.comm.comm.stopSpinnerAndShowMessage(oraspinner, "info", "Git Pull Data", "lightgreen")
                pullData.forEach(curr => {
                    console.log(chalk.keyword("lightblue")(`  ${curr}`))
                })
                console.log("")
                pullChanges.stdout.on('close', async function (data) {
                    // console.log(chalk.keyword("yellow")(`Pull Completed Successful for Branch`), chalk.keyword("red")(currentBranch))
                    let mess = chalk.keyword("yellow")(`Pull Completed Successful for Branch`) + " " + chalk.keyword("red")(currentBranch)
                    self.stopSpinnerAndShowMessage(oraspinner, "succeed", mess, "none")
                    return res("Pull completed")
                })
            })
        })
    },
    formatData: function (data) {
        if (data) {
            return data.toString().split('\n').filter(curr => Boolean(curr)).map(curr => curr.trim())
        }
        return ""
    },

    startSpinner: function (oraspinner, message, color) {
        return comm.startSpinner(oraspinner, message, color)
    },

    stopSpinner: function (oraspinner) {
        return comm.stopSpinner(oraspinner)
    },

    stopSpinnerAndShowMessage: function (oraspinner, type, message, color) {
        return comm.stopSpinnerAndShowMessage(oraspinner, type, message, color)
    },

    copyStringToClipBoard: function (str) {
        return comm.copyStringToClipBoard(str)
    },
    getCurrentPWD: function () {
        return comm.getCurrentPWD()
    }
}
var self = module.exports
