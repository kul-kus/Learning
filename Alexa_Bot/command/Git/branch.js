

var gitComm = require("./gitCommon")
var spawn = require('child_process').spawn;
let chalk = require("chalk")
const cliSpinners = require('cli-spinners').dots
const oraspinner = require('ora')()
oraspinner.spinner = cliSpinners

var currentBranch = ""
var pwd = ""
module.exports = {
    branch: async function () {
        try {
            pwd = await gitComm.getCurrentPWD()
            var { allBranchName, currBranch } = await gitComm.getBranchDeatils(null, pwd, oraspinner)
            currentBranch = currBranch
            console.log(chalk.keyword("white")("\n  Current Branch: ") + chalk.keyword("orange")(`${currentBranch}\n`))
        } catch (error) {
            // console.log("error", error)
            // console.log(chalk.keyword("red")(error))
        }
    }

}