import router from '../router';
import devAPI from '../../dev/api';

const baseURL = ''; // TODO: Set base URL
const token = ''; // TODO: Make sure we get the token
const baseURLDev = '../../dev/api/';
const isDev = process.env.NODE_ENV === 'development';


/**
 * Takes a route string and arguments and converts it into a route that the browser can read
 *
 * @param route: string that contains the base route
 * @param args: object with arguments where key is argument and value is argument value
 *
 * @return string: complete route that can be fetched
 */
function makeRoute(route: string, args: any = null) {
  let newRoute = route;

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

  // If we are currently in develop we need to grab a local JSON file
  if (isDev) {
    return devAPI.getCorrectFileName(baseURLDev, newRoute);
  }

  return baseURL + newRoute;
}

/**
 * Takes a response and if there is an error it shows this in a nice way to the user
 *
 * @param fetchResponse: response that comes from the fetch method
 */
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
    } else if (fetchResponse.status === 9999) {
      console.warn('This local file cannot be found by the dev API');
    }
    console.log(JSON.stringify(fetchResponse));
  }
}

/**
 * Fetches a resource from a route with a fetch body, really just a wrapper for the fetch method
 *
 * @param route: string that is the route that we need to fetch
 * @param body: body that has all the correct info for the fetch
 */
function fetchResource(route: string, body: object) {
  if (token === '' && !isDev) {
    const currentPath = router.currentRoute;
    router.push(`/login?next=${currentPath}`);
    return null;
  }

  return fetch(route, body)
    .then((fetchResponse) => {
      checkResponse(fetchResponse);
      return fetchResponse.json();
    })
    .catch((error) => {
      console.error(error);
    });
}


export default {
  getResource(route: string, args = null) {
    const constructedRoute = makeRoute(route, args);

    const getBody = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    return fetchResource(constructedRoute, getBody);
  },

  patchResource(route: string, data: any, args = null) {
    const constructedRoute = makeRoute(route, args);

    const patchBody = {
      body: JSON.stringify(data),
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
    };

    return fetchResource(constructedRoute, patchBody);
  },

  putResource(route: string, data: any, args = null) {
    const constructedRoute = makeRoute(route, args);

    const putBody = {
      body: JSON.stringify(data),
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
    };

    return fetchResource(constructedRoute, putBody);
  },

  postResource(route: string, data: any, args = null) {
    const constructedRoute = makeRoute(route, args);

    const postBody = {
      body: JSON.stringify(data),
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
    };

    return fetchResource(constructedRoute, postBody);
  },

  delResource(route: string, data: any, args = null) {
    const constructedRoute = makeRoute(route, args);

    const delBody = {
      body: JSON.stringify(data),
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
    };

    return fetchResource(constructedRoute, delBody);
  },

  postFile(route: string, data: any, args = null) {
    const constructedRoute = makeRoute(route, args);

    const postFileBody = {
      body: data,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'cache-control': 'no-store',
        pragma: 'no-cache',
      },
    };

    return fetchResource(constructedRoute, postFileBody);
  },
};
