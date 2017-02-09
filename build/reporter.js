'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var readPkg = require('read-pkg');

/**
 * Initialize a new `Json` test reporter.
 *
 * @param {Runner} runner
 * @api public
 */

var JsonReporter = (function (_events$EventEmitter) {
    var packagedData = readPkg.sync(process.cwd());

    _inherits(JsonReporter, _events$EventEmitter);

    function JsonReporter(baseReporter, config) {
        var _this = this;

        var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        _classCallCheck(this, JsonReporter);

        _get(Object.getPrototypeOf(JsonReporter.prototype), 'constructor', this).call(this);

        this.baseReporter = baseReporter;
        this.config = config;
        this.options = options;
        var resultingJson = [];

        var epilogue = this.baseReporter.epilogue;

        this.on('end', function () {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = _getIterator(_Object$keys(_this.baseReporter.stats.runners)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var cid = _step.value;

                    var runnerInfo = _this.baseReporter.stats.runners[cid];
                    var start = _this.baseReporter.stats.start;
                    var end = _this.baseReporter.stats.end;
                    var json = _this.prepareJson(start, end, runnerInfo, resultingJson);
                }
                _this.write(runnerInfo, cid, json, resultingJson);
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator['return']) {
                        _iterator['return']();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            epilogue.call(baseReporter);
        });
    }

    _createClass(JsonReporter, [{
        key: 'prepareJson',
        value: function prepareJson(start, end, runnerInfo, resultingJson) {
            var skippedCount = 0;
            var passedCount = 0;
            var failedCount = 0;

            var resultSet = resultingJson;

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = _getIterator(_Object$keys(runnerInfo.specs)), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var specId = _step2.value;

                    var spec = runnerInfo.specs[specId];

                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = _getIterator(_Object$keys(spec.suites)), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var suiteName = _step3.value;

                            var suite = spec.suites[suiteName];

                            var _iteratorNormalCompletion4 = true;
                            var _didIteratorError4 = false;
                            var _iteratorError4 = undefined;

                            try {
                                for (var _iterator4 = _getIterator(_Object$keys(suite.tests)), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                    var testName = _step4.value;

                                    var test = suite.tests[testName];
                                    var testCase = {};

                                    // Device Info
                                    testCase.platform_type = runnerInfo.capabilities.device_type;
                                    testCase.device_name = runnerInfo.capabilities.deviceName; // device
                                    testCase.platform_name = runnerInfo.capabilities.platform;
                                    testCase.platform_version = runnerInfo.capabilities.platformVersion; // device
                                    testCase.browser_name = runnerInfo.capabilities.browserName;
                                    testCase.browser_version = runnerInfo.capabilities.version;
                                    testCase.device_orientation = runnerInfo.capabilities.deviceOrientation; // device

                                    if (!runnerInfo.capabilities.platformVersion) {
                                        var version = /\d.*/;
                                        var platform = /\s+$/;
                                        var platformVersion = runnerInfo.capabilities.platform.match(version);
                                        var platformName = runnerInfo.capabilities.platform.replace(platformVersion, '').replace(platform, '');

                                        testCase.platform_name = String(platformName);
                                        testCase.platform_version = String(platformVersion);
                                    }

                                    // Test Info
                                    testCase.test_purpose = runnerInfo.capabilities.testPurpose;
                                    // testCase.test_suite_name = ??
                                    testCase.test_name = suite.title;
                                    testCase.test_case = test.title;

                                    if (test.state === 'pending') {
                                        skippedCount = skippedCount + 1;
                                        testCase.test_status = 'skipped';
                                    } else if (test.state === 'pass') {
                                        passedCount = passedCount + 1;
                                        testCase.test_status = test.state;
                                    } else if (test.state === 'fail') {
                                        failedCount = failedCount + 1;
                                        testCase.test_status = test.state;
                                    } else {
                                        testCase.test_status = test.state;
                                    }

                                    if (test.error) {
                                        if (test.error.type || test.error.message) {
                                            testCase.error_description = test.error.type + ' : ' + test.error.message;
                                        }
                                        if (test.error.stack) {
                                            testCase.stack_trace = test.error.stack;
                                        }
                                    }

                                    testCase.test_duration = test.duration;
                                    testCase.saucelabs_session_id = runnerInfo.sessionID;
                                    testCase.test_environment = runnerInfo.capabilities.test_environment;

                                    // From VENICE
                                    testCase.project_name = runnerInfo.capabilities.project_name;
                                    testCase.project_version = runnerInfo.capabilities.project_version;
                                    testCase.build_number = runnerInfo.capabilities.build_number;
                                    testCase.branch_name = runnerInfo.capabilities.branch_name;

                                    resultSet.push(testCase);
                                }
                            } catch (err) {
                                _didIteratorError4 = true;
                                _iteratorError4 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion4 && _iterator4['return']) {
                                        _iterator4['return']();
                                    }
                                } finally {
                                    if (_didIteratorError4) {
                                        throw _iteratorError4;
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        _didIteratorError3 = true;
                        _iteratorError3 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                                _iterator3['return']();
                            }
                        } finally {
                            if (_didIteratorError3) {
                                throw _iteratorError3;
                            }
                        }
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                        _iterator2['return']();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            return resultSet;
        }
    }, {
        key: 'write',
        value: function write(runnerInfo, cid, json) {
            if (!this.options || typeof this.options.outputDir !== 'string') {
                return console.log('Cannot write json report: empty or invalid \'outputDir\'.');
            }

            // Custom format for timestamp in report file name
            function timeStamp() {
                var now = new Date();
                var date = [now.getUTCFullYear(), now.getUTCDate(), now.getUTCMonth() + 1];
                var time = [now.getUTCHours(), now.getUTCMinutes(), now.getUTCMilliseconds()];
                return date.join('') + '-' + time.join('');
            };

            try {
                var dir = _path2['default'].resolve(this.options.outputDir);
                var filename = 'selenium-test' + '_' + packagedData.name + '_' + packagedData.version + '_' + 'build' + '-' + '1' + '_' + timeStamp() + '.json';
                var filepath = _path2['default'].join(dir, filename);
                _mkdirp2['default'].sync(dir);
                _fs2['default'].writeFileSync(filepath, JSON.stringify(json));
                console.log('Wrote json report to [' + this.options.outputDir + '].');
            } catch (e) {
                console.log('Failed to write json report to [' + this.options.outputDir + ']. Error: ' + e);
            }
        }
    }, {
        key: 'format',
        value: function format(val) {
            return JSON.stringify(this.baseReporter.limit(val));
        }
    }]);

    return JsonReporter;
})(_events2['default'].EventEmitter);

exports['default'] = JsonReporter;
module.exports = exports['default'];
