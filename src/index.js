const ORIGIN_CI = 'http://project.ci'
const ORIGIN_PROD = 'https://www.teambition.com'

const toggleEventListener = (callback, isRemove) => {
  const func = isRemove ? 'removeEventListener' : 'addEventListener';
  return window[func]('message', callback, false);
}

const consoleError = ({error}) => {
  const errorMessage = error || 'ERROR';
  return console.error(errorMessage);
};

const notify = ({isCI, origin, onError, onSuccess, params}) => {
  callService({
    isCI,
    origin,
    params,
    onSuccess,
    onError,
    method: 'essage'
  });
};

const callService = ({isCI, method, params, onSuccess, onError, origin: fromOrigin}) => {
  const postId = Date.now();
  const toOrigin = isCI ? ORIGIN_CI : ORIGIN_PROD;
  const content = {method, params, postId, origin: fromOrigin};
  window.parent.postMessage(content, toOrigin);
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
