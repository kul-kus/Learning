var comm = require("./common.js")
var copy = require("./change_config")
var fs = require("fs")


module.exports = {
    create: async function () {
        try {

            let optionsArr = [
                "Using Config file",
                "Using Raw data",
                // "Open in text editor"
            ]
            let selectedOpt = await comm.showOptions(optionsArr, "Select the method for new File Creation.")
            console.log("selectedOpt", selectedOpt)

            let questionsArr = [
                {
                    type: 'input',
                    name: 'file_name',
                    message: "Enter the new file Name",
                },
            ]
            var newFileName = await comm.getInput(questionsArr)
            if (!newFileName.file_name) {
                comm.showError("Enter valid File Name.")
            }
            if (newFileName.file_name == "config.js") {
                comm.showError("You cannot create file config.js")
            }

            await comm.createFile(newFileName.file_name)

            if (selectedOpt.includes("Config file")) {
                await comm.copyFile(`${comm.wmioPath}/config.json`, `${comm.wmioPath}/${newFileName.file_name}`)
                let cofigData = await comm.readFile(newFileName.file_name)
                console.log(cofigData)
                comm.showMessageOrange("<--- File created Successful !! --->")
            } else if (selectedOpt.includes("Raw data")) {

                let questionsArr = [
                    {
                        type: 'input',
                        name: 'data',
                        message: "Enter the new file Raw Data",
                    },
                ]
                var newFileData = await comm.getInput(questionsArr)
                console.log("newFileData", newFileData.data)

                fs.writeFileSync(`${comm.homePath}/${newFileName.file_name}`, newFileData.data, 'utf8');
                comm.showMessageOrange("<--- File created Successful !! --->")
            } else {
                console.log("----3----")
            }

        } catch (error) {
            console.log("error", error)
            comm.showError(error)
        }

    },

}

var self = module.exports