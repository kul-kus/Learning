
var comm = require("./common")
var spawn = require('child_process').spawn;
let chalk = require("chalk")
const stripAnsi = require('strip-ansi');
const cliSpinners = require('cli-spinners').dots
const oraspinner = require('ora')()
oraspinner.spinner = cliSpinners

var currentBranch = ""
var pwd = ""

module.exports = {
    checkout: async function (filterParam) {
        try {
            pwd = await comm.getCurrentPWD()
            let allBranchName = await getAllBranch(filterParam)
            if (filterParam && filterParam.length && filterParam[0]) {
                allBranchName = allBranchName.filter(curr => {
                    curr = stripAnsi(curr)
                    curr = splitFromOrigin(curr)
                    return curr.startsWith(filterParam[0])
                })
            }
            if (allBranchName.length == 0) {
                console.log(chalk.keyword("red")("No branch found matching your search results :("))
                console.log(chalk.keyword("orange")("Try 'alexa checkout --all'"))
            } else {
                console.log(chalk.keyword("white")("  Current Branch: ") + chalk.keyword("orange")(currentBranch))

                let newBranch = await comm.showOptions(allBranchName, "Select the Branch to checkout.")
                newBranch = stripAnsi(newBranch).trim()
                newBranch = splitFromOrigin(newBranch)

                await checkout(pwd, newBranch)
                await pullChanges(pwd, newBranch)
            }
        } catch (error) {
            // console.log(chalk.keyword("red")(error))
        }
    }

}

function splitFromOrigin(str) {
    if (str.includes("origin/")) {
        let branchArr = str.split("origin/")
        str = branchArr[branchArr.length - 1]
        return str
    }
    return str
}

function checkout(pwd, newBranch) {
    return new Promise((res, rej) => {
        comm.startSpinner(oraspinner, "Switching to New Branch", "none")
        var checkoutBranch = spawn(`cd ${pwd} "$@" && git checkout ${newBranch}`, {
            shell: true
        });
        checkoutBranch.stdout.on('data', async function (data) {
            comm.stopSpinnerAndShowMessage(oraspinner)
            console.log(chalk.bgRed("-Checkout Message- " + data.toString()))
        })
        checkoutBranch.stdout.on("close", async function (data) {
            // console.log(chalk.keyword("lightblue").bold("Switched to new Branch- ") + chalk.keyword("yellow")(newBranch))
            let msg = chalk.keyword("lightblue").bold("Switched to new Branch- ") + chalk.keyword("yellow")(newBranch)
            comm.stopSpinnerAndShowMessage(oraspinner, "succeed", msg, "none")
            comm.copyStringToClipBoard(`git pull origin ${newBranch.trim()}`)
            return res("Checkout Complete")
        })
        checkoutBranch.stdout.on("error", async function (data) {
            // comm.showError("checkout Error Message-" + data.toString())
            return rej("checkout Error Message-" + data.toString())
        })
        checkoutBranch.stdout.on("pause", async function (data) {
            // comm.showError("Checkout Pause Message-" + data.toString())
            return rej("Checkout Pause Message-" + data.toString())
        })
        checkoutBranch.stdout.on("end", async function (data) {
            // console.log("----------------checkout successfull---------")
        })
    })
}

function getAllBranch(filterParam) {
    return new Promise(async (res, rej) => {
        let branchCommand = `git branch`
        if (filterParam) {
            if (filterParam.includes("--all") || filterParam.includes("-a")) {
                branchCommand = branchCommand + " --all"
            }
        }
        let gitBool = true
        comm.startSpinner(oraspinner, "Fetching Branch Dtails", "none")
        let getBranch = spawn(`cd ${pwd} "$@" && ${branchCommand}`, {
            shell: true
        });

        getBranch.stdout.on('error', function (data) {
            console.log("error", data)
            return rej(`Get git branch failed Error-> ${data}`)
        })

        getBranch.stdout.on('close', async function (data) {
            if (gitBool) {
                return rej(comm.stopSpinnerAndShowMessage(oraspinner, "fail", "Not a Git Repository :(", "#e88388"))
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
                    curr = chalk.keyword("orange")(curr)
                }
                return curr
            })
            comm.stopSpinnerAndShowMessage(oraspinner)
            return res(allBranchNameTemp)
        })
    })
}

function pullChanges(pwd, currentBranch) {
    return new Promise((res, rej) => {
        comm.startSpinner(oraspinner, "Fetching Latest pull", "none")
        let pullGitBool = true
        var pullChanges = spawn(`cd ${pwd} "$@" && git pull origin ${currentBranch}`, {
            shell: true
        });

        pullChanges.stdout.on('error', function (error) {
            return rej(comm.stopSpinnerAndShowMessage(oraspinner, "fail", "Git Pull Command Failed Error:" + error), "pink")
            // return comm.showError(error)
        })

        pullChanges.stdout.on('close', function (error) {
            if (pullGitBool) {
                return rej(comm.stopSpinnerAndShowMessage(oraspinner, "fail", "Pull command Failed. Please Check your connection and try again.", "pink"))
            }
        })

        pullChanges.stdout.on('data', function (pullData) {
            comm.stopSpinner(oraspinner)
            pullGitBool = false

            pullData = formatData(pullData)
            console.log(chalk.keyword("lightgreen")("  Git Pull Data:"))
            // comm.comm.comm.stopSpinnerAndShowMessage(oraspinner, "info", "Git Pull Data", "lightgreen")
            pullData.forEach(curr => {
                console.log(chalk.keyword("lightblue")(`  ${curr}`))
            })
            console.log("")
            pullChanges.stdout.on('close', async function (data) {
                // console.log(chalk.keyword("yellow")(`Pull Completed Successful for Branch`), chalk.keyword("red")(currentBranch))
                let mess = chalk.keyword("yellow")(`Pull Completed Successful for Branch`) + " " + chalk.keyword("red")(currentBranch)
                comm.stopSpinnerAndShowMessage(oraspinner, "succeed", mess, "none")
                return res("Pull completed")
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

var self = module.exports