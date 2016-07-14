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

exports.default = TBApps = {
  notify: function notify(_ref2) {
    var isCI = _ref2.isCI;
    var onError = _ref2.onError;
    var onSuccess = _ref2.onSuccess;
    var params = _ref2.params;

    this.callService({
      isCI: isCI,
      params: params,
      onSuccess: onSuccess,
      onError: onError,
      method: 'essage'
    });
  },
  callService: function callService(_ref3) {
    var isCI = _ref3.isCI;
    var method = _ref3.method;
    var params = _ref3.params;
    var onSuccess = _ref3.onSuccess;
    var onError = _ref3.onError;

    var originPostId = Date.now();
    var origin = isCI ? ORIGIN_CI : ORIGIN_PROD;
    var content = { postId: postId, method: method, params: params };
    window.parent.postMessage(content, origin);
    var callback = function callback(_ref4) {
      var _ref4$data = _ref4.data;
      var postId = _ref4$data.postId;
      var error = _ref4$data.error;

      if (postId !== originPostId) return;
      if (error) {
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
  }
};