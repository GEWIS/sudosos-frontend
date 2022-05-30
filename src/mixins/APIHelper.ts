/* eslint-disable no-console */

import * as dotenv from 'dotenv';
import eventBus from '@/eventbus';
import { ApiError } from '@/entities/ApiError';
import { ResponseBody } from '@/entities/ResponseBody';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import UserTransformer from '@/transformers/UserTransformer';
import { User } from '@/entities/User';
import devAPI from '../../dev/api';

dotenv.config();

type Token = {token: string, expires: string};

const baseURL = process.env.VUE_APP_API_BASE;
const isDev = (process.env.VUE_APP_DEVELOP === 'true');

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

  const queries = new URLSearchParams(window.location.search);

  if (args === null || (!('skip' in args) || !('take' in args))) {
    if (queries.has('skip')) {
      args.skip = queries.get('skip');
    }

    if (queries.has('take')) {
      args.take = queries.get('take');
    }
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

  return baseURL + newRoute;
}

/**
 * Takes a response and if there is an error it shows this in a nice way to the user
 *
 * @param fetchResponse: response that comes from the fetch method
 */
function checkResponse(fetchResponse: Response) {
  if (fetchResponse.status !== 200) {
    if (fetchResponse.status === 400) {
      console.warn('400 - Bad request');
      const body = {
        status: fetchResponse.status,
        message: 'apiError.400',
      } as ApiError;
      eventBus.$emit('apiError', body);
    } else if (fetchResponse.status === 401) {
      console.warn('401 - Unauthorized');
      const body = {
        status: fetchResponse.status,
        message: 'apiError.401',
      } as ApiError;
      eventBus.$emit('apiError', body);
    } else if (fetchResponse.status === 403) {
      console.warn('403 - Forbidden');
      const body = {
        status: fetchResponse.status,
        message: 'apiError.403',
      } as ApiError;
      eventBus.$emit('apiError', body);
    } else if (fetchResponse.status === 404) {
      console.warn('404 - Not found');
      const body = {
        status: fetchResponse.status,
        message: 'apiError.404',
      } as ApiError;
      eventBus.$emit('apiError', body);
    } else if (fetchResponse.status === 500) {
      console.warn('500 - Internal Server Error');
      const body = {
        status: fetchResponse.status,
        message: 'apiError.500',
      } as ApiError;
      eventBus.$emit('apiError', body);
    } else if (fetchResponse.status === 9999) {
      console.warn('This local file cannot be found by the dev API');
    }
    // console.log(JSON.stringify(fetchResponse));
  }
}

/**
 * Fetches a resource from a route with a fetch body, really just a wrapper for the fetch method
 *
 * @param route: string that is the route that we need to fetch
 * @param body: body that has all the correct info for the fetch
 */
function fetchResource(route: string, body: ResponseBody) {
  let fetchResult: Promise<any> = new Promise<any>((resolve) => {
    resolve({});
  });

  // If we are currently in development mode get data from the Fake API
  if (isDev) {
    try {
      fetchResult = new Promise((resolve) => {
        resolve(devAPI.fetchJSON(route, body));
      });
    } catch (e) {
      const reponseBody = {
        status: 404,
        message: 'apiError.Something went wrong',
      } as ApiError;
      eventBus.$emit('apiError', reponseBody);
      console.error(e);
    }
  } else {
    fetchResult = fetch(route, body)
      .then((response) => {
        checkResponse(response);
        return response.json();
      })
      .then((data: any) => data)
      .catch((error) => {
        console.error(error);
      });
  }

  return fetchResult;
}

export default {
  getToken() {
    const tokens = this.getTokens();
    const token = tokens[tokens.length - 1] ?? {} as any;
    return {
      jwtToken: token.token,
      jwtExpires: token.expires,
    };
  },

  getTokenUser() {
    const token = this.getToken();
    const rawUser = (jwtDecode<JwtPayload>(token.jwtToken) as any);
    return UserTransformer.makeUser(rawUser.user) as User;
  },

  getTokens(): Token[] {
    const tokens = localStorage.getItem('jwt_token') as string;
    if (tokens == null) return [];
    return JSON.parse(tokens);
  },

  popToken(): Token | undefined {
    const tokens = this.getTokens();
    const token = tokens.pop();
    if (token) this.setTokens(tokens);
    return tokens[tokens.length - 1];
  },

  setTokens(tokens: Token[]) {
    localStorage.setItem('jwt_token', JSON.stringify(tokens));
  },

  hasPreviousToken(): boolean {
    return this.getTokens().length > 1;
  },

  getPreviousToken(): Token | undefined {
    const tokens = this.getTokens();
    return this.hasPreviousToken() ? tokens[tokens.length - 2] : undefined;
  },

  parseToken(rawToken: string): Token {
    const expires = String(Number(jwtDecode<JwtPayload>(rawToken).exp) * 1000);
    return { token: rawToken, expires };
  },

  setToken(jwtToken: string) {
    this.setTokens([this.parseToken(jwtToken)]);
  },

  addToken(jwtToken: string) {
    const tokens = this.getTokens();
    tokens.push(this.parseToken(jwtToken));
    this.setTokens(tokens);
  },

  clearToken() {
    localStorage.clear();
  },

  getResource(route: string, args: Object | null = null) {
    const constructedRoute = makeRoute(route, args);

    const getBody = {
      headers: {
        Authorization: `Bearer ${this.getToken().jwtToken}`,
      },
    } as ResponseBody;

    return fetchResource(constructedRoute, getBody);
  },

  patchResource(route: string, data: any, args = null as any) {
    const constructedRoute = makeRoute(route, args);

    const patchBody = {
      headers: {
        Authorization: `Bearer ${this.getToken().jwtToken}`,
        'content-type': 'application/json',
      },
      method: 'PATCH',
      body: JSON.stringify(data),
    } as ResponseBody;

    return fetchResource(constructedRoute, patchBody);
  },

  putResource(route: string, data: any, args = null as any) {
    const constructedRoute = makeRoute(route, args);

    const putBody = {
      body: JSON.stringify(data),
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.getToken().jwtToken}`,
        'content-type': 'application/json',
      },
    } as ResponseBody;

    return fetchResource(constructedRoute, putBody);
  },

  uploadResource(route: string, file: File) {
    const constructedRoute = makeRoute(route, null);
    const data = new FormData();
    data.append('file', file);
    const postBody: ResponseBody = {
      body: data,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getToken().jwtToken}`,
      },
    };

    return fetchResource(constructedRoute, postBody);
  },

  postResource(route: string, data: any = {}, args = null as any) {
    const constructedRoute = makeRoute(route, args);

    const postBody = {
      body: JSON.stringify(data),
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getToken().jwtToken}`,
        'content-type': 'application/json',
      },
    } as ResponseBody;

    return fetchResource(constructedRoute, postBody);
  },

  delResource(route: string, args = null as any) {
    const constructedRoute = makeRoute(route, args);

    const delBody = {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.getToken().jwtToken}`,
        'content-type': 'application/json',
      },
    } as ResponseBody;

    return fetchResource(constructedRoute, delBody);
  },

  postFile(route: string, data: any, args = null as any) {
    const constructedRoute = makeRoute(route, args);

    const postFileBody = {
      body: data,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getToken().jwtToken}`,
        'cache-control': 'no-store',
        pragma: 'no-cache',
      },
    } as ResponseBody;

    return fetchResource(constructedRoute, postFileBody);
  },
};
