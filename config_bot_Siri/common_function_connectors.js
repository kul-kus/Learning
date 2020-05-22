


module.exports = {
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

  makeApiCallRequest: function (options_par, input, method, url, qs) {

    let request = require("request")
    let temp_param = {}
    if (!options_par) {
      temp_param = {
        method: method,
        url: url,
        qs: qs,
        headers: {
          "Authorization": "Bearer " + input.auth.access_token,
          "Accept": "application/json",
          "Content-Type": "application/json",
        }
      }
    }
    let params = (options_par) ? (options_par) : (temp_param)
    params["timeout"] = 90000
    return new Promise((resolve, reject) => {
      request(params, function (error, response, body) {
        if (!response) {
          return reject("Something went wrong. Unable to fetch response from SharePoint server.")
        }
        if (error) {
          return reject(error)
        }
        if (comm.checkJson(body)) {
          body = comm.convertJson(body)
        }
        if (response.statusCode >= 200 && response.statusCode < 400) {
          return resolve(response)
        }
        if (response.status == 401) {
          return reject(body)
        } else if (response.status == 403) {
          return reject(body)
        } else if (response.status == 404) {
          return reject("Requested resource not found. Please check the input parameters or contact our customer support if the issue persists.")
        }
        else if (response.status == 409) {
          if (body["error"] && body["error"]["message"]) {
            return reject(body["error"]["message"])
          }
          return reject(body)
        } else if (response.status == 500) {
          return reject(body)
        } else if (response.status == 503) {
          return reject(body)
        } else if (response.status == 504) {
          if (body["error"] && body["error"]["message"]) {
            return reject(body["error"]["message"])
          }
          return reject(body)
        } else if (response.status == 400) {
          return reject(body)
        }
        else {
          return reject(body)
        }
      })
    })
  },

  makeApiCall: function (options_par, input, method, url, qs, type) {
    let axios = require("axios")

    let temp_param = {}
    if (!options_par) {
      temp_param = {
        method: method,
        url: url,
        params: qs,
        headers: {
          "Authorization": "Bearer " + input.auth.access_token,
          "Accept": "application/json",
          "Content-Type": "application/json",
        }
      }
    }
    let params = (options_par) ? (options_par) : (temp_param)
    params["timeout"] = 90000
    return new Promise((resolve, reject) => {
      axios(params).then((response) => {
        return self.validateAxiosRespose(response, resolve, reject, type)
      }).catch(err => {
        return self.validateAxiosRespose(err.response, resolve, reject, type)
      })
    })
  },

  validateAxiosRespose: function (response, resolve, reject, type) {
    let body = ""
    type = (type) ? (type) : ""
    if (!response) {
      return reject("Something went wrong. Unable to fetch response from SharePoint server")
    }
    if (response.hasOwnProperty("data")) {
      body = response.data
    }
    if (self.checkJson(body)) {
      body = self.convertJson(body)
    }
    if (response.status >= 200 && response.status < 400) {
      return resolve(body)
    }

    if (response.status == 401) {
      return reject(body)

      // return reject("Invalid Authentication Token. ")
    } else if (response.status == 403) {
      return reject(body)
      // return reject("Invalid Authentication Token.")
    } else if (response.status == 404) {
      return reject("Requested resource not found. Please check the input parameters or contact our customer support if the issue persists.")
    }
    else if (response.status == 409) {
      if (body["error"] && body["error"]["message"]) {
        return reject(body["error"]["message"])
      }
      return reject(body)
    } else if (response.status == 500) {
      return reject(body)
      // return reject("Something went wrong at server. Please try again after some time.")
    } else if (response.status == 503) {
      return reject(body)
      // return reject("Something went wrong. Please try again after some time.")
    } else if (response.status == 504) {
      if (body["error"] && body["error"]["message"]) {
        return reject(body["error"]["message"])
      }
      return reject(body)
      // return reject("The server took too long to respond. Please try again after some time.")
    } else if (response.status == 400) {

      if (type && type.includes("listFileFolders") && body["error"] && body["error"]["message"] && body["error"]["message"].includes("$top")) {
        return reject(body["error"]["message"])
      }
      if (type && type.includes("listFileFolders")) {
        return reject("Requested resource not found. Please check the input parameters or contact our customer support if the issue persists.")
      }
      if (body["error"] && body["error"]["message"] && body["error"]["message"]) {

        return reject(body["error"]["message"])
      }
      return reject("Requested resource not found. Please check the input parameters or contact our customer support if the issue persists.")
    }
    else {
      if (body["error"] && body["error"]["message"]) {
        return reject(body["error"]["message"])
      }
      if (body && body.errorMessage) {
        return reject(body.errorMessage)
      } else {
        return reject(body)
      }
    }
  },

  ValidURL: function (str) {
    var urlPattern = "(https?|ftp)://(www\\.)?(((([a-zA-Z0-9.-]+\\.){1,}[a-zA-Z]{2,4}|localhost))|((\\d{1,3}\\.){3}(\\d{1,3})))(:(\\d+))?(/([a-zA-Z0-9-._~!$&'()*+,;=:@/]|%[0-9A-F]{2})*)?(\\?([a-zA-Z0-9-._~!$&'()*+,;=:/?@]|%[0-9A-F]{2})*)?(#([a-zA-Z0-9._-]|%[0-9A-F]{2})*)?";
    urlPattern = "^" + urlPattern + "$";
    var regex = new RegExp(urlPattern);
    return regex.test(str);
  },
  check_if_exist: function (old_obj, new_obj, old_key, new_key) {
    if (old_obj.hasOwnProperty(old_key)) {
      new_obj[new_key || old_key] = old_obj[old_key]
    }
  },

  delete_key: function (obj, key) {
    if (obj.hasOwnProperty(key)) {
      delete obj[key]
    }
  },
  manipulate_obj: function (obj) {
    let tempObj = {}
    let bottomObj = {}
    self.check_if_exist(obj, tempObj, "id")
    self.check_if_exist(obj, tempObj, "name")
    self.check_if_exist(obj, tempObj, "webUrl")
    self.check_if_exist(obj, tempObj, "type")
    self.check_if_exist(obj, tempObj, "lastModifiedDateTime")
    self.check_if_exist(obj, tempObj, "createdDateTime")
    self.check_if_exist(obj, tempObj, "size")



    self.delete_key(obj, "id")
    self.delete_key(obj, "name")
    self.delete_key(obj, "webUrl")
    self.delete_key(obj, "type")
    self.delete_key(obj, "lastModifiedDateTime")
    self.delete_key(obj, "createdDateTime")
    self.delete_key(obj, "size")


    //-----------------------------------------------------------

    self.check_if_exist(obj, bottomObj, "@odata.context")
    self.check_if_exist(obj, bottomObj, "eTag")
    self.check_if_exist(obj, bottomObj, "cTag")


    self.delete_key(obj, "@odata.context")
    self.delete_key(obj, "eTag")
    self.delete_key(obj, "cTag")

    tempObj = Object.assign(tempObj, obj)
    tempObj = Object.assign(tempObj, bottomObj)
    return tempObj
  },

  addSkipToken: function (final_obj, data) {
    if (data && data["@odata.context"]) {
      final_obj["context"] = data["@odata.context"]
    }
    if (data && data["@odata.nextLink"]) {
      final_obj["nextLink"] = data["@odata.nextLink"]
      final_obj["skiptoken"] = ""

      if (data["@odata.nextLink"].includes("$skiptoken=")) {
        let arr = data["@odata.nextLink"].split("$skiptoken=")
        if (arr && arr.length > 1) {
          final_obj["skiptoken"] = arr[1]
        }
      }
    }
  },
  checkPath: function (path) {
    if (!path.match(/^([Rr][Oo][Oo][Tt])/gi)) {
      if (!path.match(/^:\//)) {
        path = self.appendSlash(path)
        path = self.appendColon(path)
      }
      if (!path.match(/^\//)) {
        path = self.appendColon(path)
      }
      path = self.appendRoot(path)
    }

    if (!path.endsWith(":")) {
      path = path + ":"
    }
    if (path.match(/(\/+)(:)$/)) {
      path = path.replace(/(\/+)(:)$/gi, ":")
    }
    return path
  },
  appendColon: function (path) {
    if (!path.match(/^:/)) {
      path = ":" + path
    }
    return path
  },
  appendSlash: function (path) {
    if (!path.match(/^\//gi)) {
      path = "/" + path
    }
    return path
  },
  appendRoot: function (path) {
    if (!path.match(/^([Rr][Oo][Oo][Tt])/)) {
      path = "root" + path
    }
    return path
  },
  flat_json: function (ob) {
    var toReturn = {};
    for (var i in ob) {
      if ((typeof ob[i]) == 'object') {
        var flatObject = self.flat_json(ob[i]);
        // console.log("flattenObject -> flatObject", flatObject, i)
        for (var x in flatObject) {
          toReturn[i + '_' + x] = flatObject[x];
        }
      } else {
        if (i == "type") {
          toReturn["event_type"] = ob[i]
        }
        else {
          toReturn[i] = ob[i];
        }
      }
    }
    return toReturn;
  },
  createNestedJSON: function (obj) {
    let final_obj = {}
    Object.keys(obj).forEach(curr => {
      let currKeyArr = curr.split(".")
      let ObjPath = currKeyArr.slice(0, currKeyArr.length - 1)
      let ObjKey = currKeyArr[currKeyArr.length - 1]
      final_obj = self.CheckKeyInObjectTemp(ObjPath, ObjKey, final_obj, obj[curr], 0)

    })
    return final_obj
  },
  CheckKeyInObjectTemp: function (path, key, finalObj, value, index) {
    if (path.length == index) {
      if (key == "created_at" || key == "updated_at") {
        value = self.ChangeDatatoISOTemp(value)
      }
      if (!finalObj.hasOwnProperty(key)) {
        finalObj[key] = value
      }
    } else {
      if (!finalObj.hasOwnProperty(path[index])) {
        finalObj[path[index]] = {}
      }
      if (typeof finalObj[path[index]] != "object" || finalObj[path[index]] == null) {
        finalObj[path[index]] = {}
      }
      self.CheckKeyInObjectTemp(path, key, finalObj[path[index]], value, index + 1)
    }
    return finalObj
  },
  setArrParams: function (obj, key) {
    if (obj && obj[key] && obj[key].length) {
      obj[key] = obj[key].map(version => {
        return self.convert2Json(version);
      });
      obj[key] = self.flattenDeep(obj[key]);
      obj[key] = self.removeEmptyValues(obj[key]);
      obj[key] = self.removeDuplicates(obj[key])
      return obj[key]
    }
  },
  convert2Json: function (str) {
    if (str && typeof str === "string") {
      try {
        str = JSON.parse(str);
      } catch (e) {
        str = str.split(",");
      }
      str = (str && typeof str === "number") ? "" + str : str;
    }
    return str;
  },
  flattenDeep: function (arr1) {
    return arr1.reduce((acc, val) => Array.isArray(val) ? acc.concat(self.flattenDeep(val)) : acc.concat(val), []);
  },
  removeEmptyValues: function (arr) {
    return arr.filter(function (el) {
      return el != null && el != undefined && el != "";
    });
  },
  removeDuplicates: function (myArr) {
    let unique = [];
    myArr.forEach(function (i) {
      if (!unique[i]) {
        unique.push(i);
      }
    });
    return unique;
  },
}
var self = module.exports
