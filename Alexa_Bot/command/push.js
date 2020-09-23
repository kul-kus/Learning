

var comm = require("./common")
var spawn = require('child_process').spawn;
let chalk = require("chalk")
var inquirer = require('inquirer');
const stripAnsi = require('strip-ansi');



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


            pwd = await getCurrentPWD()
            // pwd = "/home/kulk@eur.ad.sag/kul/a-my-connector-triggers/git_Irepo/Kul-Learning/Learning/googleMaps"
            let allBranchName = await getAllBranch()

            console.log(chalk.keyword("lightblue")("Current Branch -> ") + chalk.keyword("red")(currentBranch))
            let gitSatusData = await gitStatus(pwd, "git status")

            if (gitSatusData && Array.isArray(gitSatusData) && gitSatusData.length && gitSatusData.indexOf("nothing to commit, working tree clean") == -1) {

                let gitStatusData2 = await gitStatus(pwd, "git status -s")

                console.log(chalk.keyword("pink")("Files Changed"))
                console.log(chalk.keyword("grey")(gitStatusData2.join('\n')))

                if (gitStatusData2 && Array.isArray(gitStatusData2) && gitStatusData2.length) {

                    let commitFilesList = getAllFilesModified(gitStatusData2)
                    let addStingMess = "git add"

                    let commitFiles = await GetSelctedCommitFiles(commitFilesList)
                    addStingMess += ` ${commitFiles.trim()}`

                    console.log(chalk.keyword("orange")("Add Command Generated:"), addStingMess)

                    if (await comm.confirmOptions(`Do you want to push the above Mentioned Changes`)) {
                        await addChanges(pwd, addStingMess)
                        await commitChanges(pwd, filterParam[0], currentBranch)
                        await pullChanges(pwd, currentBranch)
                        await pushChanges(pwd, currentBranch, filterParam[0])
                        await GetCommlitLogs(pwd, filterParam[0], currentBranch)
                    } else {
                        comm.showMessageOrange("Push process terminated ..")
                    }
                } else {
                    return comm.showMessage("No Changes to Commit. :)")
                }

            } else {
                return comm.showMessage("No Changes to Commit. :)")
            }
        } catch (error) {
            console.log("error", error)
            console.log(chalk.keyword("red")(error))
            // comm.showError(error)
        }
    }

}

function getCurrentPWD() {
    return new Promise((res, rej) => {
        var cmdToGetPWD = spawn(`pwd`, {
            shell: true
        });
        cmdToGetPWD.stdout.on("error", function (error) {
            return rej(`Unbale to Fetch Current Working Directory Error-> ${error}`)
        })
        cmdToGetPWD.stdout.on('data', function (data) {
            let pwd = comm.addEscapeToSpace(data.toString().trim())
            return res(pwd)
        })
    })
}

function getAllBranch() {
    let gitBool = true
    return new Promise((res, rej) => {
        let getBranch = spawn(`cd ${pwd} "$@" && git branch --all`, {
            shell: true
        });

        getBranch.stdout.on('error', function (data) {
            console.log("error", data)
            return rej(`Get git branch failed Error-> ${data}`)
        })

        getBranch.stdout.on('close', function (data) {
            if (gitBool) {
                return rej(`Not a Git Repository :(`)
            }
        })

        getBranch.stdout.on('data', async function (data) {
            gitBool = false
            let regex = /^(\*\ )/gi
            let allBranchName = formatData(data)
            let allBranchNameTemp = allBranchName.filter(curr => Boolean(curr)).map(curr => {
                curr = curr.trim()
                if (curr.match(regex)) {
                    curr = curr.replace(regex, "")
                    currentBranch = curr
                }
                return curr
            })

            return res(allBranchNameTemp)
        })
    })
}
function gitStatus(pwd, command) {
    return new Promise((res, rej) => {

        var getStatus = spawn(`cd ${pwd} "$@" && ${command}`, {
            shell: true
        });

        getStatus.stdout.on('error', function (data) {
            console.log("error", data)
            return rej(`Git Status failed Error-> ${data}`)
        })
        getStatus.stdout.on('data', async function (data) {

            return res(formatData(data))
        })

    })
}


function addChanges(pwd, addStingMess) {
    return new Promise((res, rej) => {
        console.log(chalk.keyword("magenta")("Command Initiated: "), addStingMess)

        var addChanges = spawn(`cd ${pwd} "$@" && ${addStingMess}`, {
            shell: true
        });
        addChanges.stdout.on('data', async function (data) {
            data = formatData(data)
            console.log("Git add Data: ", data)
        })
        addChanges.stdout.on('error', async function (error) {
            comm.showError(error)
            return rej(error)

        })
        addChanges.stdout.on('close', async function (cdata) {
            //------------------------- commit the changes----------
            return res(cdata)
        })
    })
}

function commitChanges(pwd, commitMess, currentBranch) {
    return new Promise((res, rej) => {
        var commitChanges = spawn(`cd ${pwd} "$@" && git commit -m "${commitMess}"`, {
            shell: true
        });
        commitChanges.stdout.on('error', async function (error) {
            comm.showError(error)
            return rej(error)

        })
        commitChanges.stdout.on('data', async function (data) {
            data = formatData(data)
            console.log("")
            if (data.indexOf("no changes added to commit") > -1) {
                console.log(chalk.green("No changes added to commit.", '\n'))

            } else {
                console.log(chalk.keyword("lightgreen")("Git Commit Data: "))
                console.log(chalk.keyword("lightblue")(data.join('\n')))
                commitChanges.stdout.on('close', async function (data) {
                    data = formatData(data)
                    console.log(chalk.keyword("cyan")("Code Commited Successfully on branch"), chalk.keyword("red")(currentBranch))
                    return res(data)
                })
            }
        })
    })
}

function pullChanges(pwd, currentBranch) {
    return new Promise((res, rej) => {
        var pullChanges = spawn(`cd ${pwd} "$@" && git pull origin ${currentBranch}`, {
            shell: true
        });

        pullChanges.stdout.on('error', async function (error) {
            return rej("Git Pull Command Failed Error:" + error)
            // return comm.showError(error)
        })

        pullChanges.stdout.on('data', function (pullData) {
            pullData = formatData(pullData)

            console.log("")
            console.log(chalk.keyword("lightgreen")("Git Pull Data:"))
            pullData.forEach(curr => {
                console.log(chalk.keyword("lightblue")(curr))
            })
            console.log("")
            pullChanges.stdout.on('close', function (data) {
                console.log(chalk.keyword("yellow")(`Pull Completed Successful for Branch`), chalk.keyword("red")(currentBranch))
                return res("Pull completed")
            })

        })
    })

}

function pushChanges(pwd, currentBranch) {
    return new Promise((res, rej) => {
        var pushChanges = spawn(`cd ${pwd} "$@" && git push origin ${currentBranch}`, {
            shell: true
        });

        pushChanges.stdout.on('error', function (error) {
            console.log(chalk.red("Push Error: ", error))
            // comm.showError(error)
            return rej(error)
        })
        pushChanges.stdout.on('data', function (data) {
            data = formatData(data)
            console.log("Push Data: ", data)
        })


        pushChanges.stdout.on('close', function (data) {
            data = formatData(data)

            console.log("")
            comm.showMessageOrange("Push Completed Successfully :)")
            return res("Push Complete")

        })
    })
}

function GetCommlitLogs(pwd, commitMessage, currentBranch) {
    return new Promise((res, rej) => {

        var commitLog = spawn(`cd ${pwd} "$@" && git log -1`, {
            shell: true
        });
        commitLog.stdout.on('error', function (error) {
            console.log(chalk.red("git Log Error: ", error))
            comm.showError(error)
            return rej(error)
        })

        commitLog.stdout.on('data', function (logdata) {
            // console.log("logdata", logdata.toString())
            logdata = formatData(logdata)
            // console.log("logdata", logdata)
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
                console.log("")
                console.log(chalk.keyword("magenta").bold("-- Commit Log Data --"))
                console.log(chalk.white("Commit ID: ", commitObj["commit"]))
                console.log(chalk.white("Branch: ", commitObj['branch']))
                console.log(chalk.white("Message: ", commitObj['message']))
                console.log(chalk.white("Date: ", commitObj['date']))
                console.log(chalk.white("Author: ", commitObj['author']))
                console.log("")

                let strCopy = `
                Commit ID: ${commitObj["commit"]}
                Branch: ${commitObj['branch']}
                Message: ${commitObj['message']}
                Date ${commitObj['date']}
                Author ${commitObj['author']}
                `
                if (copyBool) {
                    comm.copyStringToClipBoard(strCopy)
                }
                return res("Commit Logs")

            })
        })
    })
}

function formatData(data) {
    if (data) {
        return data.toString().split('\n').filter(curr => Boolean(curr)).map(curr => curr.trim())
    }
    return ""
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