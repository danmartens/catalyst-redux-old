import { isFunction } from 'lodash';

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

  post: (url, data) => {
    const response = responses.POST[url];
    return promiseFromResponse(response, data);
  },

  put: (url, data) => {
    const response = responses.PUT[url];
    return promiseFromResponse(response, data);
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

function promiseFromResponse(response, requestData) {
  if (response != null) {
    let responseData;

    if (isFunction(response.data)) {
      responseData = response.data(requestData);
    } else {
      responseData = response.data;
    }

    if (response.status < 400) {
      return Promise.resolve({ data: responseData });
    } else {
      return Promise.reject({ data: responseData });
    }
  } else {
    return Promise.reject({});
  }
}

module.exports = axios;
