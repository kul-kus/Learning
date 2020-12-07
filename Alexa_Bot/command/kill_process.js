


//kill -9 `lsof -t -u kulk@eur.ad.sag`
//lsof -i TCP:8080
//killall -9 slack node

var spawn = require('child_process').spawn;
const { t } = require('typy');
var inquirer = require('inquirer');
let chalk = require("chalk")
const stripAnsi = require('strip-ansi');
var comm = require("./common.js")
const cliSpinners = require('cli-spinners').dots
const oraspinner = require('ora')()
oraspinner.spinner = cliSpinners

module.exports = {
    // kill: async function (command) {
    kill: function (command) {
        return new Promise(async function (resolve, reject) {

            let allBool = false
            let ForceBol = false

            let listProcessCmd = `lsof -i -P -n`
            // console.log("command", command)
            if (command && t(command).isArray && command.length) {
                allBool = CheckParameter(command, "all", "a")
                ForceBol = CheckParameter(command, "force", "f")

                if (command[0] && !isNaN(command[0])) {
                    listProcessCmd = `lsof -i TCP:${command[0]}`
                }
            }
            try {
                let selProcess = ""
                let processArr = await ListProcess(listProcessCmd, oraspinner)
                if (processArr && processArr.length) {
                    let show_msg
                    if (allBool) {
                        selProcess = makeProcessData(processArr)
                        show_msg = selProcess
                        show_msg = show_msg.split(" ").join(`\n○ `)
                        show_msg = chalk.keyword("grey")(show_msg)
                        // console.log("show_msg", show_msg)
                        if (!ForceBol) {
                            if (await comm.confirmOptions(`Do you want to Kill the Following Process... ${show_msg}\n`)) {
                                await killProcess(selProcess)
                                comm.stopSpinnerAndShowMessage(oraspinner, "succeed", "Process killed successfully.", comm.hexColors.green)
                                return resolve("Succeed")
                            } else {
                                comm.stopSpinnerAndShowMessage(oraspinner, "fail", "Kill Process Terminated.", comm.hexColors.red)
                                return rejected("Failed")
                            }
                        } else {
                            await killProcess(selProcess)
                            comm.stopSpinnerAndShowMessage(oraspinner, "succeed", "Following process have been killed successfully." + show_msg, comm.hexColors.green)
                            return resolve("Succeed")
                        }
                    } else {
                        selProcess = await ShowMultipleSelection(processArr)
                        show_msg = selProcess
                        show_msg = show_msg.split(" ").join(`\n○ `)
                        show_msg = chalk.keyword("grey")(show_msg)
                        await killProcess(selProcess)
                        comm.stopSpinnerAndShowMessage(oraspinner, "succeed", "Following process have been killed successfully." + show_msg, comm.hexColors.green)
                        return resolve("Succeed")
                    }
                } else {
                    comm.stopSpinnerAndShowMessage(oraspinner, "info", "No Process Found.")
                    return rejected("Failed")
                }
            } catch (error) {
                return comm.showError(error)
                // return rejected(error)

            }
        })

    }
}


function CheckParameter(arr, fparam, sparam) {
    if (arr && Array.isArray(arr)) {
        if (arr.indexOf(`--${fparam}`) > -1 || arr.indexOf(`-${fparam}`) > -1 || arr.indexOf(`-${sparam}`) > -1) {
            return true
        }
        return false
    }
    return false
}
function ListProcess(listProcessCmd, oraspinner) {
    let processArr = []

    return new Promise((res, rej) => {
        comm.startSpinner(oraspinner, "Fetching Active process")
        var cmdToListProcess = spawn(listProcessCmd, {
            shell: true
        })

        let process_data = ""
        cmdToListProcess.stdout.on('data', function (data) {
            process_data = data.toString().split("\n").filter(Boolean)
            process_data.slice(1).map((curr) => {
                let fdata = curr.replace(/ +/g, "=").split("=")
                // processArr.push(` ${(fdata[0] == "chromium-") ? ("chromium-browser") : (fdata[0])} ProcessId-${fdata[1]}`)
                processArr.push(` ${(fdata[0] == "chromium-") ? ("chromium-browser") : (fdata[0])}`)
            })
        })

        cmdToListProcess.stdout.on("close", () => {
            comm.stopSpinner(oraspinner)
            return res([...new Set(processArr)])
        })

        cmdToListProcess.stdout.on("error", (err) => {
            return rej(err)
        })
    })
}

function killProcess(pname) {
    return new Promise((res, rej) => {
        var cmdToListProcess = spawn(`killall ${pname}`, {
            shell: true
        })
        cmdToListProcess.stdout.on('data', function (data) {
        })
        cmdToListProcess.stdout.on("close", () => {
            return res("done")
        })
        cmdToListProcess.stdout.on("error", (err) => {
            return rej(err)
        })
    })
}
function ShowMultipleSelection(arr) {
    let CommitChoice = [
        // new inquirer.Separator('-- Modified Files --'),
    ]
    CommitChoice = CommitChoice.concat(arr)
    return new Promise((res, rej) => {
        inquirer.prompt([
            {
                type: 'checkbox',
                message: 'Select The Process to Kill',
                name: 'files',
                choices: CommitChoice,
                validate: function (answer) {
                    if (answer.length < 1) {
                        return 'You must choose at least one Changes to Kill.';
                    }
                    return true;
                },
            },
        ]).then((answers) => {
            if (answers && answers.files && Array.isArray(answers.files) && answers.files.length) {
                return res(makeProcessData(answers.files))
            } else {
                return rej("No Process selected to Kill")
            }
        })
    })
}

function makeProcessData(answers) {
    let command = ""
    answers.forEach(curr => {
        curr = stripAnsi(curr).trim().split(" ProcessId")[0]
        command += " " + curr.trim()
    });
    return command
}

var self = module.exports