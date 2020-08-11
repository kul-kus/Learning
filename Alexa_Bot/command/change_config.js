var spawn = require('child_process').spawn;
var inquirer = require('inquirer');
var basefile = "config.json"
var basepath = "wmio/.connector/"
var comm = require("./common")

module.exports = {
    change_config: async function (filterParam) {
        try {
                let wmioFileName = await comm.getFileList(filterParam, true)
                if (wmioFileName.length) {
                    let selectedOpt = await comm.showOptions(wmioFileName, "Select the tenant.")

                    await comm.copyFile(`${comm.wmioPath}/${selectedOpt}`, `${comm.wmioPath}/${basefile}`)

                    let cofigData = await comm.readFile(basefile)
                    console.log(cofigData)
                    comm.showMessageOrange("<------------ Successful -------------->")
                } else {
                    comm.showMessageOrange("No records found..")
                }
            
        } catch (error) {
            comm.showError(error)
        }
    }

}

var self = module.exports