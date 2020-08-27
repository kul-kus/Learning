
var basefile = "config.json"
var comm = require("./common")
var spawn = require('child_process').spawn;

module.exports = {
    change_config: async function (filterParam) {
        console.log("filterParam", filterParam)
        try {
            let wmioFileName = await comm.getFileList(filterParam, true)
            if (wmioFileName.length) {
                let selectedOpt = await comm.showOptions(wmioFileName, "Select the tenant.")

                await comm.copyFile(`${comm.wmioPath}/${selectedOpt}`, `${comm.wmioPath}/${basefile}`)

                let cofigData = await comm.readFile(basefile)
                console.log(cofigData)
                comm.showMessageOrange("<------------ Successful -------------->")

                if (filterParam && filterParam.length && filterParam[1] && filterParam[1] == "--deploy") {

                    //----------------------------------------
                    comm.showMessageRandom(`------ Deployment started on ${cofigData.host} ------`, "lightblue")
                    var cmdToGetPWD = spawn(`pwd`, {
                        shell: true
                    });
                    cmdToGetPWD.stdout.on('data', function (data) {
                        let pwd = data.toString().trim()
                        var cmdToExecDeployCommand = spawn(`cd ${pwd} "$@" && wmio deploy`, {
                            shell: true
                        });

                        cmdToExecDeployCommand.stdout.on('data', function (data) {
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
                    })
                    //---------------------------------

                }
            } else {
                comm.showMessageOrange("No records found..")
            }

        } catch (error) {
            comm.showError(error)
        }
    }

}

var self = module.exports