

var comm = require("./common")
var spawn = require('child_process').spawn;
let chalk = require("chalk")
var inquirer = require('inquirer');
const stripAnsi = require('strip-ansi');


///home/kulk@eur.ad.sag/kul/a-my-connector-triggers/git_Irepo/integration-connectors

module.exports = {
    push: async function (commitMess) {
        console.log("commit Message-> ", commitMess[0])
        try {
            if (commitMess && commitMess.length == 0) {
                return comm.showError("Please provide valid Commit Message.")
            }
            if (commitMess && commitMess.length && !commitMess[0]) {
                return comm.showError("Please provide valid Commit Message.")
            }


            var cmdToGetPWD = spawn(`pwd`, {
                shell: true
            });

            cmdToGetPWD.stdout.on('data', function (data) {
                let pwd = data.toString().trim()
                // let pwd = "/home/kulk@eur.ad.sag/kul/a-my-connector-triggers/git_Irepo/Kul-Learning/Learning"
                console.log("pwd", pwd)

                var getBranch = spawn(`cd ${pwd} "$@" && git branch`, {
                    shell: true
                });

                getBranch.stdout.on('data', function (data) {
                    let regex = /^(\*\ )/gi
                    let currentBranch = ""
                    let allBranchName = data.toString().split('\n')
                    allBranchName = allBranchName.filter(curr => Boolean(curr)).map(curr => {
                        curr = curr.trim()
                        if (curr.match(regex)) {
                            curr = curr.replace(regex, "")
                            currentBranch = curr
                        }
                        return curr
                    })

                    // console.log("allBranchName ", allBranchName)
                    // comm.showMessageOrange(" Current Branch -> " + currentBranch)
                    console.log(chalk.keyword("lightblue")("Current Branch -> ") + chalk.keyword("red")(currentBranch))
                    // data = data.toString().split('\n')


                    var getIfCommits = spawn(`cd ${pwd} "$@" && git status`, {
                        shell: true
                    });

                    getIfCommits.stdout.on('data', function (data) {
                        data = formatData(data)
                        if (data && Array.isArray(data) && data.length && data.indexOf("nothing to commit, working tree clean") == -1) {
                            var getStatus = spawn(`cd ${pwd} "$@" && git status -s`, {
                                shell: true
                            });
                            getStatus.stdout.on('data', async function (data) {
                                data = formatData(data)

                                console.log('\n', chalk.keyword("pink")("Files Changed"))
                                console.log(chalk.keyword("grey")(data.join('\n'), '\n'))

                                if (data && Array.isArray(data) && data.length) {
                                    let commitModified = data.filter(curr => curr.startsWith("M "))
                                    let commitModified1 = data.filter(curr => curr.startsWith("MM "))

                                    commitModified = commitModified.concat(commitModified1)

                                    // console.log("Modified Files", commitModified)
                                    let commitDeleted = data.filter(curr => curr.startsWith("D "))
                                    // console.log("Deleted Files", commitDeleted)
                                    let commitAdded = data.filter(curr => curr.startsWith("??"))
                                    // console.log("Added Files", commitAdded)

                                    console.log("")
                                    // comm.showMessageRandom("List of changes made to Files.", "cyan")
                                    let commitFilesList = []
                                    let addStingMess = "git add"

                                    if (commitAdded.length) {
                                        commitAdded.forEach(curr => {
                                            curr = curr.replace("?? ", "")
                                            // console.log(chalk.bold.magenta("Added:    "), curr)
                                            // addStingMess += ` ${curr}`
                                            commitFilesList.push({
                                                name: chalk.keyword("magenta")(" Added: ") + curr,
                                            })
                                        })
                                    }
                                    if (commitModified.length) {
                                        commitModified.forEach(curr => {
                                            curr = curr.replace("M ", "")
                                            // console.log(chalk.keyword('lightgreen')("Modified: "), curr)
                                            // addStingMess += ` ${curr}`

                                            commitFilesList.push({
                                                name: chalk.keyword("lightgreen")(" Modified: ") + curr,
                                            })

                                        })
                                    }
                                    if (commitDeleted.length) {
                                        commitDeleted.forEach(curr => {
                                            curr = curr.replace("D ", "")
                                            // console.log(chalk.keyword('brown')("Deleted:  "), curr)
                                            // addStingMess += ` ${curr}`

                                            commitFilesList.push({
                                                name: chalk.keyword("brown")(" Deleted: ") + curr,
                                            })
                                        })
                                    }

                                    console.log()
                                    // console.log(commitFilesList)

                                    let commitFiles = await GetCommitFiles(commitFilesList)
                                    addStingMess += ` ${commitFiles.trim()}`
                                    // console.log("Generated Add Command->", typeof addStingMess, addStingMess, addStingMess.length)
                                    // console.log("Generated Add addStingMess1=>", typeof addStingMess, addStingMess.trim(), addStingMess.trim().length)
                                    // addStingMess1 = addStingMess1.toString()
                                    // addStingMess = addStingMess
                                    // git add googleMaps/common_fun.js

                                    console.log(chalk.keyword("orange")("Add Command Generated:"), addStingMess)

                                    if (await comm.confirmOptions(`Do you want to push the above Mentioned Changes`)) {

                                        //------------------code to push the changes to repo--------------
                                        console.log(chalk.keyword("magenta")("Command Initiated: "), addStingMess)

                                        var addChanges = spawn(`cd ${pwd} "$@" && ${addStingMess}`, {
                                            shell: true
                                        });
                                        addChanges.stdout.on('data', async function (data) {
                                            data = formatData(data)
                                            console.log("Git add Data: ", data)
                                        })
                                        addChanges.stdout.on('error', async function (error) {
                                            return comm.showError(error)
                                        })
                                        addChanges.stdout.on('close', async function (cdata) {
                                            //------------------------- commit the changes----------
                                            var commitChanges = spawn(`cd ${pwd} "$@" && git commit -m ${commitMess[0]}`, {
                                                shell: true
                                            });
                                            commitChanges.stdout.on('error', async function (error) {
                                                return comm.showError(error)
                                            })
                                            commitChanges.stdout.on('data', async function (data) {
                                                data = formatData(data)
                                                console.log("")
                                                if (data.indexOf("no changes added to commit") > -1) {
                                                    console.log(chalk.green("No changes added to commit.", '\n'))

                                                } else {
                                                    console.log(chalk.keyword("lightgreen")("Git Commit Data: "))
                                                    console.log(chalk.keyword("lightblue")(data.join('\n')))
                                                    commitChanges.stdout.on('close', async function (data) {
                                                        data = formatData(data)
                                                        console.log(chalk.keyword("cyan")("Code Commited Successfully on branch"), chalk.keyword("red")(currentBranch))

                                                        //--------------- pull latest changes------------
                                                        // cd ${pwd} "$@" && git pull origin ${selectedBranch}
                                                        var pullChanges = spawn(`cd ${pwd} "$@" && git pull origin ${currentBranch}`, {
                                                            shell: true
                                                        });

                                                        pullChanges.stdout.on('error', async function (error) {
                                                            return comm.showError(error)
                                                        })

                                                        // let pullData
                                                        pullChanges.stdout.on('data', function (pullData) {
                                                            pullData = formatData(pullData)

                                                            console.log("")
                                                            console.log(chalk.keyword("yellow")("pullData: "), chalk.keyword("lightblue")(pullData.join(". ")))

                                                            if (pullData && Array.isArray(pullData) && pullData.length && pullData.indexOf("Already up to date.") > -1) {
                                                                pullChanges.stdout.on('close', function (data) {

                                                                    console.log(chalk.keyword("yellow")(`Pull Completed Successful for Branch`), chalk.keyword("red")(currentBranch))
                                                                    //------------------Push the changes to the repo------------------

                                                                    var pushChanges = spawn(`cd ${pwd} "$@" && git push origin ${currentBranch}`, {
                                                                        shell: true
                                                                    });

                                                                    pushChanges.stdout.on('error', function (error) {
                                                                        console.log(chalk.red("Push Error: ", error))
                                                                        return comm.showError(error)
                                                                    })
                                                                    pushChanges.stdout.on('data', function (data) {
                                                                        data = formatData(data)
                                                                        console.log("Push Data: ", data)
                                                                    })
                                                                    pushChanges.stdout.on('close', function (data) {
                                                                        data = formatData(data)

                                                                        console.log("")
                                                                        comm.showMessageOrange("Push Completed Successfully :)")

                                                                        var commitLog = spawn(`cd ${pwd} "$@" && git log -1`, {
                                                                            shell: true
                                                                        });
                                                                        commitLog.stdout.on('error', function (error) {
                                                                            console.log(chalk.red("git Log Error: ", error))
                                                                            return comm.showError(error)
                                                                        })

                                                                        commitLog.stdout.on('data', function (logdata) {
                                                                            // console.log("logdata", logdata.toString())
                                                                            logdata = formatData(logdata)
                                                                            // console.log("logdata", logdata)
                                                                            commitLog.stdout.on('close', function (data) {

                                                                                let commitObj = {
                                                                                    "commit": "",
                                                                                    "branch": currentBranch,
                                                                                    "message": commitMess[0],
                                                                                    "date": "",
                                                                                    "author": ""
                                                                                }

                                                                                logdata.forEach(curr => {
                                                                                    if (curr.startsWith("commit")) {
                                                                                        commitObj["commit"] = curr.replace("commit ", "")
                                                                                    }
                                                                                    if (curr.startsWith("Date:")) {
                                                                                        commitObj["date"] = curr.replace("Date: ", "")
                                                                                        commitObj["date"] = commitObj["date"].trim()
                                                                                    }
                                                                                    if (curr.startsWith("Author:")) {
                                                                                        commitObj["author"] = curr.replace("author:", "")
                                                                                        commitObj["author"] = commitObj["author"].trim()
                                                                                    }

                                                                                })
                                                                                console.log("")
                                                                                console.log(chalk.keyword("magenta").bold("-- Commit Log Data --"))
                                                                                console.log(chalk.white("Commit ID: ", commitObj["commit"]))
                                                                                console.log(chalk.white("Branch: ", commitObj['branch']))
                                                                                console.log(chalk.white("Message: ", commitObj['message']))
                                                                                console.log(chalk.white("Date: ", commitObj['date']))
                                                                                console.log(chalk.white("Author: ", commitObj['author']))
                                                                                console.log("")
                                                                            })

                                                                        })


                                                                    })

                                                                })
                                                            }
                                                            // else {

                                                            // }
                                                        })

                                                    })
                                                }


                                            })


                                        })
                                        // addChanges.stdout.on('end', async function (error) {
                                        //     console.log("---------------2---------")
                                        //     // return comm.showError(error)
                                        // })

                                        //----------------------------------------------------------------
                                    } else {
                                        comm.showMessageOrange("Push process terminated ..")
                                    }
                                } else {
                                    return comm.showMessage("No Changes to Commit. :)")
                                }
                            })
                            getStatus.stdout.on('error', function (data) {
                                console.log("errro", data)
                            })
                        } else {
                            return comm.showMessage("No Changes to Commit. :)")
                        }
                    })
                })
            })

        } catch (error) {
            console.log("error", error)
            // comm.showError(error)
        }
    }

}


function formatData(data) {
    if (data) {
        return data.toString().split('\n').filter(curr => Boolean(curr)).map(curr => curr.trim())
    }
    return ""
}


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
                // console.log("GetCommitFiles -> answers", answers)
                let command = ""
                answers.files.forEach(curr => {
                    curr = stripAnsi(curr).trim()
                    if (curr.includes("Added: ")) {
                        curr = curr.replace("Added: ", "")
                    }
                    if (curr.includes("Modified: ")) {
                        curr = curr.replace("Modified: ", "")
                    }
                    if (curr.includes("Deleted: ")) {
                        curr = curr.replace("Deleted: ", "")
                    }
                    command += " " + curr.trim()
                });
                return res(command)

            } else {
                return rej("No Files selected to Commit")
                // console.log("No Files selected to Commit")
            }
        })
    })
}


var self = module.exports