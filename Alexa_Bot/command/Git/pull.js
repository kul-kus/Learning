

var gitComm = require("./gitCommon")
var spawn = require('child_process').spawn;
let chalk = require("chalk")
const cliSpinners = require('cli-spinners').dots
const oraspinner = require('ora')()
oraspinner.spinner = cliSpinners

var currentBranch = ""
var pwd = ""

module.exports = {
    pull: async function () {
        try {
            pwd = await gitComm.getCurrentPWD()
            // console.log("pwd", pwd)
            var { allBranchName, currBranch } = await gitComm.getBranchDeatils(null, pwd, oraspinner)
            currentBranch = currBranch
            console.log(chalk.keyword("white")("\n  Current Branch: ") + chalk.keyword("orange")(`${currentBranch}\n`))
            await gitComm.pullChanges(pwd, currentBranch,oraspinner)
            // await (pwd, currentBranch)
        } catch (error) {
            // console.log("error", error)
            // console.log(chalk.keyword("red")(error))
        }
    }

}

function getAllBranch(filterParam) {
    let branchCommand = `git branch`
    if (filterParam) {
        if (filterParam.includes("--all") || filterParam.includes("-a")) {
            branchCommand = branchCommand + " --all"
        }
    }
    let gitBool = true
    return new Promise((res, rej) => {
        comm.startSpinner(oraspinner, "Fetching Branch Details", "none")
            let getBranch = spawn(`cd ${pwd} "$@" && ${branchCommand}`, {
                shell: true
            });

            getBranch.stdout.on('error', function (data) {
                console.log("error", data)
                return rej(`Get git branch failed Error-> ${data}`)
            })

            getBranch.stdout.on('close', function (data) {
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
                comm.stopSpinner(oraspinner)
                return res(allBranchNameTemp)
            })
    })
}


function pullChanges(pwd, currentBranch) {
    return new Promise((res, rej) => {
        comm.startSpinner(oraspinner, "Fetching Latest pull", "none")
        let gitBool = true
        var pullChanges = spawn(`cd ${pwd} "$@" && git pull origin ${currentBranch}`, {
            shell: true
        });

        pullChanges.stdout.on('error', async function (error) {
            return rej(comm.stopSpinnerAndShowMessage(oraspinner, "fail", "Git Pull Command Failed Error:" + error), "pink")
            // return comm.showError(error)
        })

        pullChanges.stdout.on('close', async function (error) {
            if (gitBool) {
                return rej(comm.stopSpinnerAndShowMessage(oraspinner, "fail", "Pull command Failed. Please Check your connection and try again.", "pink"))
            }
        })

        pullChanges.stdout.on('data', function (pullData) {
            comm.stopSpinner(oraspinner)
            gitBool = false
            pullData = formatData(pullData)
            console.log(chalk.keyword("lightgreen")("  Git Pull Data:"))
            // comm.comm.stopSpinnerAndShowMessage(oraspinner, "info", "Git Pull Data", "lightgreen")
            pullData.forEach(curr => {
                console.log(chalk.keyword("lightblue")(`  ${curr}`))
            })
            console.log("")
            pullChanges.stdout.on('close', function (data) {
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



// var self = module.exports