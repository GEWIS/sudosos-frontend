import * as dotenv from 'dotenv';
import eventBus from '@/eventbus';
import devAPI from '../../dev/api';
import { ApiError } from '@/entities/ApiError';
import { ResponseBody } from '@/entities/ResponseBody';

dotenv.config();

const baseURL = process.env.VUE_APP_API_BASE; // TODO: Set base URL
const token = ''; // TODO: Make sure we get the token
const isDev = process.env.VUE_APP_DEVELOP;


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

      // TODO: Test if below works
      const body = {
        status: fetchResponse.status,
        message: 'apiError.test',
      } as ApiError;
      eventBus.$emit('apiError', body);
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
function fetchResource(route: string, body: ResponseBody) {
  let fetchResult = {};

  if (token === '' && !isDev) {
    // @ts-ignore
    const currentPath = this.$router.currentRoute;
    // @ts-ignore
    this.$router.push(`/login?next=${currentPath}`);
    return null;
  }

  // If we are currently in development mode get data from the Fake API
  if (isDev) {
    try {
      fetchResult = devAPI.fetchJSON(route, body);
    } catch (e) {
      console.error(e);
    }
  }

  fetch(route, body)
    .then((fetchResponse) => {
      checkResponse(fetchResponse);
      fetchResult = fetchResponse.json();
    })
    .catch((error) => {
      console.error(error);
    });

  return fetchResult;
}


export default {
  getResource(route: string, args = null) {
    const constructedRoute = makeRoute(route, args);

    const getBody = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    } as ResponseBody;

    return fetchResource(constructedRoute, getBody);
  },

  patchResource(route: string, data: any, args = null) {
    const constructedRoute = makeRoute(route, args);

    const patchBody = {
      headers: {
        Authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      method: 'PATCH',
      body: JSON.stringify(data),
    } as ResponseBody;

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
    } as ResponseBody;

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
    } as ResponseBody;

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
    } as ResponseBody;

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
    } as ResponseBody;

    return fetchResource(constructedRoute, postFileBody);
  },
};
