
var comm = require("./common.js")

module.exports = {
    show: async function (command, filtetParam) {
        try {
            if (command == "whoami" || command == "alias") {
                let fileName = (command == "whoami") ? ("config.json") : ("alias.json")
                let finalData = await comm.readFile(fileName)
                console.log(finalData)
            } else {
                let wmioFileName = await comm.getFileList(filtetParam, true)
                if (wmioFileName.length) {
                    let selectedOpt = await comm.showOptions(wmioFileName, "Select the File view.")
                    let finalData = await comm.readFile(selectedOpt)
                    console.log(finalData)
                } else {
                    comm.showError("No records found..")
                }
            }
        } catch (error) {
            comm.showError(error)
        }
    }
}