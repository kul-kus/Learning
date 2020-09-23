

var comm = require("./common")
var spawn = require('child_process').spawn;
let chalk = require("chalk")

var currentBranch = ""
var pwd = ""

///home/kulk@eur.ad.sag/kul/a-my-connector-triggers/git_Irepo/integration-connectors

module.exports = {
    pull: async function () {
        try {

            pwd = await getCurrentPWD()
            // pwd = "/home/kulk@eur.ad.sag/kul/a-my-connector-triggers/git_Irepo/Kul-Learning/Learning/googleMaps"
            
            let allBranchName = await getAllBranch()
            console.log(chalk.keyword("white")("Current Branch -> ") + chalk.keyword("orange")(currentBranch))
            await pullChanges(pwd, currentBranch)
        } catch (error) {
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

function formatData(data) {
    if (data) {
        return data.toString().split('\n').filter(curr => Boolean(curr)).map(curr => curr.trim())
    }
    return ""
}



var self = module.exports