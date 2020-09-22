var inquirer = require('inquirer');
var spawn = require('child_process').spawn;
var comm = require("./common.js")
let chalk = require("chalk")
const stripAnsi = require('strip-ansi');
module.exports = {
    migrate: function (command) {
        try {
            var cmdToGetFile = spawn('cd "$@" && ls wmio/.connector', {
                shell: true
            });
            let wmioFileName = []
            cmdToGetFile.stdout.on('data', async function (data) {
                wmioFileName = data.toString().split("\n").filter(Boolean)
                let fileName = "alias.json"

                if (wmioFileName.includes(fileName)) {
                    let readData = await self.read_file(fileName)
                    let showOptionsArr = []
                    Object.keys(readData).forEach(curr => {
                        let arrStr = ""
                        arrStr += chalk.keyword("lightgreen")(`${curr}`)
                        arrStr += chalk.keyword("grey")(" :")
                        let tenantArr = readData[curr].split(" ")
                        if (tenantArr && tenantArr[2]) {
                            let tenantUrl = tenantArr[2]
                            arrStr += chalk.keyword("grey")(` Url: `)
                            arrStr += `${tenantUrl}`
                        } if (tenantArr && tenantArr[3]) {
                            let tenantEmail = tenantArr[3]
                            arrStr += chalk.keyword("grey")(` Email: `)
                            arrStr += ` ${tenantEmail}`
                        }
                        showOptionsArr.push(arrStr)
                    })
                    let selectedTenant = await comm.showOptions(showOptionsArr, "Select The Tenant to deploy")

                    comm.showMessageRandom(`------ Migration started on ${selectedTenant} ------`, "lightblue")
                    selectedTenant = stripAnsi(selectedTenant).trim()
                    let tenantLabel = selectedTenant.split(" : ")[0]
                    if (readData[tenantLabel]) {
                        var cmdToExecMigrate = spawn(readData[tenantLabel], {
                            shell: true
                        });
                        cmdToExecMigrate.stdout.on('data', function (data) {
                            data = data.toString()
                            if (data.includes("[ERROR]")) {
                                return comm.showError(data)
                            }
                            else if (data.includes("[INFO]") && data.includes("successfully")) {
                                comm.showMessageOrange(data)
                            } else {
                                comm.showMessageRandom(data, "green")
                            }
                        })
                    } else {
                        return comm.showMessage("Unable to find Tenant Details.")
                    }
                } else {
                    return comm.showError("Unable to find file Alias.json")
                }
            });
            cmdToGetFile.on('exit', function (exitCode) {
            })
        } catch (error) {
            return comm.showError(error)
        }
    },
    read_file(fileName) {
        return new Promise((res, rej) => {
            let readCommand = spawn(`cd "$@" && cat wmio/.connector/${fileName}`, {
                shell: true
            })
            readCommand.stdout.on('data', function (data) {
                data = data.toString()
                if (comm.checkJson(data)) {
                    data = comm.convertJson(data)
                }
                // let finalData = JSON.parse(data.toString())
                res(data)
            });

            readCommand.stdout.on("error", function (err) {
                rej(err)
            })
        })

    }
}

var self = module.exports