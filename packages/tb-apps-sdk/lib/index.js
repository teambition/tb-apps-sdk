'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var ORIGIN_CI = 'http://project.ci';
var ORIGIN_PROD = 'http://teambition.com';

var toggleEventListener = function toggleEventListener(callback, isRemove) {
  var func = isRemove ? 'removeEventListener' : 'addEventListener';
  return window[func]('message', callback, false);
};

var consoleError = function consoleError(_ref) {
  var error = _ref.error;

  var errorMessage = error || 'ERROR';
  return console.error(errorMessage);
};

var notify = function notify(_ref2) {
  var isCI = _ref2.isCI;
  var origin = _ref2.origin;
  var onError = _ref2.onError;
  var onSuccess = _ref2.onSuccess;
  var params = _ref2.params;

  callService({
    isCI: isCI,
    origin: origin,
    params: params,
    onSuccess: onSuccess,
    onError: onError,
    method: 'essage'
  });
};

var callService = function callService(_ref3) {
  var isCI = _ref3.isCI;
  var method = _ref3.method;
  var params = _ref3.params;
  var onSuccess = _ref3.onSuccess;
  var onError = _ref3.onError;
  var fromOrigin = _ref3.origin;

  var postId = Date.now();
  var toOrigin = isCI ? ORIGIN_CI : ORIGIN_PROD;
  var content = { method: method, params: params, postId: postId, origin: fromOrigin };
  window.parent.postMessage(content, toOrigin);
  var callback = function callback(_ref4) {
    var data = _ref4.data;

    if (postId !== data.postId) return;
    if (data.error) {
      onError = onError || consoleError;
      onError(data);
    } else {
      if (typeof onSuccess === "function") {
        onSuccess(data);
      }
    }
    toggleEventListener(callback, true);
  };
  toggleEventListener(callback);
};

exports.notify = notify;
exports.callService = callService;