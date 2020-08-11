var inquirer = require('inquirer');
var spawn = require('child_process').spawn;
var comm = require("./common.js")

module.exports = {
    update: async function (filtetParam) {
        try {
            let wmioFileName = await comm.getFileList(filtetParam, false)
            if (wmioFileName.length) {
                let selectedOpt = await comm.showOptions(wmioFileName, "Select the File to update.")
                let updateCommand = spawn("nano", [`wmio/.connector/${selectedOpt}`], {
                    stdio: 'inherit',
                    detached: true
                })
                updateCommand.stdout.on("data", function (data) {
                    process.stdout.pipe(data);
                });
            } else {
                comm.showError("No records found..")
            }
        } catch (error) {
            // comm.showError(error)
        }
    },

}
