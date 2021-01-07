import router from '../router';

const baseUrl = '';

function checkRoute(route: string, token: string, args: any = null) {
  let newRoute = route;
  if (token === '') {
    // let currentPath = router.history.current.fullPath;
    // router.push("/login?next=" + currentPath);
    return null;
  }

  // Convert the arguments to a query string
  if (args !== null) {
    let argsString = '?';
    const keys = Object.keys(args);
    for (let i = 0; i < keys.length; i++) {
      argsString += `${keys[i]}=${args[keys[i]]}`;
      if (i < (keys.length - 1)) {
        argsString += '&';
      }
    }
    newRoute += argsString;
  }
  return newRoute;
}

function checkResponse(fetchResponse: Response) {
  if (fetchResponse.status !== 200) {
    if (fetchResponse.status === 401) {
      console.warn('401 - Unauthorized');
      // TODO : Reroute / give visual warning
    } else if (fetchResponse.status === 403) {
      console.warn('403 - Forbidden');
      // TODO : Reroute / give visual warning
    } else if (fetchResponse.status === 500) {
      console.warn('500 - Internal Server Error');
      // TODO : Reroute / give visual warning
    }
    console.log(JSON.stringify(fetchResponse));
  }
}


export default {
  getResource(route: string, args = null) {
    const token = '';
    const checkedRoute = checkRoute(route, token, args);

    const response = fetch(baseUrl + checkedRoute,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((fetchResponse) => {
        checkResponse(fetchResponse);
        return fetchResponse.json();
      })
      .catch((error) => {
        console.error(error);
      });
    return response;
  },

  patchResource(route: string, data: any, args = null) {
    const token = '';
    const checkedRoute = checkRoute(route, token, args);

    const response = fetch(baseUrl + checkedRoute,
      {
        body: JSON.stringify(data),
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
      })
      .then((fetchResponse) => {
        checkResponse(fetchResponse);
        return fetchResponse.json();
      })
      .catch((error) => {
        console.error(error);
      });
    return response;
  },

  putResource(route: string, data: any, args = null) {
    const token = '';
    const checkedRoute = checkRoute(route, token, args);

    const response = fetch(baseUrl + checkedRoute,
      {
        body: JSON.stringify(data),
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
      })
      .then((fetchResponse) => {
        checkResponse(fetchResponse);
        return fetchResponse.json();
      })
      .catch((error) => {
        console.error(error);
      });
    return response;
  },

  postResource(route: string, data: any, args = null) {
    const token = '';
    const checkedRoute = checkRoute(route, token, args);

    const response = fetch(baseUrl + checkedRoute,
      {
        body: JSON.stringify(data),
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
      })
      .then((fetchResponse) => {
        checkResponse(fetchResponse);
        return fetchResponse.json();
      })
      .catch((error) => {
        console.error(error);
      });
    return response;
  },

  delResource(route: string, data: any, args = null) {
    const token = '';
    const checkedRoute = checkRoute(route, token, args);

    const response = fetch(baseUrl + checkedRoute,
      {
        body: JSON.stringify(data),
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
      })
      .then((fetchResponse) => {
        checkResponse(fetchResponse);
        return fetchResponse.json();
      })
      .catch((error) => {
        console.error(error);
      });
    return response;
  },

  postFile(route: string, data: any, args = null) {
    const token = '';
    const checkedRoute = checkRoute(route, token, args);

    const response = fetch(baseUrl + checkedRoute,
      {
        body: data,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'cache-control': 'no-store',
          pragma: 'no-cache',
        },
      })
      .then((fetchResponse) => {
        checkResponse(fetchResponse);
        return fetchResponse.json();
      })
      .catch((error) => {
        console.error(error);
      });
    return response;
  },
};
