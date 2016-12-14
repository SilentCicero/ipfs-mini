 /* eslint-disable */ 
 /* eslint-disable */ 
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("IPFS", [], factory);
	else if(typeof exports === 'object')
		exports["IPFS"] = factory();
	else
		root["IPFS"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmory imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmory exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		Object.defineProperty(exports, name, {
/******/ 			configurable: false,
/******/ 			enumerable: true,
/******/ 			get: getter
/******/ 		});
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

"use strict";
'use strict';

/**
 * The add method for the IPFS api in the browser
 * @param {String|Buffer} `inputData` the data to be stored
 * @param {Object} `self` the ipfs instance
 * @param {Function} `callback` the callback
 * @callback {String} `ipfs` returns an IPFS hash string
 */

module.exports = function add(input, self, callback) {
  var payload = new FormData();
  var data = typeof input === 'object' && input.isBuffer ? input.toString('binary') : input;
  payload.append('file', new Blob([data], {}));
  var addCallback = function addCallback(err, result) {
    return callback(err, !err ? result.Hash : null);
  };

  self.sendAsync({ jsonParse: true, accept: 'application/json', uri: '/add', payload: payload }, addCallback);
};

/***/ },
/* 1 */
/***/ function(module, exports) {

"use strict";
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Yamagishi Kazutoshi
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/* global window */
module.exports = {
  XMLHttpRequest: window.XMLHttpRequest,
  XMLHttpRequestUpload: window.XMLHttpRequestUpload,
  FormData: window.FormData
};


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

var XMLHttpRequest = __webpack_require__(1).XMLHttpRequest;
var add = __webpack_require__(0);

module.exports = IPFS;

/**
 * The constructor object
 * @param {Object} `provider` the provider object
 * @return {Object} `ipfs` returns an IPFS instance
 * @throws if the `new` flag is not used
 */
function IPFS(provider) {
  if (!(this instanceof IPFS)) {
    throw new Error('[ipfsjs] IPFS instance must be instantiated with "new" flag (e.g. var ipfs = new IPFS("http://localhost:8545");).');
  }

  var self = this;
  self.setProvider(provider || {});
}

/**
 * Sets the provider of the IPFS instance
 * @param {Object} `provider` the provider object
 * @throws if the provider object is not an object
 */
IPFS.prototype.setProvider = function setProvider(provider) {
  if (typeof provider !== 'object') {
    throw new Error('[ifpsjs] provider must be type Object, got \'' + typeof provider + '\'.');
  }
  var self = this;
  var data = self.provider = Object.assign({
    host: '127.0.0.1',
    port: '5001',
    protocol: 'http',
    base: '/api/v0' }, provider || {});
  self.requestBase = String(data.protocol + '://' + data.host + ':' + data.port + data.base);
};

/**
 * Sends an async data packet to an IPFS node
 * @param {Object} `opts` the options object
 * @param {Function} `cb` the provider callback
 * @callback returns an error if any, or the data from IPFS
 */
IPFS.prototype.sendAsync = function sendAsync(opts, cb) {
  var self = this;
  var request = new XMLHttpRequest(); // eslint-disable-line
  var options = opts || {};
  var callback = cb || function emptyCallback() {};

  request.open('POST', '' + self.requestBase + opts.uri);

  if (options.accept) {
    request.setRequestHeader('accept', options.accept);
  }

  request.onreadystatechange = function () {
    if (request.readyState === 4 && request.timeout !== 1) {
      if (request.status !== 200) {
        callback(new Error('[ipfsjs] status ' + request.status + ': ' + request.responseText), null);
      } else {
        try {
          callback(null, options.jsonParse ? JSON.parse(request.responseText) : request.responseText);
        } catch (jsonError) {
          callback(new Error('[ipfsjs] while parsing data: \'' + String(request.responseText) + '\', error: ' + String(jsonError) + ' with provider: \'' + self.requestBase + '\'', null));
        }
      }
    }
  };

  try {
    if (options.payload) {
      request.enctype = 'multipart/form-data';
      request.send(options.payload);
    } else {
      request.send();
    }
  } catch (error) {
    callback(new Error('[ipfsjs] CONNECTION ERROR: Couldn\'t connect to node \'' + self.provider + '\': ' + JSON.stringify(error, null, 2)), null);
  }
};

/**
 * Add an string or buffer to IPFS
 * @param {String|Buffer} `input` a single string or buffer
 * @param {Function} `callback` a callback, with (error, ipfsHash String)
 * @callback {String} `ipfsHash` returns an IPFS hash string
 */
IPFS.prototype.add = function addData(input, callback) {
  var self = this;
  add(input, self, callback);
};

/**
 * Add an JSON object to IPFS
 * @param {Object} `jsonData` a single JSON object
 * @param {Function} `callback` a callback, with (error, ipfsHash String)
 * @callback {String} `ipfsHash` returns an IPFS hash string
 */
IPFS.prototype.addJSON = function addJson(jsonData, callback) {
  var self = this;
  self.add(JSON.stringify(jsonData), callback);
};

/**
 * Get an object stat `/object/stat` for an IPFS hash
 * @param {String} `ipfsHash` a single IPFS hash String
 * @param {Function} `callback` a callback, with (error, stats Object)
 * @callback {Object} `stats` returns the stats object for that IPFS hash
 */
IPFS.prototype.stat = function cat(ipfsHash, callback) {
  var self = this;
  self.sendAsync({ jsonParse: true, uri: '/object/stat/' + ipfsHash }, callback);
};

/**
 * Get the data from an IPFS hash
 * @param {String} `ipfsHash` a single IPFS hash String
 * @param {Function} `callback` a callback, with (error, stats Object)
 * @callback {String} `data` returns the output data
 */
IPFS.prototype.cat = function cat(ipfsHash, callback) {
  var self = this;
  self.sendAsync({ uri: '/cat/' + ipfsHash }, callback);
};

/**
 * Get the data from an IPFS hash that is a JSON object
 * @param {String} `ipfsHash` a single IPFS hash String
 * @param {Function} `callback` a callback, with (error, json Object)
 * @callback {Object} `data` returns the output data JSON object
 */
IPFS.prototype.catJSON = function cat(ipfsHash, callback) {
  var self = this;
  self.cat(ipfsHash, function (jsonError, jsonResult) {
    // eslint-disable-line
    if (jsonError) {
      return callback(jsonError, null);
    }

    try {
      callback(null, JSON.parse(jsonResult));
    } catch (jsonParseError) {
      callback(jsonParseError, null);
    }
  });
};

/***/ }
/******/ ])
});
;
//# sourceMappingURL=ipfsjs.js.map