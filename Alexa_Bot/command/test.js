function checkJson(str) {
    console.log("str", typeof str, str)
    try {
        (str && typeof str === "string") ? JSON.parse(str) : str;
    } catch (e) {
        return false;
    }
    return true;
}



console.log("===>", checkJson('{"d":"d"}'))