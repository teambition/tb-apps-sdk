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

export default TBApps = {
  notify ({isCI, onError, onSuccess, params}) {
    this.callService({
      isCI,
      params,
      onSuccess,
      onError,
      method: 'essage'
    });
  },
  callService ({isCI, method, params, onSuccess, onError}) {
    const originPostId = Date.now();
    const origin = isCI ? ORIGIN_CI : ORIGIN_PROD;
    const content = {postId, method, params};
    window.parent.postMessage(content, origin);
    const callback = ({data: {postId, error}}) => {
      if (postId !== originPostId) return
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
}
