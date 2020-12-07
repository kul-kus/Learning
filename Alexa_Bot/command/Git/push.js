

var comm = require("./../common")
var gitComm = require("./gitCommon")
var spawn = require('child_process').spawn;
let chalk = require("chalk")
var inquirer = require('inquirer');
const stripAnsi = require('strip-ansi');
const cliSpinners = require('cli-spinners').dots
const oraspinner = require('ora')()
oraspinner.spinner = cliSpinners



var currentBranch = ""
var pwd = ""
var copyBool = true


///home/kulk@eur.ad.sag/kul/a-my-connector-triggers/git_Irepo/integration-connectors

module.exports = {
    push: async function (filterParam) {
        try {
            if (filterParam && filterParam.length == 0) {
                return comm.showError("Please provide valid Commit Message.")
            }
            if (filterParam && filterParam.length && !filterParam[0]) {
                return comm.showError("Please provide valid Commit Message.")
            }
            if (filterParam && filterParam.length && filterParam[1]) {
                if (filterParam[1] == "--copy" || filterParam[1] == "-c") {
                    copyBool = true
                }
            }


            pwd = await comm.getCurrentPWD()
            // pwd = "/home/kulk@eur.ad.sag/kul/a-my-connector-triggers/git_Irepo/Kul-Learning/Learning/googleMaps"
            var { allBranchName, currBranch } = await gitComm.getBranchDeatils(filterParam, pwd, oraspinner)
            currentBranch = currBranch
            console.log(chalk.keyword("lightblue")("  Current Branch -> ") + chalk.keyword("red")(currentBranch))
            let gitSatusData = await gitStatus(pwd, "git status", "Fetching Git Status")

            if (gitSatusData && Array.isArray(gitSatusData) && gitSatusData.length && gitSatusData.indexOf("nothing to commit, working tree clean") == -1) {

                let gitStatusData2 = await gitStatus(pwd, "git status -s", "Fetching Git Changes")

                console.log(chalk.keyword("pink")("  Files Changed"))
                console.log(chalk.keyword("grey")("  " + gitStatusData2.join('\n')))

                if (gitStatusData2 && Array.isArray(gitStatusData2) && gitStatusData2.length) {

                    let commitFilesList = getAllFilesModified(gitStatusData2)
                    let addStingMess = "git add"

                    let commitFiles = await GetSelctedCommitFiles(commitFilesList)
                    addStingMess += ` ${commitFiles.trim()}`

                    console.log(chalk.keyword("orange")("  Add Command Generated:"), addStingMess)

                    if (await comm.confirmOptions(`Do you want to push the above Mentioned Changes`)) {
                        await addChanges(pwd, addStingMess)
                        await commitChanges(pwd, filterParam[0], currentBranch)
                        await gitComm.pullChanges(pwd, currentBranch, oraspinner)
                        await pushChanges(pwd, currentBranch, filterParam[0])
                        await GetCommlitLogs(pwd, filterParam[0], currentBranch)
                    } else {
                        gitComm.stopSpinnerAndShowMessage(oraspinner, "fail", "Push process terminated ..", comm.hexColors.red)
                    }
                } else {
                    gitComm.stopSpinnerAndShowMessage(oraspinner, "info", "No Changes to Commit. :)", "white")
                }

            } else {
                gitComm.stopSpinnerAndShowMessage(oraspinner, "info", "No Changes to Commit. :)", "white")
            }
        } catch (error) {
            // console.log("error", error)
            // console.log(chalk.keyword("red")(error))
        }
    }

}

function gitStatus(pwd, command, spinnerTxt) {
    return new Promise((res, rej) => {
        var getStatus = spawn(`cd ${pwd} "$@" && ${command}`, {
            shell: true
        });
        gitComm.startSpinner(oraspinner, spinnerTxt, "none")
        getStatus.stdout.on('error', function (data) {
            return rej(gitComm.stopSpinnerAndShowMessage(oraspinner, "fail", `Git Status failed Error-> ${data}`, comm.hexColors.red))
        })
        getStatus.stdout.on('data', function (data) {
            gitComm.stopSpinnerAndShowMessage(oraspinner)
            return res(gitComm.formatData(data))
        })
    })
}


function addChanges(pwd, addStingMess) {
    return new Promise((res, rej) => {
        console.log(chalk.keyword("magenta")("  Command Initiated: "), addStingMess)
        gitComm.startSpinner(oraspinner, "Adding changes to Git Repository", "none")
        var addChanges = spawn(`cd ${pwd} "$@" && ${addStingMess}`, {
            shell: true
        });

        addChanges.stdout.on('data', async function (data) {
            data = gitComm.formatData(data)
            console.log("Git add Data: ", data)
        })
        addChanges.stdout.on('error', async function (error) {
            return rej(gitComm.stopSpinnerAndShowMessage(oraspinner, "fail", error, comm.hexColors.red))

        })
        addChanges.stdout.on('close', async function (cdata) {
            //------------------------- commit the changes----------
            let mess = "Changes Added to Git Repository"
            gitComm.stopSpinnerAndShowMessage(oraspinner, "succeed", mess, "none")
            return res(cdata)
        })
    })
}

function commitChanges(pwd, commitMess, currentBranch) {
    return new Promise((res, rej) => {
        var commitChanges = spawn(`cd ${pwd} "$@" && git commit -m "${commitMess}"`, {
            shell: true
        });
        gitComm.startSpinner(oraspinner, "Commiting changes to Git Repository", "none")
        commitChanges.stdout.on('error', function (error) {
            // comm.showError(error)
            return rej(gitComm.stopSpinnerAndShowMessage(oraspinner, "fail", error, comm.hexColors.red))
        })
        commitChanges.stdout.on('data', function (data) {

            data = gitComm.formatData(data)
            console.log("")
            if (data.indexOf("no changes added to commit") > -1) {
                return rej(gitComm.stopSpinnerAndShowMessage(oraspinner, "warn", "No changes added to commit.", comm.hexColors.white))
            } else {
                console.log(chalk.keyword("lightgreen")("Git Commit Data: "))
                console.log(chalk.keyword("lightblue")(data.join('\n')))
                commitChanges.stdout.on('close', function (data) {
                    data = gitComm.formatData(data)
                    // console.log(chalk.keyword("cyan")("Code Commited Successfully on branch"), chalk.keyword("red")(currentBranch))
                    console.log("")
                    gitComm.stopSpinnerAndShowMessage(oraspinner, "succeed", "Code Commited Successfully on branch " + chalk.keyword("red")(currentBranch), "cyan")
                    return res(data)
                })
            }
        })
    })

}

function pushChanges(pwd, currentBranch) {
    return new Promise((res, rej) => {
        gitComm.startSpinner(oraspinner, "Pushing changes to Git Repository", "none")
        var pushChanges = spawn(`cd ${pwd} "$@" && git push origin ${currentBranch}`, {
            shell: true
        });

        pushChanges.stdout.on('error', function (error) {
            return rej(gitComm.stopSpinnerAndShowMessage(oraspinner, "fail", `Push error ${error}`, comm.hexColors.red))
        })
        pushChanges.stdout.on('data', function (data) {
            data = gitComm.formatData(data)
            console.log("  Push Data: ", data)
        })


        pushChanges.stdout.on('close', function (data) {
            data = gitComm.formatData(data)
            console.log("")
            let mess = "Push Completed Successfully :)"
            return res(comm.stopSpinnerAndShowMessage(oraspinner, "succeed", mess, comm.hexColors.cyan))
        })
    })
}

function GetCommlitLogs(pwd, commitMessage, currentBranch) {
    return new Promise((res, rej) => {
        gitComm.startSpinner(oraspinner, "Fetching Commit Logs", "none")

        var commitLog = spawn(`cd ${pwd} "$@" && git log -1`, {
            shell: true
        });
        commitLog.stdout.on('error', function (error) {
            return rej(gitComm.stopSpinnerAndShowMessage(oraspinner, "fail", `Git Log Error: ${error}`, comm.hexColors.red))
        })

        commitLog.stdout.on('data', function (logdata) {
            logdata = gitComm.formatData(logdata)
            commitLog.stdout.on('close', function (data) {
                let commitObj = {
                    "commit": "",
                    "branch": currentBranch,
                    "message": commitMessage,
                    "date": "",
                    "author": ""
                }

                logdata.forEach(curr => {
                    if (curr.startsWith("commit")) {
                        commitObj["commit"] = curr.replace("commit ", "")
                    }
                    if (curr.startsWith("Date:")) {
                        commitObj["date"] = curr.replace("Date: ", "")
                        commitObj["date"] = commitObj["date"].trim()
                    }
                    if (curr.startsWith("Author:")) {
                        commitObj["author"] = curr.replace("author:", "")
                        commitObj["author"] = commitObj["author"].trim()
                    }
                })
                comm.stopSpinner(oraspinner)
                console.log("")
                console.log(chalk.keyword("magenta").bold("-- Commit Log Data --"))
                console.log(chalk.white("Commit ID: ", commitObj["commit"]))
                console.log(chalk.white("Branch: ", commitObj['branch']))
                console.log(chalk.white("Message: ", commitObj['message']))
                console.log(chalk.white("Date: ", commitObj['date']))
                console.log(chalk.white("Author: ", commitObj['author']))
                console.log("")

                let strCopy = `Commit ID: ${commitObj["commit"]}\nBranch: ${commitObj['branch']}\nMessage: ${commitObj['message']}\nDate ${commitObj['date']}\nAuthor ${commitObj['author']}`
                if (copyBool) {
                    comm.copyStringToClipBoard(strCopy)
                    comm.stopSpinnerAndShowMessage(oraspinner, "succeed", "Commit Data copied Successfully\n", "lightgreen")

                }
                return res("Commit Logs")
            })
        })
    })
}

function getAllFilesModified(data) {
    let commitFilesList = []

    let commitModified = data.filter(curr => curr.startsWith("M "))
    let commitModified1 = data.filter(curr => curr.startsWith("MM "))

    commitModified = commitModified.concat(commitModified1)
    let commitDeleted = data.filter(curr => curr.startsWith("D "))
    let commitAdded = data.filter(curr => curr.startsWith("??"))
    let conflict = data.filter(curr => curr.startsWith("UU"))

    console.log("")


    if (commitAdded.length) {
        commitAdded.forEach(curr => {
            curr = curr.replace("?? ", "")
            commitFilesList.push({
                name: chalk.keyword("magenta")(" Added: ") + curr,
            })
        })
    }
    if (commitModified.length) {
        commitModified.forEach(curr => {
            curr = curr.replace("M ", "")
            commitFilesList.push({
                name: chalk.keyword("lightgreen")(" Modified: ") + curr,
            })

        })
    }
    if (commitDeleted.length) {
        commitDeleted.forEach(curr => {
            curr = curr.replace("D ", "")
            commitFilesList.push({
                name: chalk.keyword("brown")(" Deleted: ") + curr,
            })
        })
    }
    if (conflict.length) {
        conflict.forEach(curr => {
            curr = curr.replace("UU ", "")
            commitFilesList.push({
                name: chalk.keyword("blue")(" Conflict: ") + curr,
            })
        })
    }
    return commitFilesList
}

function GetSelctedCommitFiles(arr) {
    let CommitChoice = [
        new inquirer.Separator('-- Modified Files --'),
    ]
    CommitChoice = CommitChoice.concat(arr)
    return new Promise((res, rej) => {
        inquirer.prompt([
            {
                type: 'checkbox',
                message: 'Select The Changes to Commit',
                name: 'files',
                choices: CommitChoice,
                validate: function (answer) {
                    if (answer.length < 1) {
                        return 'You must choose at least one Changes to commit.';
                    }
                    return true;
                },
            },
        ]).then((answers) => {
            if (answers && answers.files && Array.isArray(answers.files) && answers.files.length) {
                let command = ""
                answers.files.forEach(curr => {
                    curr = stripAnsi(curr).trim()
                    if (curr.includes("Added: ")) {
                        curr = curr.replace("Added: ", "")
                    }
                    if (curr.includes("Modified: ")) {
                        curr = curr.replace("Modified: ", "")
                    }
                    if (curr.includes("Deleted: ")) {
                        curr = curr.replace("Deleted: ", "")
                    }
                    command += " " + curr.trim()
                });
                return res(command)

            } else {
                return rej("No Files selected to Commit")
            }
        })
    })
}


var self = module.exports