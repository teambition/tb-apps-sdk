const ORIGIN_CI = 'http://project.ci'
const ORIGIN_PROD = 'http://teambition.com'

const toggleEventListener = (callback, isRemove) => {
  const func = isRemove ? 'removeEventListener' : 'addEventListener';
  return window[func]('message', callback, false);
}

const consoleError = ({error}) => {
  const errorMessage = error || 'ERROR';
  return console.error(errorMessage);
};

const notify = ({isCI, onError, onSuccess, params}) => {
  callService({
    isCI,
    params,
    onSuccess,
    onError,
    method: 'essage'
  });
};

const callService = ({isCI, method, params, onSuccess, onError}) => {
  const postId = Date.now();
  const origin = isCI ? ORIGIN_CI : ORIGIN_PROD;
  const content = {method, params, postId};
  window.parent.postMessage(content, origin);
  const callback = ({data}) => {
    if (postId !== data.postId) return
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
}

export { notify, callService };
