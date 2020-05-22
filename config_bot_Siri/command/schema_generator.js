
var comm = require("./common")


try {
    function callBuildSchema(data) {

        console.log("")
        comm.showMessageOrange(JSON.stringify({
            "title": "output",
            "type": "object",
            "properties": buildSchema(data)
        }))

    }

    function buildSchema(data, displayTitle) {
        displayTitle = displayTitle || "";
        var schema = {};
        var keys = Object.keys(data);
        keys.forEach(function (key) {
            var type = findType(data[key]);
            switch (type) {
                case "string":
                    schema[key] = {
                        "title": key,
                        "type": "string",
                        "displayTitle": buildDisplayTitle(displayTitle, key)
                    }
                    break;
                case "null":
                    schema[key] = {
                        "title": key,
                        "type": "any",
                        "displayTitle": buildDisplayTitle(displayTitle, key)
                    }
                    break;
                case "number":
                    schema[key] = {
                        "title": key,
                        "type": "number",
                        "displayTitle": buildDisplayTitle(displayTitle, key)
                    }
                    break;
                case "boolean":
                    schema[key] = {
                        "title": key,
                        "type": "boolean",
                        "displayTitle": buildDisplayTitle(displayTitle, key)
                    }
                    break;
                case "object":
                    schema[key] = {
                        "title": key,
                        "type": "object",
                        "displayTitle": buildDisplayTitle(displayTitle, key),
                        "properties": buildSchema(data[key], buildDisplayTitle(displayTitle, key)),
                    }
                    break;
                case "array":
                    var _type = findType(data[key][0]);
                    schema[key] = {
                        "title": key,
                        "type": "array",
                        "displayTitle": buildDisplayTitle(displayTitle, key)
                    }
                    if (data[key][0] === undefined || data[key][0] === "undefined") {
                        schema[key]["items"] = {
                            "type": "any"
                        }
                    } else if (_type === "string") {
                        schema[key]["items"] = {
                            "type": "string"
                        }
                    } else if (_type === "array") {
                        schema[key]["items"] = {
                            "type": "array",
                            "items": {
                                "type": "string"
                            }
                        }
                    } else {
                        schema[key]["items"] = {
                            "type": "object",
                            "properties": buildSchema(data[key].reduce((result, obj) => {
                                return Object.assign(result, obj);
                            }, {}), buildDisplayTitle(displayTitle, key))
                        }
                    }
                    break;
            }
        });
        return schema;
    }

    function findType(value) {
        var type;
        if (typeof value === "string") {
            type = "string"
        } else if (typeof value === "number") {
            type = "number"
        } else if (typeof value === "boolean") {
            type = "boolean"
        } else if (value === null) {
            type = "null"
        } else if (value === undefined) {
            type = "string"
        } else if (Object.prototype.toString.call(value) === "[object Object]") {
            type = "object"
        } else if (Object.prototype.toString.call(value) === "[object Array]") {
            type = "array"
        }
        return type;
    }

    function buildDisplayTitle(displayTitle, key) {
        key = key.replace(/_/g, " ");
        key = key.replace(/\w\S*/g, (txt) => {
            var regEx = new RegExp("^html|url|uri|id|uid|ip$", "g");
            if (regEx.exec(txt)) {
                return txt.toUpperCase();
            }
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        })
        return displayTitle !== "" ? displayTitle + " " + key : key

    }
} catch (e) {
    // console.log(e.stack)

    comm.showError(e.stack)
}

module.exports = {
    buildSchema: callBuildSchema
}


// module.exports.buildSchema({ "name": "ddd" })


// console.log(buildSchema(
//     {
//         "name": "sss",

//     }
// ))