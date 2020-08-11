var inquirer = require('inquirer');
var spawn = require('child_process').spawn;
var comm = require("./common.js")

module.exports = {
    delete: async function (filtetParam) {
        try {
            let wmioFileName = await comm.getFileList(filtetParam, true)
            if (wmioFileName.length) {
                let selectedOpt = await comm.showOptions(wmioFileName, "Select the File to be deleted.")
                // console.log("selectedOpt-->", selectedOpt)
                if (selectedOpt != "config.json") {
                    if (await comm.confirmOptions(`Do you want to delete file ${selectedOpt}`)) {
                        let delCommand = spawn(`cd "$@" && rm wmio/.connector/${selectedOpt}`, {
                            shell: true
                        })

                        delCommand.stdout.on("end", function (data) {
                            comm.showMessageOrange(`-------- File ${selectedOpt} Deleted Sucessfully -----`)
                        });
                        delCommand.stdout.on("error", function (error) {
                            comm.showError(error)
                        });
                    }else{
                        comm.showMessageOrange("Delete process terminated ..")
                    }
                } else {
                    comm.showError("You Cannot Delete config.json File.")
                }
            } else {
                comm.showMessageOrange("No records found..")
            }
        } catch (error) {
            comm.showError(error)
        }

        // }
    },

}

var self = module.exports