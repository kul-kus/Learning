

let fs = require("fs")
var spawn = require('child_process').spawn;
let comm = require("./common")
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

                let file_data = fs.readFileSync(cpyfromfilepath, { encoding: 'utf8', flag: 'r' })
                fs.writeFileSync(final_path, file_data, 'utf8');
                comm.showMessage("<------ comm file created Successfully ----->")

            } catch (error) {
                return comm.showError(error)
            }
        });
    }
}

// module.exports.copy_common()