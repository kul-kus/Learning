
var comm = require("./common")
var inquirer = require('inquirer');
let chalk = require("chalk")
const stripAnsi = require('strip-ansi');

async function ab() {
    let listdata = [
        {
            name: chalk.keyword("magenta")(" Added: ") + "abc.js",
        },
        {
            name: chalk.keyword("magenta")(" Added: ") + "/comm/tp.js",
        },
        {
            name: chalk.keyword('lightgreen')(" Modified: ") + "/comm/fun.js",
        },
        {
            name: chalk.keyword('brown')(" Deleted:  ") + "/comm/tp.js",
        }
    ]
    console.log("---")
    try {
        let data = await GetCommitFiles(listdata)
        console.log("data--->", data)
    } catch (error) {
        console.log("error", error)

    }
} ab()


function GetCommitFiles(arr) {

    let CommitChoice = [
        new inquirer.Separator('-- Modified Files --'),
    ]
    CommitChoice = CommitChoice.concat(arr)
    return new Promise((res, rej) => {

        inquirer.prompt([
            {
                type: 'checkbox',
                message: 'Select The Changes to Commit',
                name: 'files',
                choices: CommitChoice,
                validate: function (answer) {
                    if (answer.length < 1) {
                        return 'You must choose at least one Changes to commit.';
                    }

                    return true;
                },
            },
        ]).then((answers) => {
            if (answers && answers.files && Array.isArray(answers.files) && answers.files.length) {
                let command = ""
                answers.files.forEach(curr => {
                    curr = stripAnsi(curr).trim()  
                    console.log("GetCommitFiles 1-> curr", stripAnsi(curr), curr)

                    console.log("GetCommitFiles 2-> curr", curr)

                    if (curr.includes("Added: ")) {
                        curr = curr.replace("Added: ", "")
                    }
                    if (curr.includes("Modified: ")) {
                        curr = curr.replace("Modified: ", "")
                    }
                    if (curr.includes("Deleted: ")) {
                        curr = curr.replace("Deleted: ", "")
                    }
                    command += "" + curr.trim()
                });
                console.log("GetCommitFiles -> command", command.length)
                return res(command)
                console.log("command", command)


            } else {
                return rej("No Files selected to Commit")
                // console.log("No Files selected to Commit")
            }
        })
    })
}

