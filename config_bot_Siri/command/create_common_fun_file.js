

var spawn = require('child_process').spawn;
let fs = require("fs")
var spawn = require('child_process').spawn;
let comm = require("./common")
// require("./../common_function_connectors")
let cpyfromfilepath = require("./../config").basepath

module.exports = {
    copy_common: function () {
        var cmdToGetFile = spawn('pwd', {
            shell: true
        });

        cmdToGetFile.stdout.on('data', function (data) {
            try {
                let cpyToPath = data.toString().trim()
                cpyToFilefile = "common_fun.js"
                let final_path = `${cpyToPath}/${cpyToFilefile}`
                final_path = final_path.replace(/(\s+)/g, '\\$1')

                // console.log("final_path=========>", final_path)
                let file_data = fs.readFileSync(cpyfromfilepath, { encoding: 'utf8', flag: 'r' })
                // let file_data = "ssss"
                fs.writeFileSync(final_path, file_data, 'utf8');
                comm.showMessage("<------ comm file created Successfully ----->")

            } catch (error) {
                comm.showError(error)
            }
        });
    }
}

// module.exports.copy_common()