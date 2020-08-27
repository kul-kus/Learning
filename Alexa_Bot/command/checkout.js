
var comm = require("./common")
var spawn = require('child_process').spawn;
let chalk = require("chalk")


///home/kulk@eur.ad.sag/kul/a-my-connector-triggers/git_Irepo/integration-connectors

module.exports = {
    checkout: async function (filterParam) {
        // console.log("commitMess", filterParam)
        try {
            var cmdToGetPWD = spawn(`pwd`, {
                shell: true
            });

            cmdToGetPWD.stdout.on('data', function (data) {
                let pwd = data.toString().trim()
                // let pwd = "/home/kulk@eur.ad.sag/kul/a-my-connector-triggers/git_Irepo/Kul-Learning/Learning"

                var getBranch = spawn(`cd ${pwd} "$@" && git branch --all`, {
                    shell: true
                });

                getBranch.stdout.on('data', async function (data) {
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
                    console.log(chalk.keyword("white")("Current Branch -> ") + chalk.keyword("orange")(currentBranch))
                    if (filterParam && filterParam.length && filterParam[0]) {
                        allBranchName = allBranchName.filter(curr => curr.startsWith(filterParam[0]))
                    }

                    let selectedBranch = await comm.showOptions(allBranchName, "Select the Branch to checkout.")

                    // console.log("selectedBranch", selectedBranch)

                    var checkoutBranch = spawn(`cd ${pwd} "$@" && git checkout ${selectedBranch}`, {
                        shell: true
                        // stdio: 'inherit',
                        // detached: true
                    });
                    // checkoutBranch.stdout.pipe(process.stdout);

                    checkoutBranch.stdout.on('data', function (data) {
                        // comm.showMessageRandom(`-Checkout Message- ${data.toString()}`, "brown")

                        console.log(chalk.bgRed("-Checkout Message- " + data.toString()))
                    })
                    checkoutBranch.stdout.on("close", function (data) {
                        console.log(chalk.keyword("lightblue").bold("Switched to new Branch- ") + chalk.keyword("yellow")(selectedBranch))

                        // comm.showMessageRandom(`Switched to new Branch-  ${selectedBranch}`, "yellow")
                    })
                    checkoutBranch.stdout.on("error", function (data) {
                        comm.showError("checkout Error Message-" + data.toString())
                    })
                    checkoutBranch.stdout.on("pause", function (data) {
                        comm.showError("Checkout Pause Message-" + data.toString())
                    })
                    checkoutBranch.stdout.on("end", function (data) {
                    console.log("data", data)
                        // console.log("----------------checkout successfull---------")

                        var pullBranch = spawn(`cd ${pwd} "$@" && git pull origin ${selectedBranch}`, {
                            shell: true
                        });
                        pullBranch.stdout.on('data', function (data) {
                            // comm.showMessageRandom(`pull Message-> ${data.toString()}`, "pink")
                            console.log(chalk.keyword("lightblue").bold("pull Message-> ") + chalk.keyword("pink")(data.toString()))

                        })
                        pullBranch.stdout.on("close", function (data) {
                            // comm.showMessage("Pull Close Message-" + data.toString())

                        })
                        pullBranch.stdout.on("error", function (data) {
                            console.log("----ayaya error----")
                            // comm.showError(" Pull Error-" + data.toString())
                        })
                    })

                })


            })

        } catch (error) {
            console.log("error", error)
            // comm.showError(error)
        }
    }

}

var self = module.exports