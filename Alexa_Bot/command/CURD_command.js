var comm = require("./common.js")
var fs = require("fs")
var spawn = require('child_process').spawn;


module.exports = {

    vsCode: async function () {
        try {
            let readCommand = spawn(`code ${comm.homePath}`, {
                shell: true
            })
            readCommand.stdout.on('data', function (data) {
            });
        } catch (error) {
            return comm.showError(error)
        }
    },

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
                    return comm.showError("No records found..")
                }
            }
        } catch (error) {
            return comm.showError(error)
        }
    },

    create: async function (param) {
        console.log("param-->", param)
        try {
            let questionsArr = [
                {
                    type: 'input',
                    name: 'file_name',
                    message: "Enter the new file Name",
                },
            ]
            var newFileName
            if (param && Array.isArray(param) && param.length && param[0]) {
                newFileName = {}
                newFileName["file_name"] = param[0]

            } else {
                newFileName = await comm.getInput(questionsArr)
            }
            if (!newFileName.file_name) {
                return comm.showError("Enter valid File Name.")
            }
            if (newFileName.file_name == "config.js") {
                return comm.showError("You cannot create file config.js")
            }
            if (await comm.checkIfFileExist(newFileName.file_name)) {
                return comm.showError("File Name Already Exist.")
            }
            let selectedOpt
            if (param && Array.isArray(param) && param.length && param[1] && (param[1] == "--code" || param[1] == "--nano")) {
                selectedOpt = "Open in text editor"
            } else {
                let optionsArr = [
                    "Using Config file",
                    "Using Raw data",
                    "Open in text editor"
                ]
                selectedOpt = await comm.showOptions(optionsArr, "Select the method for new File Creation.")
            }



            if (selectedOpt.includes("Config file")) {
                await comm.createFile(newFileName.file_name)
                await comm.copyFile(`${comm.wmioPath}/config.json`, `${comm.wmioPath}/${newFileName.file_name}`)
                let cofigData = await comm.readFile(newFileName.file_name)
                return comm.showMessageOrange("<--- File created Successful !! --->")
            } else if (selectedOpt.includes("Raw data")) {

                let questionsArr = [
                    {
                        type: 'json',
                        name: 'data',
                        message: "Enter the new file Raw Data",
                    },
                ]
                var newFileData = await comm.getInput(questionsArr)

                await comm.createFile(newFileName.file_name)
                if (comm.checkJson(newFileData.data)) {
                    newFileData.data = comm.convertJson(newFileData.data)
                    fs.writeFileSync(`${comm.homePath}/${newFileName.file_name}`, JSON.stringify(newFileData.data, null, 2), 'utf8');
                } else {
                    fs.writeFileSync(`${comm.homePath}/${newFileName.file_name}`, newFileData.data, 'utf8');
                }

                return comm.showMessageOrange("<--- File created Successful !! --->")
            } else {

                await comm.createFile(newFileName.file_name)
                return comm.openFileInNanoEditor(newFileName.file_name, param)
            }

        } catch (error) {
            // console.log("error", error)
            // comm.showError(error)
        }

    },

    update: async function (filtetParam) {
        try {
            let wmioFileName = await comm.getFileList(filtetParam, false)
            if (wmioFileName.length) {
                let selectedOpt = await comm.showOptions(wmioFileName, "Select the File to update.")
                comm.openFileInNanoEditor(selectedOpt, filtetParam)
            } else {
                comm.showError("No records found..")
            }
        } catch (error) {
            // comm.showError(error)
        }
    },

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
                    } else {
                        comm.showMessageOrange("Delete process terminated ..")
                    }
                } else {
                    return comm.showError("You Cannot Delete config.json File.")
                }
            } else {
                comm.showMessageOrange("No records found..")
            }
        } catch (error) {
            return comm.showError(error)
        }

        // }
    },

    rename: async function (param) {
        try {
            let wmioFileName = await comm.getFileList(param, true)
            if (wmioFileName.length) {
                let selectedOpt = await comm.showOptions(wmioFileName, "Select the File to rename.")
                if (selectedOpt != "config.json") {

                    let newFileName

                    if (param && Array.isArray(param) && param.length && param[1]) {
                        let regex = /^(--)/gi
                        if (param[1].match(regex)) {
                            param[1] = param[1].replace(regex, "")
                        }
                        newFileName = {}
                        newFileName["file_name"] = param[1]
                    } else {
                        let questionsArr = [
                            {
                                type: 'input',
                                name: 'file_name',
                                message: "Enter the new file Name",
                            },
                        ]
                        newFileName = await comm.getInput(questionsArr)
                    }

                    if (!newFileName.file_name) {
                        return comm.showError("Enter valid File Name.")
                    }
                    if (newFileName.file_name == "config.js") {
                        return comm.showError("You cannot reanme file to 'config.js'")
                    }
                    if (await comm.checkIfFileExist(newFileName.file_name)) {
                        return comm.showError("File Name Already Exist.")
                    }

                    let renameCommand = spawn(`cd "$@" && mv ${comm.wmioPath}/${selectedOpt} ${comm.wmioPath}/${newFileName.file_name}`, {
                        shell: true
                    })

                    renameCommand.stdout.on("end", function (data) {
                        comm.showMessageOrange(`-------- File renamed to ${newFileName.file_name}  Sucessfully -----`)
                    });
                    renameCommand.stdout.on("error", function (error) {
                        return comm.showError(error)
                    });
                    // }
                } else {
                    return comm.showError("You Cannot rename config.json File.")
                }
            } else {
                return comm.showError("No records found..")
            }

        } catch (error) {
            return comm.showError(error)
        }

        // }
    },

}

var self = module.exports