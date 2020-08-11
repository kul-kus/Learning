var inquirer = require('inquirer');
var spawn = require('child_process').spawn;
var comm = require("./common.js")

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
                    let data = await self.read_file(fileName)
                    let selectedTenant = await comm.showOptions(Object.keys(data), "Select The Tenant to deploy")
                    console.log("selectedTenant", selectedTenant, data[selectedTenant])

                    comm.showMessageRandom(`------ Migration started on ${selectedTenant} ------`, "lightblue")
                    var cmdToExecMigrate = spawn(data[selectedTenant], {
                        shell: true
                    });
                    cmdToExecMigrate.stdout.on('data', function (data) {
                        data = data.toString()
                        if (data.includes("[ERROR]")) {
                            comm.showError(data)
                        }
                        else if (data.includes("[INFO]") && data.includes("successfully")) {
                            comm.showMessageOrange(data)
                        } else {
                            comm.showMessageRandom(data, "green")
                        }
                    })

                    // console.log("[data[selectedTenant]]-->", [data[selectedTenant]])
                    // var cmdToExecMigrate = spawn("wmio", [data[selectedTenant]], {
                    //     stdio: 'inherit',
                    //     detached: true
                    // });
                    // cmdToExecMigrate.stdout.on("data", function (data) {
                    //     process.stdout.pipe(data);
                    // });
                } else {
                    comm.showError("Unable to find file Alias.json")
                }
            });
            cmdToGetFile.on('exit', function (exitCode) {
            })
        } catch (error) {
            comm.showError(error)
        }

        // }
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