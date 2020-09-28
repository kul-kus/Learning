
var comm = require("./../common")
var gitComm = require("./gitCommon")
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
            pwd = await gitComm.getCurrentPWD()
            var { allBranchName, currBranch } = await gitComm.getBranchDeatils(filterParam, pwd, oraspinner)
            currentBranch = currBranch
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
                await gitComm.pullChanges(pwd, newBranch, oraspinner)
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



var self = module.exports