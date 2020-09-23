
var comm = require("./common")
var spawn = require('child_process').spawn;
let chalk = require("chalk")
const stripAnsi = require('strip-ansi');

var currentBranch = ""
var pwd = ""

module.exports = {
    checkout: async function (filterParam) {
        // console.log("filterParam", filterParam)
        // console.log("commitMess", filterParam)
        try {
            pwd = await getCurrentPWD()
            // pwd = "/home/kulk@eur.ad.sag/kul/a-my-connector-triggers/git_Irepo/Kul-Learning/Learning/googleMaps"
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
                console.log(chalk.keyword("white")("Current Branch -> ") + chalk.keyword("orange")(currentBranch))

                let newBranch = await comm.showOptions(allBranchName, "Select the Branch to checkout.")
                newBranch = stripAnsi(newBranch).trim()
                newBranch = splitFromOrigin(newBranch)

                await checkout(pwd, newBranch)
                await pullChanges(pwd, newBranch)
            }

        } catch (error) {
            console.log(chalk.keyword("red")(error))
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


function checkout(pwd, newBranch) {
    return new Promise((res, rej) => {

        var checkoutBranch = spawn(`cd ${pwd} "$@" && git checkout ${newBranch}`, {
            shell: true
        });
        checkoutBranch.stdout.on('data', function (data) {
            console.log(chalk.bgRed("-Checkout Message- " + data.toString()))
        })
        checkoutBranch.stdout.on("close", function (data) {
            console.log(chalk.keyword("lightblue").bold("Switched to new Branch- ") + chalk.keyword("yellow")(newBranch))
            comm.copyStringToClipBoard(`git pull origin ${newBranch.trim()}`)
        })
        checkoutBranch.stdout.on("error", function (data) {
            // comm.showError("checkout Error Message-" + data.toString())
            return rej("checkout Error Message-" + data.toString())
        })
        checkoutBranch.stdout.on("pause", function (data) {
            // comm.showError("Checkout Pause Message-" + data.toString())
            return rej("Checkout Pause Message-" + data.toString())
        })
        checkoutBranch.stdout.on("end", async function (data) {
            return res("Checkout Complete")
            // console.log("----------------checkout successfull---------")
        })
    })
}
function getAllBranch(filterParam) {
    let branchCommand = `git branch`
    if (filterParam.includes("--all") || filterParam.includes("-a")) {
        branchCommand = branchCommand + " --all"
    }
    let gitBool = true
    return new Promise((res, rej) => {
        let getBranch = spawn(`cd ${pwd} "$@" && ${branchCommand}`, {
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
                    curr = chalk.keyword("orange")(curr)
                }
                return curr
            })

            return res(allBranchNameTemp)
        })
    })
}

function pullChanges(pwd, newBranch) {
    return new Promise((res, rej) => {
        var pullChanges = spawn(`cd ${pwd} "$@" && git pull origin ${newBranch}`, {
            shell: true
        });

        pullChanges.stdout.on('error', async function (error) {
            return rej("Git Pull Command Failed Error:" + error)
            // return comm.showError(error)
        })

        pullChanges.stdout.on('data', function (pullData) {
            pullData = formatData(pullData)
            console.log("")
            console.log(chalk.keyword("lightgreen").bold("Git Pull Data:"))
            pullData.forEach(curr => {
                console.log(chalk.keyword("lightblue")(curr))
            })
            console.log("")
            pullChanges.stdout.on('close', function (data) {
                console.log(chalk.keyword("orange")(`Pull Completed Successful for Branch`), chalk.keyword("red")(newBranch))
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