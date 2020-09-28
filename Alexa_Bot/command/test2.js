const cliSpinners = require('cli-spinners').dots15
const ora = require('ora');

const oraspinner = ora()

// const oraspinner = ora()


oraspinner.spinner = cliSpinners



console.log("oraspinner.isSpinning", typeof oraspinner.isSpinning)

// console.log("cliSpinners", cliSpinners)
//  | / -- | \ --
oraspinner.text = "sample"
oraspinner.start()

setTimeout(() => {
    oraspinner.stop()
    oraspinner.info("sample Completed")

    oraspinner.text = "sample 1"
    oraspinner.start()
    // console.log("-----")
    // oraspinner.info("Pull Completed")
}, 2000);

setTimeout(() => {
    oraspinner.stop()
    oraspinner.info("sample 1 completed")

    oraspinner.text = "kuldeep"
    oraspinner.start()
    // console.log("-----")
    // oraspinner.info("Pull Completed")
}, 5000);

setTimeout(() => {
   
    // console.log("-----")
    oraspinner.stop()
    oraspinner.info("kuldeep Completed")
}, 7000);


