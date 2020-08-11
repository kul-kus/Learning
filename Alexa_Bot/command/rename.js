var inquirer = require('inquirer');
var spawn = require('child_process').spawn;
var comm = require("./common.js")

module.exports = {
    rename: async function (filtetParam) {
        try {


            let wmioFileName = await comm.getFileList(filtetParam, true)
            if (wmioFileName.length) {
                let selectedOpt = await comm.showOptions(wmioFileName, "Select the File to rename.")
                if (selectedOpt != "config.json") {

                    let questionsArr = [
                        {
                            type: 'input',
                            name: 'file_name',
                            message: "Enter the new file Name",
                        },
                    ]
                    let newFileName = await comm.getInput(questionsArr)
                    if (!newFileName.file_name) {
                        comm.showError("Enter valid File Name.")
                    }
                    if (newFileName.file_name == "config.js") {
                        comm.showError("You cannot reanme file to 'config.js'")
                    }
                    let renameCommand = spawn(`cd "$@" && mv ${comm.wmioPath}/${selectedOpt} ${comm.wmioPath}/${newFileName.file_name}`, {
                        shell: true
                    })

                    renameCommand.stdout.on("end", function (data) {
                        comm.showMessageOrange(`-------- File renamed to ${newFileName.file_name}  Sucessfully -----`)
                    });
                    renameCommand.stdout.on("error", function (error) {
                        comm.showError(error)
                    });
                    // }
                } else {
                    comm.showError("You Cannot rename config.json File.")
                }
            } else {
                comm.showError("No records found..")
            }





        } catch (error) {
            comm.showError(error)
        }

        // }
    },

}

var self = module.exports