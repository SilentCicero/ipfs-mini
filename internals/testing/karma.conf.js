// karma.conf.js
module.exports = function (config) { // eslint-disable-line
  config.set({
    frameworks: ['mocha', 'chai'],

    files: [
      'lib/*.js',
      'lib/tests/*.js',
    ],

    autoWatch: false,
    singleRun: true,

    browsers: ['Chrome', 'Firefox'],

    client: {
      mocha: {
        grep: '--timeout 20000 -R spec',
        // change Karma's debug.html to the mocha web reporter
        reporter: 'html',
      },
    },
  });
};
