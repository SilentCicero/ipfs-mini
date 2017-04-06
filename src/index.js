const XMLHttpRequest = require('./lib/XMLHttpRequest');

module.exports = IPFS;

/**
 * The constructor object
 * @param {Object} `provider` the provider object
 * @return {Object} `ipfs` returns an IPFS instance
 * @throws if the `new` flag is not used
 */
function IPFS(provider) {
  if (!(this instanceof IPFS)) { throw new Error('[ipfs-mini] IPFS instance must be instantiated with "new" flag (e.g. var ipfs = new IPFS("http://localhost:8545");).'); }

  const self = this;
  self.setProvider(provider || {});
}

/**
 * Sets the provider of the IPFS instance
 * @param {Object} `provider` the provider object
 * @throws if the provider object is not an object
 */
IPFS.prototype.setProvider = function setProvider(provider) {
  if (typeof provider !== 'object') { throw new Error(`[ifpsjs] provider must be type Object, got '${typeof provider}'.`); }
  const self = this;
  const data = self.provider = Object.assign({
    host: '127.0.0.1',
    pinning: true,
    port: '5001',
    protocol: 'http',
    base: '/api/v0' }, provider || {});
  self.requestBase = String(`${data.protocol}://${data.host}:${data.port}${data.base}`);
};

/**
 * Sends an async data packet to an IPFS node
 * @param {Object} `opts` the options object
 * @param {Function} `cb` the provider callback
 * @callback returns an error if any, or the data from IPFS
 */
IPFS.prototype.sendAsync = function sendAsync(opts, cb) {
  const self = this;
  const request = new XMLHttpRequest(); // eslint-disable-line
  const options = opts || {};
  const callback = cb || function emptyCallback() {};

  request.onreadystatechange = () => {
    if (request.readyState === 4 && request.timeout !== 1) {
      if (request.status !== 200) {
        callback(new Error(`[ipfs-mini] status ${request.status}: ${request.responseText}`), null);
      } else {
        try {
          callback(null, (options.jsonParse ? JSON.parse(request.responseText) : request.responseText));
        } catch (jsonError) {
          callback(new Error(`[ipfs-mini] while parsing data: '${String(request.responseText)}', error: ${String(jsonError)} with provider: '${self.requestBase}'`, null));
        }
      }
    }
  };

  const pinningURI = self.provider.pinning && opts.uri === '/add' ? '?pin=true' : '';

  if (options.payload) {
    request.open('POST', `${self.requestBase}${opts.uri}${pinningURI}`);
  } else {
    request.open('GET', `${self.requestBase}${opts.uri}${pinningURI}`);
  }

  if (options.accept) {
    request.setRequestHeader('accept', options.accept);
  }

  if (options.payload && options.boundary) {
    request.setRequestHeader('Content-Type', `multipart/form-data; boundary=${options.boundary}`);
    request.send(options.payload);
  } else {
    request.send();
  }
};

/**
 * creates a boundary that isn't part of the payload
 */
function createBoundary(data) {
  while (true) {
    const boundary = `----IPFSMini${Math.random() * 100000}.${Math.random() * 100000}`;
    if (data.indexOf(boundary) === -1) {
      return boundary;
    }
  }
}

/**
 * Add an string or buffer to IPFS
 * @param {String|Buffer} `input` a single string or buffer
 * @param {Function} `callback` a callback, with (error, ipfsHash String)
 * @callback {String} `ipfsHash` returns an IPFS hash string
 */
IPFS.prototype.add = function addData(input, callback) {
  const data = ((typeof input === 'object' && input.isBuffer) ? input.toString('binary') : input);
  const boundary = createBoundary(data);
  const payload = `--${boundary}\r\nContent-Disposition: form-data; name="path"\r\nContent-Type: application/octet-stream\r\n\r\n${data}\r\n--${boundary}--`;

  const addCallback = (err, result) => callback(err, (!err ? result.Hash : null));
  this.sendAsync({
    jsonParse: true,
    accept: 'application/json',
    uri: '/add',
    payload, boundary,
  }, addCallback);
};

/**
 * Add an JSON object to IPFS
 * @param {Object} `jsonData` a single JSON object
 * @param {Function} `callback` a callback, with (error, ipfsHash String)
 * @callback {String} `ipfsHash` returns an IPFS hash string
 */
IPFS.prototype.addJSON = function addJson(jsonData, callback) {
  const self = this;
  self.add(JSON.stringify(jsonData), callback);
};

/**
 * Get an object stat `/object/stat` for an IPFS hash
 * @param {String} `ipfsHash` a single IPFS hash String
 * @param {Function} `callback` a callback, with (error, stats Object)
 * @callback {Object} `stats` returns the stats object for that IPFS hash
 */
IPFS.prototype.stat = function cat(ipfsHash, callback) {
  const self = this;
  self.sendAsync({ jsonParse: true, uri: `/object/stat/${ipfsHash}` }, callback);
};

/**
 * Get the data from an IPFS hash
 * @param {String} `ipfsHash` a single IPFS hash String
 * @param {Function} `callback` a callback, with (error, stats Object)
 * @callback {String} `data` returns the output data
 */
IPFS.prototype.cat = function cat(ipfsHash, callback) {
  const self = this;
  self.sendAsync({ uri: `/cat/${ipfsHash}` }, callback);
};

/**
 * Get the data from an IPFS hash that is a JSON object
 * @param {String} `ipfsHash` a single IPFS hash String
 * @param {Function} `callback` a callback, with (error, json Object)
 * @callback {Object} `data` returns the output data JSON object
 */
IPFS.prototype.catJSON = function cat(ipfsHash, callback) {
  const self = this;
  self.cat(ipfsHash, (jsonError, jsonResult) => { // eslint-disable-line
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
