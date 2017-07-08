let responses = {
  GET: {},
  POST: {},
  DELETE: {}
};

const axios = {
  get: url => {
    const response = responses.GET[url];
    return promiseFromResponse(response);
  },

  post: url => {
    const response = responses.POST[url];
    return promiseFromResponse(response);
  },

  put: url => {
    const response = responses.PUT[url];
    return promiseFromResponse(response);
  },

  delete: url => {
    const response = responses.DELETE[url];
    return promiseFromResponse(response);
  }
};

axios.__registerResponse = function(method, url, data = null, status = 200) {
  responses[method][url] = { status, data };
};

axios.__clearRegisteredResponses = function() {
  responses = {
    GET: {},
    POST: {},
    DELETE: {}
  };
};

function promiseFromResponse(response) {
  if (response != null) {
    if (response.status < 400) {
      return Promise.resolve({ data: response.data });
    } else {
      return Promise.reject({ data: response.data });
    }
  } else {
    return Promise.reject({});
  }
}

module.exports = axios;
