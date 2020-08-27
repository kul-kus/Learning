
var comm = require("./common")

module.exports = {
    open: async function (filterParam) {
        try {

            let command = filterParam.splice(0, 1)
            if (command && Array.isArray(command) && command.length == 0) {
                command = await comm.showOptions(["Git Repo", "Config Files", "Alexa Code"], "Select Repository to open.")
            }

            if (command == "Git Repo" || command == "git") {
                if (filterParam == "--all") {
                    comm.openFileInNanoEditor("", [null, "--code"], "git")
                } else {
                    let wmioFileName = await comm.getFileList(filterParam, true, "git")
                    // console.log("wmioFileName", wmioFileName)
                    if (wmioFileName.length) {
                        let selectedOpt = await comm.showOptions(wmioFileName, "Select Repository to open.")
                        console.log("selectedOpt", selectedOpt)
                        comm.openFileInNanoEditor(selectedOpt, [null, "--code"], "git")
                    } else {
                        comm.showMessageOrange("No records found..")
                    }
                }

            } else if (command == "Config Files" || command == "config") {
                comm.openFileInNanoEditor("", [null, "--code"], "config")
            } else if (command == "Alexa Code" || command == "code") {
                comm.openFileInNanoEditor("", [null, "--code"], "code")
            } else {
                comm.showMessageOrange(".. Please enter valid command ..")
            }
        } catch (error) {
            // comm.showError(error)
        }
    }

}

var self = module.exports