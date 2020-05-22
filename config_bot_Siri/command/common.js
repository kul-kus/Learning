let chalk = require("chalk")

module.exports = {
    showError: function (msg) {
        console.log(chalk.keyword("maroon")("Error-> " + msg))
    },
    showMessage: function (msg) {
        console.log(chalk.keyword('brown')(msg))
    },
    showMessageOrange: function (msg) {
        console.log(chalk.keyword('orange')(msg))
    },
    convertJson: function (str) {
        try {
            str = (str && typeof str === "string") ? JSON.parse(str) : str;
        } catch (e) {
            return str;
        }
        return str;
    },

    checkJson: function (str) {
        try {
            (str && typeof str === "string") ? JSON.parse(str) : str;
        } catch (e) {
            return false;
        }
        return true;
    },


}