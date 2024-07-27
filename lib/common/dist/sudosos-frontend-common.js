var ta = Object.defineProperty;
var sa = (l, h, O) => h in l ? ta(l, h, { enumerable: !0, configurable: !0, writable: !0, value: O }) : l[h] = O;
var $ = (l, h, O) => sa(l, typeof h != "symbol" ? h + "" : h, O);
import { createPinia as aa, defineStore as vt } from "pinia";
async function ra(l, h, O) {
  let e = l, A = [];
  for (; ; ) {
    const m = await O(h, e), { records: S } = m.data;
    if (A = A.concat(S), e += h, m.data._pagination.count <= e + h)
      break;
  }
  return A;
}
aa();
const At = vt("user", {
  state: () => ({
    users: [],
    current: {
      balance: null,
      user: null,
      financialMutations: {
        _pagination: {
          take: -1,
          skip: -1,
          count: -1
        },
        records: []
      },
      createdTransactions: {
        _pagination: {
          take: -1,
          skip: -1,
          count: -1
        },
        records: []
      }
    }
  }),
  getters: {
    getUserById: (l) => (h) => l.users.find((O) => O.id === h),
    getActiveUsers() {
      return this.users.filter((l) => l.active);
    },
    getDeletedUsers() {
      return this.users.filter((l) => l.deleted);
    },
    getCurrentUser() {
      return this.current;
    }
  },
  actions: {
    async fetchUsers(l) {
      this.users = await ra(
        0,
        500,
        (h, O) => l.user.getAllUsers(h, O)
      );
    },
    async fetchCurrentUserBalance(l, h) {
      this.current.balance = (await h.balance.getBalanceId(l)).data;
    },
    async fetchUsersFinancialMutations(l, h, O, e) {
      this.current.financialMutations = (await h.user.getUsersFinancialMutations(l, O, e)).data;
    },
    async fetchUserCreatedTransactions(l, h, O, e) {
      this.current.createdTransactions = (await h.transaction.getAllTransactions(void 0, l, void 0, void 0, void 0, void 0, void 0, void 0, O, e)).data;
    },
    setCurrentUser(l) {
      this.current.user = l;
    },
    addUser(l) {
      this.users.push(l);
    },
    clearCurrent() {
      this.current.balance = null, this.current.user = null;
    },
    deleteUser(l) {
      const h = this.users.findIndex((O) => O.id === l);
      h !== -1 && this.users.splice(h, 1);
    }
  }
});
class be extends Error {
}
be.prototype.name = "InvalidTokenError";
function na(l) {
  return decodeURIComponent(atob(l).replace(/(.)/g, (h, O) => {
    let e = O.charCodeAt(0).toString(16).toUpperCase();
    return e.length < 2 && (e = "0" + e), "%" + e;
  }));
}
function ia(l) {
  let h = l.replace(/-/g, "+").replace(/_/g, "/");
  switch (h.length % 4) {
    case 0:
      break;
    case 2:
      h += "==";
      break;
    case 3:
      h += "=";
      break;
    default:
      throw new Error("base64 string is not of the correct length");
  }
  try {
    return na(h);
  } catch {
    return atob(h);
  }
}
function Ot(l, h) {
  if (typeof l != "string")
    throw new be("Invalid token specified: must be a string");
  h || (h = {});
  const O = h.header === !0 ? 0 : 1, e = l.split(".")[O];
  if (typeof e != "string")
    throw new be(`Invalid token specified: missing part #${O + 1}`);
  let A;
  try {
    A = ia(e);
  } catch (m) {
    throw new be(`Invalid token specified: invalid base64 for part #${O + 1} (${m.message})`);
  }
  try {
    return JSON.parse(A);
  } catch (m) {
    throw new be(`Invalid token specified: invalid json for part #${O + 1} (${m.message})`);
  }
}
function oa(l) {
  if (l.headers.has("Set-Authorization")) {
    const h = l.headers.get("Set-Authorization");
    h && Pt(h);
  }
}
function la() {
  localStorage.clear();
}
function ca(l) {
  const h = String(Ot(l).exp);
  return { token: l, expires: h };
}
function Pt(l) {
  localStorage.setItem("jwt_token", JSON.stringify(ca(l)));
}
function Ye() {
  const l = localStorage.getItem("jwt_token");
  let h = {};
  return l !== null && (h = JSON.parse(l)), {
    ...h
  };
}
function da(l) {
  if (l > 1e12) return !0;
  const h = l * 1e3;
  return (/* @__PURE__ */ new Date()).getTime() > h;
}
function ua() {
  const l = Ye();
  return !l.token || !l.expires ? !1 : !da(Number(l.expires));
}
function bn(l) {
  if (ua()) {
    const O = ha();
    O.extractStateFromToken();
    const e = O.getUser;
    if (e) {
      const A = At();
      A.setCurrentUser(e), A.fetchCurrentUserBalance(e.id, l);
    }
  }
}
const ha = vt({
  id: "auth",
  state: () => ({
    user: null,
    roles: [],
    token: null,
    organs: [],
    acceptedToS: null
  }),
  getters: {
    getToken() {
      return this.token;
    },
    getToS() {
      return this.acceptedToS;
    },
    getUser() {
      return this.user;
    }
  },
  actions: {
    handleResponse(l, h) {
      const { user: O, token: e, roles: A, organs: m, acceptedToS: S } = l;
      !O || !e || !A || !m || !S || (this.user = O, this.token = e, Pt(this.token), this.roles = A, this.organs = m, this.acceptedToS = S, this.acceptedToS === "ACCEPTED" && h.user.getIndividualUser(this.user.id).then((j) => {
        At().setCurrentUser(j.data);
      }));
    },
    async gewisPinlogin(l, h, O) {
      const e = {
        gewisId: parseInt(l, 10),
        pin: h
      };
      await O.authenticate.gewisPinAuthentication(e).then((A) => {
        this.handleResponse(A.data, O);
      });
    },
    async ldapLogin(l, h, O) {
      const e = {
        accountName: l,
        password: h
      };
      await O.authenticate.ldapAuthentication(e).then((A) => {
        this.handleResponse(A.data, O);
      });
    },
    async gewisWebLogin(l, h, O) {
      const e = {
        nonce: l,
        token: h
      };
      await O.authenticate.gewisWebAuthentication(e).then((A) => {
        this.handleResponse(A.data, O);
      });
    },
    async externalPinLogin(l, h, O) {
      const e = {
        pin: h,
        userId: l
      };
      await O.authenticate.pinAuthentication(e).then((A) => {
        this.handleResponse(A.data, O);
      });
    },
    async eanLogin(l, h) {
      const O = {
        eanCode: l
      };
      await h.authenticate.eanAuthentication(O).then((e) => {
        this.handleResponse(e.data, h);
      });
    },
    async apiKeyLogin(l, h, O) {
      const e = {
        key: l,
        userId: h
      };
      await O.authenticate.keyAuthentication(e).then((A) => {
        this.handleResponse(A.data, O);
      });
    },
    async gewisLdapLogin(l, h, O) {
      const e = {
        accountName: l,
        password: h
      };
      await O.authenticate.gewisLDAPAuthentication(e).then((A) => {
        this.handleResponse(A.data, O);
      });
    },
    async updateUserPin(l, h) {
      if (!this.user) return;
      const O = {
        pin: l
      };
      await h.user.updateUserPin(this.user.id, O);
    },
    async updateUserLocalPassword(l, h) {
      if (!this.user) return;
      const O = {
        password: l
      };
      await h.user.updateUserLocalPassword(this.user.id, O);
    },
    async updateUserNfc(l, h) {
      if (!this.user) return;
      const O = {
        nfcCode: l
      };
      await h.user.updateUserNfc(this.user.id, O);
    },
    async updateUserKey(l) {
      if (this.user)
        return (await l.user.updateUserKey(this.user.id)).data;
    },
    async updateUserToSAccepted(l, h) {
      if (!this.user) return;
      const O = {
        extensiveDataProcessing: l
      };
      await h.user.acceptTos(O);
      const e = await h.authenticate.refreshToken();
      this.handleResponse(e.data, h);
    },
    extractStateFromToken() {
      const l = Ye();
      if (!l.token) return;
      const h = Ot(l.token);
      this.user = h.user, this.roles = h.roles, this.token = l.token, this.organs = h.organs, this.acceptedToS = h.acceptedToS;
    },
    logout() {
      this.user = null, this.roles = [], this.token = null, this.organs = [], this.acceptedToS = null, la();
    }
  }
});
var de = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function pa(l) {
  if (l.__esModule) return l;
  var h = l.default;
  if (typeof h == "function") {
    var O = function e() {
      return this instanceof e ? Reflect.construct(h, arguments, this.constructor) : h.apply(this, arguments);
    };
    O.prototype = h.prototype;
  } else O = {};
  return Object.defineProperty(O, "__esModule", { value: !0 }), Object.keys(l).forEach(function(e) {
    var A = Object.getOwnPropertyDescriptor(l, e);
    Object.defineProperty(O, e, A.get ? A : {
      enumerable: !0,
      get: function() {
        return l[e];
      }
    });
  }), O;
}
var k = {}, bt = {};
function mt(l, h) {
  return function() {
    return l.apply(h, arguments);
  };
}
const { toString: va } = Object.prototype, { getPrototypeOf: $e } = Object, Ve = /* @__PURE__ */ ((l) => (h) => {
  const O = va.call(h);
  return l[O] || (l[O] = O.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), re = (l) => (l = l.toLowerCase(), (h) => Ve(h) === l), ye = (l) => (h) => typeof h === l, { isArray: Ae } = Array, me = ye("undefined");
function Aa(l) {
  return l !== null && !me(l) && l.constructor !== null && !me(l.constructor) && te(l.constructor.isBuffer) && l.constructor.isBuffer(l);
}
const St = re("ArrayBuffer");
function Oa(l) {
  let h;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? h = ArrayBuffer.isView(l) : h = l && l.buffer && St(l.buffer), h;
}
const Pa = ye("string"), te = ye("function"), gt = ye("number"), Ee = (l) => l !== null && typeof l == "object", ba = (l) => l === !0 || l === !1, je = (l) => {
  if (Ve(l) !== "object")
    return !1;
  const h = $e(l);
  return (h === null || h === Object.prototype || Object.getPrototypeOf(h) === null) && !(Symbol.toStringTag in l) && !(Symbol.iterator in l);
}, ma = re("Date"), Sa = re("File"), ga = re("Blob"), fa = re("FileList"), ja = (l) => Ee(l) && te(l.pipe), Ua = (l) => {
  let h;
  return l && (typeof FormData == "function" && l instanceof FormData || te(l.append) && ((h = Ve(l)) === "formdata" || // detect form-data instance
  h === "object" && te(l.toString) && l.toString() === "[object FormData]"));
}, Ra = re("URLSearchParams"), [_a, Va, ya, Ea] = ["ReadableStream", "Request", "Response", "Headers"].map(re), Ta = (l) => l.trim ? l.trim() : l.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function Se(l, h, { allOwnKeys: O = !1 } = {}) {
  if (l === null || typeof l > "u")
    return;
  let e, A;
  if (typeof l != "object" && (l = [l]), Ae(l))
    for (e = 0, A = l.length; e < A; e++)
      h.call(null, l[e], e, l);
  else {
    const m = O ? Object.getOwnPropertyNames(l) : Object.keys(l), S = m.length;
    let j;
    for (e = 0; e < S; e++)
      j = m[e], h.call(null, l[j], j, l);
  }
}
function ft(l, h) {
  h = h.toLowerCase();
  const O = Object.keys(l);
  let e = O.length, A;
  for (; e-- > 0; )
    if (A = O[e], h === A.toLowerCase())
      return A;
  return null;
}
const jt = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, Ut = (l) => !me(l) && l !== jt;
function Le() {
  const { caseless: l } = Ut(this) && this || {}, h = {}, O = (e, A) => {
    const m = l && ft(h, A) || A;
    je(h[m]) && je(e) ? h[m] = Le(h[m], e) : je(e) ? h[m] = Le({}, e) : Ae(e) ? h[m] = e.slice() : h[m] = e;
  };
  for (let e = 0, A = arguments.length; e < A; e++)
    arguments[e] && Se(arguments[e], O);
  return h;
}
const Ba = (l, h, O, { allOwnKeys: e } = {}) => (Se(h, (A, m) => {
  O && te(A) ? l[m] = mt(A, O) : l[m] = A;
}, { allOwnKeys: e }), l), Fa = (l) => (l.charCodeAt(0) === 65279 && (l = l.slice(1)), l), Ca = (l, h, O, e) => {
  l.prototype = Object.create(h.prototype, e), l.prototype.constructor = l, Object.defineProperty(l, "super", {
    value: h.prototype
  }), O && Object.assign(l.prototype, O);
}, Ia = (l, h, O, e) => {
  let A, m, S;
  const j = {};
  if (h = h || {}, l == null) return h;
  do {
    for (A = Object.getOwnPropertyNames(l), m = A.length; m-- > 0; )
      S = A[m], (!e || e(S, l, h)) && !j[S] && (h[S] = l[S], j[S] = !0);
    l = O !== !1 && $e(l);
  } while (l && (!O || O(l, h)) && l !== Object.prototype);
  return h;
}, wa = (l, h, O) => {
  l = String(l), (O === void 0 || O > l.length) && (O = l.length), O -= h.length;
  const e = l.indexOf(h, O);
  return e !== -1 && e === O;
}, Ma = (l) => {
  if (!l) return null;
  if (Ae(l)) return l;
  let h = l.length;
  if (!gt(h)) return null;
  const O = new Array(h);
  for (; h-- > 0; )
    O[h] = l[h];
  return O;
}, xa = /* @__PURE__ */ ((l) => (h) => l && h instanceof l)(typeof Uint8Array < "u" && $e(Uint8Array)), La = (l, h) => {
  const e = (l && l[Symbol.iterator]).call(l);
  let A;
  for (; (A = e.next()) && !A.done; ) {
    const m = A.value;
    h.call(l, m[0], m[1]);
  }
}, qa = (l, h) => {
  let O;
  const e = [];
  for (; (O = l.exec(h)) !== null; )
    e.push(O);
  return e;
}, Da = re("HTMLFormElement"), Ha = (l) => l.toLowerCase().replace(
  /[-_\s]([a-z\d])(\w*)/g,
  function(O, e, A) {
    return e.toUpperCase() + A;
  }
), tt = (({ hasOwnProperty: l }) => (h, O) => l.call(h, O))(Object.prototype), Na = re("RegExp"), Rt = (l, h) => {
  const O = Object.getOwnPropertyDescriptors(l), e = {};
  Se(O, (A, m) => {
    let S;
    (S = h(A, m, l)) !== !1 && (e[m] = S || A);
  }), Object.defineProperties(l, e);
}, Ga = (l) => {
  Rt(l, (h, O) => {
    if (te(l) && ["arguments", "caller", "callee"].indexOf(O) !== -1)
      return !1;
    const e = l[O];
    if (te(e)) {
      if (h.enumerable = !1, "writable" in h) {
        h.writable = !1;
        return;
      }
      h.set || (h.set = () => {
        throw Error("Can not rewrite read-only method '" + O + "'");
      });
    }
  });
}, ka = (l, h) => {
  const O = {}, e = (A) => {
    A.forEach((m) => {
      O[m] = !0;
    });
  };
  return Ae(l) ? e(l) : e(String(l).split(h)), O;
}, Qa = () => {
}, Ya = (l, h) => l != null && Number.isFinite(l = +l) ? l : h, Ie = "abcdefghijklmnopqrstuvwxyz", st = "0123456789", _t = {
  DIGIT: st,
  ALPHA: Ie,
  ALPHA_DIGIT: Ie + Ie.toUpperCase() + st
}, $a = (l = 16, h = _t.ALPHA_DIGIT) => {
  let O = "";
  const { length: e } = h;
  for (; l--; )
    O += h[Math.random() * e | 0];
  return O;
};
function za(l) {
  return !!(l && te(l.append) && l[Symbol.toStringTag] === "FormData" && l[Symbol.iterator]);
}
const Ka = (l) => {
  const h = new Array(10), O = (e, A) => {
    if (Ee(e)) {
      if (h.indexOf(e) >= 0)
        return;
      if (!("toJSON" in e)) {
        h[A] = e;
        const m = Ae(e) ? [] : {};
        return Se(e, (S, j) => {
          const V = O(S, A + 1);
          !me(V) && (m[j] = V);
        }), h[A] = void 0, m;
      }
    }
    return e;
  };
  return O(l, 0);
}, Wa = re("AsyncFunction"), Ja = (l) => l && (Ee(l) || te(l)) && te(l.then) && te(l.catch), g = {
  isArray: Ae,
  isArrayBuffer: St,
  isBuffer: Aa,
  isFormData: Ua,
  isArrayBufferView: Oa,
  isString: Pa,
  isNumber: gt,
  isBoolean: ba,
  isObject: Ee,
  isPlainObject: je,
  isReadableStream: _a,
  isRequest: Va,
  isResponse: ya,
  isHeaders: Ea,
  isUndefined: me,
  isDate: ma,
  isFile: Sa,
  isBlob: ga,
  isRegExp: Na,
  isFunction: te,
  isStream: ja,
  isURLSearchParams: Ra,
  isTypedArray: xa,
  isFileList: fa,
  forEach: Se,
  merge: Le,
  extend: Ba,
  trim: Ta,
  stripBOM: Fa,
  inherits: Ca,
  toFlatObject: Ia,
  kindOf: Ve,
  kindOfTest: re,
  endsWith: wa,
  toArray: Ma,
  forEachEntry: La,
  matchAll: qa,
  isHTMLForm: Da,
  hasOwnProperty: tt,
  hasOwnProp: tt,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors: Rt,
  freezeMethods: Ga,
  toObjectSet: ka,
  toCamelCase: Ha,
  noop: Qa,
  toFiniteNumber: Ya,
  findKey: ft,
  global: jt,
  isContextDefined: Ut,
  ALPHABET: _t,
  generateString: $a,
  isSpecCompliantForm: za,
  toJSONObject: Ka,
  isAsyncFn: Wa,
  isThenable: Ja
};
function w(l, h, O, e, A) {
  Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = l, this.name = "AxiosError", h && (this.code = h), O && (this.config = O), e && (this.request = e), A && (this.response = A);
}
g.inherits(w, Error, {
  toJSON: function() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: g.toJSONObject(this.config),
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  }
});
const Vt = w.prototype, yt = {};
[
  "ERR_BAD_OPTION_VALUE",
  "ERR_BAD_OPTION",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_NETWORK",
  "ERR_FR_TOO_MANY_REDIRECTS",
  "ERR_DEPRECATED",
  "ERR_BAD_RESPONSE",
  "ERR_BAD_REQUEST",
  "ERR_CANCELED",
  "ERR_NOT_SUPPORT",
  "ERR_INVALID_URL"
  // eslint-disable-next-line func-names
].forEach((l) => {
  yt[l] = { value: l };
});
Object.defineProperties(w, yt);
Object.defineProperty(Vt, "isAxiosError", { value: !0 });
w.from = (l, h, O, e, A, m) => {
  const S = Object.create(Vt);
  return g.toFlatObject(l, S, function(V) {
    return V !== Error.prototype;
  }, (j) => j !== "isAxiosError"), w.call(S, l.message, h, O, e, A), S.cause = l, S.name = l.name, m && Object.assign(S, m), S;
};
const Xa = null;
function qe(l) {
  return g.isPlainObject(l) || g.isArray(l);
}
function Et(l) {
  return g.endsWith(l, "[]") ? l.slice(0, -2) : l;
}
function at(l, h, O) {
  return l ? l.concat(h).map(function(A, m) {
    return A = Et(A), !O && m ? "[" + A + "]" : A;
  }).join(O ? "." : "") : h;
}
function Za(l) {
  return g.isArray(l) && !l.some(qe);
}
const er = g.toFlatObject(g, {}, null, function(h) {
  return /^is[A-Z]/.test(h);
});
function Te(l, h, O) {
  if (!g.isObject(l))
    throw new TypeError("target must be an object");
  h = h || new FormData(), O = g.toFlatObject(O, {
    metaTokens: !0,
    dots: !1,
    indexes: !1
  }, !1, function(M, W) {
    return !g.isUndefined(W[M]);
  });
  const e = O.metaTokens, A = O.visitor || U, m = O.dots, S = O.indexes, V = (O.Blob || typeof Blob < "u" && Blob) && g.isSpecCompliantForm(h);
  if (!g.isFunction(A))
    throw new TypeError("visitor must be a function");
  function _(B) {
    if (B === null) return "";
    if (g.isDate(B))
      return B.toISOString();
    if (!V && g.isBlob(B))
      throw new w("Blob is not supported. Use a Buffer instead.");
    return g.isArrayBuffer(B) || g.isTypedArray(B) ? V && typeof Blob == "function" ? new Blob([B]) : Buffer.from(B) : B;
  }
  function U(B, M, W) {
    let J = B;
    if (B && !W && typeof B == "object") {
      if (g.endsWith(M, "{}"))
        M = e ? M : M.slice(0, -2), B = JSON.stringify(B);
      else if (g.isArray(B) && Za(B) || (g.isFileList(B) || g.endsWith(M, "[]")) && (J = g.toArray(B)))
        return M = Et(M), J.forEach(function(H, ue) {
          !(g.isUndefined(H) || H === null) && h.append(
            // eslint-disable-next-line no-nested-ternary
            S === !0 ? at([M], ue, m) : S === null ? M : M + "[]",
            _(H)
          );
        }), !1;
    }
    return qe(B) ? !0 : (h.append(at(W, M, m), _(B)), !1);
  }
  const T = [], N = Object.assign(er, {
    defaultVisitor: U,
    convertValue: _,
    isVisitable: qe
  });
  function q(B, M) {
    if (!g.isUndefined(B)) {
      if (T.indexOf(B) !== -1)
        throw Error("Circular reference detected in " + M.join("."));
      T.push(B), g.forEach(B, function(J, se) {
        (!(g.isUndefined(J) || J === null) && A.call(
          h,
          J,
          g.isString(se) ? se.trim() : se,
          M,
          N
        )) === !0 && q(J, M ? M.concat(se) : [se]);
      }), T.pop();
    }
  }
  if (!g.isObject(l))
    throw new TypeError("data must be an object");
  return q(l), h;
}
function rt(l) {
  const h = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(l).replace(/[!'()~]|%20|%00/g, function(e) {
    return h[e];
  });
}
function ze(l, h) {
  this._pairs = [], l && Te(l, this, h);
}
const Tt = ze.prototype;
Tt.append = function(h, O) {
  this._pairs.push([h, O]);
};
Tt.toString = function(h) {
  const O = h ? function(e) {
    return h.call(this, e, rt);
  } : rt;
  return this._pairs.map(function(A) {
    return O(A[0]) + "=" + O(A[1]);
  }, "").join("&");
};
function tr(l) {
  return encodeURIComponent(l).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
}
function Bt(l, h, O) {
  if (!h)
    return l;
  const e = O && O.encode || tr, A = O && O.serialize;
  let m;
  if (A ? m = A(h, O) : m = g.isURLSearchParams(h) ? h.toString() : new ze(h, O).toString(e), m) {
    const S = l.indexOf("#");
    S !== -1 && (l = l.slice(0, S)), l += (l.indexOf("?") === -1 ? "?" : "&") + m;
  }
  return l;
}
class nt {
  constructor() {
    this.handlers = [];
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(h, O, e) {
    return this.handlers.push({
      fulfilled: h,
      rejected: O,
      synchronous: e ? e.synchronous : !1,
      runWhen: e ? e.runWhen : null
    }), this.handlers.length - 1;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
   */
  eject(h) {
    this.handlers[h] && (this.handlers[h] = null);
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    this.handlers && (this.handlers = []);
  }
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(h) {
    g.forEach(this.handlers, function(e) {
      e !== null && h(e);
    });
  }
}
const Ft = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1
}, sr = typeof URLSearchParams < "u" ? URLSearchParams : ze, ar = typeof FormData < "u" ? FormData : null, rr = typeof Blob < "u" ? Blob : null, nr = {
  isBrowser: !0,
  classes: {
    URLSearchParams: sr,
    FormData: ar,
    Blob: rr
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, Ke = typeof window < "u" && typeof document < "u", ir = ((l) => Ke && ["ReactNative", "NativeScript", "NS"].indexOf(l) < 0)(typeof navigator < "u" && navigator.product), or = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", lr = Ke && window.location.href || "http://localhost", cr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: Ke,
  hasStandardBrowserEnv: ir,
  hasStandardBrowserWebWorkerEnv: or,
  origin: lr
}, Symbol.toStringTag, { value: "Module" })), ae = {
  ...cr,
  ...nr
};
function dr(l, h) {
  return Te(l, new ae.classes.URLSearchParams(), Object.assign({
    visitor: function(O, e, A, m) {
      return ae.isNode && g.isBuffer(O) ? (this.append(e, O.toString("base64")), !1) : m.defaultVisitor.apply(this, arguments);
    }
  }, h));
}
function ur(l) {
  return g.matchAll(/\w+|\[(\w*)]/g, l).map((h) => h[0] === "[]" ? "" : h[1] || h[0]);
}
function hr(l) {
  const h = {}, O = Object.keys(l);
  let e;
  const A = O.length;
  let m;
  for (e = 0; e < A; e++)
    m = O[e], h[m] = l[m];
  return h;
}
function Ct(l) {
  function h(O, e, A, m) {
    let S = O[m++];
    if (S === "__proto__") return !0;
    const j = Number.isFinite(+S), V = m >= O.length;
    return S = !S && g.isArray(A) ? A.length : S, V ? (g.hasOwnProp(A, S) ? A[S] = [A[S], e] : A[S] = e, !j) : ((!A[S] || !g.isObject(A[S])) && (A[S] = []), h(O, e, A[S], m) && g.isArray(A[S]) && (A[S] = hr(A[S])), !j);
  }
  if (g.isFormData(l) && g.isFunction(l.entries)) {
    const O = {};
    return g.forEachEntry(l, (e, A) => {
      h(ur(e), A, O, 0);
    }), O;
  }
  return null;
}
function pr(l, h, O) {
  if (g.isString(l))
    try {
      return (h || JSON.parse)(l), g.trim(l);
    } catch (e) {
      if (e.name !== "SyntaxError")
        throw e;
    }
  return (O || JSON.stringify)(l);
}
const ge = {
  transitional: Ft,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [function(h, O) {
    const e = O.getContentType() || "", A = e.indexOf("application/json") > -1, m = g.isObject(h);
    if (m && g.isHTMLForm(h) && (h = new FormData(h)), g.isFormData(h))
      return A ? JSON.stringify(Ct(h)) : h;
    if (g.isArrayBuffer(h) || g.isBuffer(h) || g.isStream(h) || g.isFile(h) || g.isBlob(h) || g.isReadableStream(h))
      return h;
    if (g.isArrayBufferView(h))
      return h.buffer;
    if (g.isURLSearchParams(h))
      return O.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), h.toString();
    let j;
    if (m) {
      if (e.indexOf("application/x-www-form-urlencoded") > -1)
        return dr(h, this.formSerializer).toString();
      if ((j = g.isFileList(h)) || e.indexOf("multipart/form-data") > -1) {
        const V = this.env && this.env.FormData;
        return Te(
          j ? { "files[]": h } : h,
          V && new V(),
          this.formSerializer
        );
      }
    }
    return m || A ? (O.setContentType("application/json", !1), pr(h)) : h;
  }],
  transformResponse: [function(h) {
    const O = this.transitional || ge.transitional, e = O && O.forcedJSONParsing, A = this.responseType === "json";
    if (g.isResponse(h) || g.isReadableStream(h))
      return h;
    if (h && g.isString(h) && (e && !this.responseType || A)) {
      const S = !(O && O.silentJSONParsing) && A;
      try {
        return JSON.parse(h);
      } catch (j) {
        if (S)
          throw j.name === "SyntaxError" ? w.from(j, w.ERR_BAD_RESPONSE, this, null, this.response) : j;
      }
    }
    return h;
  }],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: ae.classes.FormData,
    Blob: ae.classes.Blob
  },
  validateStatus: function(h) {
    return h >= 200 && h < 300;
  },
  headers: {
    common: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
g.forEach(["delete", "get", "head", "post", "put", "patch"], (l) => {
  ge.headers[l] = {};
});
const vr = g.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]), Ar = (l) => {
  const h = {};
  let O, e, A;
  return l && l.split(`
`).forEach(function(S) {
    A = S.indexOf(":"), O = S.substring(0, A).trim().toLowerCase(), e = S.substring(A + 1).trim(), !(!O || h[O] && vr[O]) && (O === "set-cookie" ? h[O] ? h[O].push(e) : h[O] = [e] : h[O] = h[O] ? h[O] + ", " + e : e);
  }), h;
}, it = Symbol("internals");
function Pe(l) {
  return l && String(l).trim().toLowerCase();
}
function Ue(l) {
  return l === !1 || l == null ? l : g.isArray(l) ? l.map(Ue) : String(l);
}
function Or(l) {
  const h = /* @__PURE__ */ Object.create(null), O = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let e;
  for (; e = O.exec(l); )
    h[e[1]] = e[2];
  return h;
}
const Pr = (l) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(l.trim());
function we(l, h, O, e, A) {
  if (g.isFunction(e))
    return e.call(this, h, O);
  if (A && (h = O), !!g.isString(h)) {
    if (g.isString(e))
      return h.indexOf(e) !== -1;
    if (g.isRegExp(e))
      return e.test(h);
  }
}
function br(l) {
  return l.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (h, O, e) => O.toUpperCase() + e);
}
function mr(l, h) {
  const O = g.toCamelCase(" " + h);
  ["get", "set", "has"].forEach((e) => {
    Object.defineProperty(l, e + O, {
      value: function(A, m, S) {
        return this[e].call(this, h, A, m, S);
      },
      configurable: !0
    });
  });
}
let Z = class {
  constructor(h) {
    h && this.set(h);
  }
  set(h, O, e) {
    const A = this;
    function m(j, V, _) {
      const U = Pe(V);
      if (!U)
        throw new Error("header name must be a non-empty string");
      const T = g.findKey(A, U);
      (!T || A[T] === void 0 || _ === !0 || _ === void 0 && A[T] !== !1) && (A[T || V] = Ue(j));
    }
    const S = (j, V) => g.forEach(j, (_, U) => m(_, U, V));
    if (g.isPlainObject(h) || h instanceof this.constructor)
      S(h, O);
    else if (g.isString(h) && (h = h.trim()) && !Pr(h))
      S(Ar(h), O);
    else if (g.isHeaders(h))
      for (const [j, V] of h.entries())
        m(V, j, e);
    else
      h != null && m(O, h, e);
    return this;
  }
  get(h, O) {
    if (h = Pe(h), h) {
      const e = g.findKey(this, h);
      if (e) {
        const A = this[e];
        if (!O)
          return A;
        if (O === !0)
          return Or(A);
        if (g.isFunction(O))
          return O.call(this, A, e);
        if (g.isRegExp(O))
          return O.exec(A);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(h, O) {
    if (h = Pe(h), h) {
      const e = g.findKey(this, h);
      return !!(e && this[e] !== void 0 && (!O || we(this, this[e], e, O)));
    }
    return !1;
  }
  delete(h, O) {
    const e = this;
    let A = !1;
    function m(S) {
      if (S = Pe(S), S) {
        const j = g.findKey(e, S);
        j && (!O || we(e, e[j], j, O)) && (delete e[j], A = !0);
      }
    }
    return g.isArray(h) ? h.forEach(m) : m(h), A;
  }
  clear(h) {
    const O = Object.keys(this);
    let e = O.length, A = !1;
    for (; e--; ) {
      const m = O[e];
      (!h || we(this, this[m], m, h, !0)) && (delete this[m], A = !0);
    }
    return A;
  }
  normalize(h) {
    const O = this, e = {};
    return g.forEach(this, (A, m) => {
      const S = g.findKey(e, m);
      if (S) {
        O[S] = Ue(A), delete O[m];
        return;
      }
      const j = h ? br(m) : String(m).trim();
      j !== m && delete O[m], O[j] = Ue(A), e[j] = !0;
    }), this;
  }
  concat(...h) {
    return this.constructor.concat(this, ...h);
  }
  toJSON(h) {
    const O = /* @__PURE__ */ Object.create(null);
    return g.forEach(this, (e, A) => {
      e != null && e !== !1 && (O[A] = h && g.isArray(e) ? e.join(", ") : e);
    }), O;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([h, O]) => h + ": " + O).join(`
`);
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(h) {
    return h instanceof this ? h : new this(h);
  }
  static concat(h, ...O) {
    const e = new this(h);
    return O.forEach((A) => e.set(A)), e;
  }
  static accessor(h) {
    const e = (this[it] = this[it] = {
      accessors: {}
    }).accessors, A = this.prototype;
    function m(S) {
      const j = Pe(S);
      e[j] || (mr(A, S), e[j] = !0);
    }
    return g.isArray(h) ? h.forEach(m) : m(h), this;
  }
};
Z.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
g.reduceDescriptors(Z.prototype, ({ value: l }, h) => {
  let O = h[0].toUpperCase() + h.slice(1);
  return {
    get: () => l,
    set(e) {
      this[O] = e;
    }
  };
});
g.freezeMethods(Z);
function Me(l, h) {
  const O = this || ge, e = h || O, A = Z.from(e.headers);
  let m = e.data;
  return g.forEach(l, function(j) {
    m = j.call(O, m, A.normalize(), h ? h.status : void 0);
  }), A.normalize(), m;
}
function It(l) {
  return !!(l && l.__CANCEL__);
}
function Oe(l, h, O) {
  w.call(this, l ?? "canceled", w.ERR_CANCELED, h, O), this.name = "CanceledError";
}
g.inherits(Oe, w, {
  __CANCEL__: !0
});
function wt(l, h, O) {
  const e = O.config.validateStatus;
  !O.status || !e || e(O.status) ? l(O) : h(new w(
    "Request failed with status code " + O.status,
    [w.ERR_BAD_REQUEST, w.ERR_BAD_RESPONSE][Math.floor(O.status / 100) - 4],
    O.config,
    O.request,
    O
  ));
}
function Sr(l) {
  const h = /^([-+\w]{1,25})(:?\/\/|:)/.exec(l);
  return h && h[1] || "";
}
function gr(l, h) {
  l = l || 10;
  const O = new Array(l), e = new Array(l);
  let A = 0, m = 0, S;
  return h = h !== void 0 ? h : 1e3, function(V) {
    const _ = Date.now(), U = e[m];
    S || (S = _), O[A] = V, e[A] = _;
    let T = m, N = 0;
    for (; T !== A; )
      N += O[T++], T = T % l;
    if (A = (A + 1) % l, A === m && (m = (m + 1) % l), _ - S < h)
      return;
    const q = U && _ - U;
    return q ? Math.round(N * 1e3 / q) : void 0;
  };
}
function fr(l, h) {
  let O = 0;
  const e = 1e3 / h;
  let A = null;
  return function() {
    const S = this === !0, j = Date.now();
    if (S || j - O > e)
      return A && (clearTimeout(A), A = null), O = j, l.apply(null, arguments);
    A || (A = setTimeout(() => (A = null, O = Date.now(), l.apply(null, arguments)), e - (j - O)));
  };
}
const Re = (l, h, O = 3) => {
  let e = 0;
  const A = gr(50, 250);
  return fr((m) => {
    const S = m.loaded, j = m.lengthComputable ? m.total : void 0, V = S - e, _ = A(V), U = S <= j;
    e = S;
    const T = {
      loaded: S,
      total: j,
      progress: j ? S / j : void 0,
      bytes: V,
      rate: _ || void 0,
      estimated: _ && j && U ? (j - S) / _ : void 0,
      event: m,
      lengthComputable: j != null
    };
    T[h ? "download" : "upload"] = !0, l(T);
  }, O);
}, jr = ae.hasStandardBrowserEnv ? (
  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  function() {
    const h = /(msie|trident)/i.test(navigator.userAgent), O = document.createElement("a");
    let e;
    function A(m) {
      let S = m;
      return h && (O.setAttribute("href", S), S = O.href), O.setAttribute("href", S), {
        href: O.href,
        protocol: O.protocol ? O.protocol.replace(/:$/, "") : "",
        host: O.host,
        search: O.search ? O.search.replace(/^\?/, "") : "",
        hash: O.hash ? O.hash.replace(/^#/, "") : "",
        hostname: O.hostname,
        port: O.port,
        pathname: O.pathname.charAt(0) === "/" ? O.pathname : "/" + O.pathname
      };
    }
    return e = A(window.location.href), function(S) {
      const j = g.isString(S) ? A(S) : S;
      return j.protocol === e.protocol && j.host === e.host;
    };
  }()
) : (
  // Non standard browser envs (web workers, react-native) lack needed support.
  /* @__PURE__ */ function() {
    return function() {
      return !0;
    };
  }()
), Ur = ae.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(l, h, O, e, A, m) {
      const S = [l + "=" + encodeURIComponent(h)];
      g.isNumber(O) && S.push("expires=" + new Date(O).toGMTString()), g.isString(e) && S.push("path=" + e), g.isString(A) && S.push("domain=" + A), m === !0 && S.push("secure"), document.cookie = S.join("; ");
    },
    read(l) {
      const h = document.cookie.match(new RegExp("(^|;\\s*)(" + l + ")=([^;]*)"));
      return h ? decodeURIComponent(h[3]) : null;
    },
    remove(l) {
      this.write(l, "", Date.now() - 864e5);
    }
  }
) : (
  // Non-standard browser env (web workers, react-native) lack needed support.
  {
    write() {
    },
    read() {
      return null;
    },
    remove() {
    }
  }
);
function Rr(l) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(l);
}
function _r(l, h) {
  return h ? l.replace(/\/?\/$/, "") + "/" + h.replace(/^\/+/, "") : l;
}
function Mt(l, h) {
  return l && !Rr(h) ? _r(l, h) : h;
}
const ot = (l) => l instanceof Z ? { ...l } : l;
function ve(l, h) {
  h = h || {};
  const O = {};
  function e(_, U, T) {
    return g.isPlainObject(_) && g.isPlainObject(U) ? g.merge.call({ caseless: T }, _, U) : g.isPlainObject(U) ? g.merge({}, U) : g.isArray(U) ? U.slice() : U;
  }
  function A(_, U, T) {
    if (g.isUndefined(U)) {
      if (!g.isUndefined(_))
        return e(void 0, _, T);
    } else return e(_, U, T);
  }
  function m(_, U) {
    if (!g.isUndefined(U))
      return e(void 0, U);
  }
  function S(_, U) {
    if (g.isUndefined(U)) {
      if (!g.isUndefined(_))
        return e(void 0, _);
    } else return e(void 0, U);
  }
  function j(_, U, T) {
    if (T in h)
      return e(_, U);
    if (T in l)
      return e(void 0, _);
  }
  const V = {
    url: m,
    method: m,
    data: m,
    baseURL: S,
    transformRequest: S,
    transformResponse: S,
    paramsSerializer: S,
    timeout: S,
    timeoutMessage: S,
    withCredentials: S,
    withXSRFToken: S,
    adapter: S,
    responseType: S,
    xsrfCookieName: S,
    xsrfHeaderName: S,
    onUploadProgress: S,
    onDownloadProgress: S,
    decompress: S,
    maxContentLength: S,
    maxBodyLength: S,
    beforeRedirect: S,
    transport: S,
    httpAgent: S,
    httpsAgent: S,
    cancelToken: S,
    socketPath: S,
    responseEncoding: S,
    validateStatus: j,
    headers: (_, U) => A(ot(_), ot(U), !0)
  };
  return g.forEach(Object.keys(Object.assign({}, l, h)), function(U) {
    const T = V[U] || A, N = T(l[U], h[U], U);
    g.isUndefined(N) && T !== j || (O[U] = N);
  }), O;
}
const xt = (l) => {
  const h = ve({}, l);
  let { data: O, withXSRFToken: e, xsrfHeaderName: A, xsrfCookieName: m, headers: S, auth: j } = h;
  h.headers = S = Z.from(S), h.url = Bt(Mt(h.baseURL, h.url), l.params, l.paramsSerializer), j && S.set(
    "Authorization",
    "Basic " + btoa((j.username || "") + ":" + (j.password ? unescape(encodeURIComponent(j.password)) : ""))
  );
  let V;
  if (g.isFormData(O)) {
    if (ae.hasStandardBrowserEnv || ae.hasStandardBrowserWebWorkerEnv)
      S.setContentType(void 0);
    else if ((V = S.getContentType()) !== !1) {
      const [_, ...U] = V ? V.split(";").map((T) => T.trim()).filter(Boolean) : [];
      S.setContentType([_ || "multipart/form-data", ...U].join("; "));
    }
  }
  if (ae.hasStandardBrowserEnv && (e && g.isFunction(e) && (e = e(h)), e || e !== !1 && jr(h.url))) {
    const _ = A && m && Ur.read(m);
    _ && S.set(A, _);
  }
  return h;
}, Vr = typeof XMLHttpRequest < "u", yr = Vr && function(l) {
  return new Promise(function(O, e) {
    const A = xt(l);
    let m = A.data;
    const S = Z.from(A.headers).normalize();
    let { responseType: j } = A, V;
    function _() {
      A.cancelToken && A.cancelToken.unsubscribe(V), A.signal && A.signal.removeEventListener("abort", V);
    }
    let U = new XMLHttpRequest();
    U.open(A.method.toUpperCase(), A.url, !0), U.timeout = A.timeout;
    function T() {
      if (!U)
        return;
      const q = Z.from(
        "getAllResponseHeaders" in U && U.getAllResponseHeaders()
      ), M = {
        data: !j || j === "text" || j === "json" ? U.responseText : U.response,
        status: U.status,
        statusText: U.statusText,
        headers: q,
        config: l,
        request: U
      };
      wt(function(J) {
        O(J), _();
      }, function(J) {
        e(J), _();
      }, M), U = null;
    }
    "onloadend" in U ? U.onloadend = T : U.onreadystatechange = function() {
      !U || U.readyState !== 4 || U.status === 0 && !(U.responseURL && U.responseURL.indexOf("file:") === 0) || setTimeout(T);
    }, U.onabort = function() {
      U && (e(new w("Request aborted", w.ECONNABORTED, A, U)), U = null);
    }, U.onerror = function() {
      e(new w("Network Error", w.ERR_NETWORK, A, U)), U = null;
    }, U.ontimeout = function() {
      let B = A.timeout ? "timeout of " + A.timeout + "ms exceeded" : "timeout exceeded";
      const M = A.transitional || Ft;
      A.timeoutErrorMessage && (B = A.timeoutErrorMessage), e(new w(
        B,
        M.clarifyTimeoutError ? w.ETIMEDOUT : w.ECONNABORTED,
        A,
        U
      )), U = null;
    }, m === void 0 && S.setContentType(null), "setRequestHeader" in U && g.forEach(S.toJSON(), function(B, M) {
      U.setRequestHeader(M, B);
    }), g.isUndefined(A.withCredentials) || (U.withCredentials = !!A.withCredentials), j && j !== "json" && (U.responseType = A.responseType), typeof A.onDownloadProgress == "function" && U.addEventListener("progress", Re(A.onDownloadProgress, !0)), typeof A.onUploadProgress == "function" && U.upload && U.upload.addEventListener("progress", Re(A.onUploadProgress)), (A.cancelToken || A.signal) && (V = (q) => {
      U && (e(!q || q.type ? new Oe(null, l, U) : q), U.abort(), U = null);
    }, A.cancelToken && A.cancelToken.subscribe(V), A.signal && (A.signal.aborted ? V() : A.signal.addEventListener("abort", V)));
    const N = Sr(A.url);
    if (N && ae.protocols.indexOf(N) === -1) {
      e(new w("Unsupported protocol " + N + ":", w.ERR_BAD_REQUEST, l));
      return;
    }
    U.send(m || null);
  });
}, Er = (l, h) => {
  let O = new AbortController(), e;
  const A = function(V) {
    if (!e) {
      e = !0, S();
      const _ = V instanceof Error ? V : this.reason;
      O.abort(_ instanceof w ? _ : new Oe(_ instanceof Error ? _.message : _));
    }
  };
  let m = h && setTimeout(() => {
    A(new w(`timeout ${h} of ms exceeded`, w.ETIMEDOUT));
  }, h);
  const S = () => {
    l && (m && clearTimeout(m), m = null, l.forEach((V) => {
      V && (V.removeEventListener ? V.removeEventListener("abort", A) : V.unsubscribe(A));
    }), l = null);
  };
  l.forEach((V) => V && V.addEventListener && V.addEventListener("abort", A));
  const { signal: j } = O;
  return j.unsubscribe = S, [j, () => {
    m && clearTimeout(m), m = null;
  }];
}, Tr = function* (l, h) {
  let O = l.byteLength;
  if (!h || O < h) {
    yield l;
    return;
  }
  let e = 0, A;
  for (; e < O; )
    A = e + h, yield l.slice(e, A), e = A;
}, Br = async function* (l, h, O) {
  for await (const e of l)
    yield* Tr(ArrayBuffer.isView(e) ? e : await O(String(e)), h);
}, lt = (l, h, O, e, A) => {
  const m = Br(l, h, A);
  let S = 0;
  return new ReadableStream({
    type: "bytes",
    async pull(j) {
      const { done: V, value: _ } = await m.next();
      if (V) {
        j.close(), e();
        return;
      }
      let U = _.byteLength;
      O && O(S += U), j.enqueue(new Uint8Array(_));
    },
    cancel(j) {
      return e(j), m.return();
    }
  }, {
    highWaterMark: 2
  });
}, ct = (l, h) => {
  const O = l != null;
  return (e) => setTimeout(() => h({
    lengthComputable: O,
    total: l,
    loaded: e
  }));
}, Be = typeof fetch == "function" && typeof Request == "function" && typeof Response == "function", Lt = Be && typeof ReadableStream == "function", De = Be && (typeof TextEncoder == "function" ? /* @__PURE__ */ ((l) => (h) => l.encode(h))(new TextEncoder()) : async (l) => new Uint8Array(await new Response(l).arrayBuffer())), Fr = Lt && (() => {
  let l = !1;
  const h = new Request(ae.origin, {
    body: new ReadableStream(),
    method: "POST",
    get duplex() {
      return l = !0, "half";
    }
  }).headers.has("Content-Type");
  return l && !h;
})(), dt = 64 * 1024, He = Lt && !!(() => {
  try {
    return g.isReadableStream(new Response("").body);
  } catch {
  }
})(), _e = {
  stream: He && ((l) => l.body)
};
Be && ((l) => {
  ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((h) => {
    !_e[h] && (_e[h] = g.isFunction(l[h]) ? (O) => O[h]() : (O, e) => {
      throw new w(`Response type '${h}' is not supported`, w.ERR_NOT_SUPPORT, e);
    });
  });
})(new Response());
const Cr = async (l) => {
  if (l == null)
    return 0;
  if (g.isBlob(l))
    return l.size;
  if (g.isSpecCompliantForm(l))
    return (await new Request(l).arrayBuffer()).byteLength;
  if (g.isArrayBufferView(l))
    return l.byteLength;
  if (g.isURLSearchParams(l) && (l = l + ""), g.isString(l))
    return (await De(l)).byteLength;
}, Ir = async (l, h) => {
  const O = g.toFiniteNumber(l.getContentLength());
  return O ?? Cr(h);
}, wr = Be && (async (l) => {
  let {
    url: h,
    method: O,
    data: e,
    signal: A,
    cancelToken: m,
    timeout: S,
    onDownloadProgress: j,
    onUploadProgress: V,
    responseType: _,
    headers: U,
    withCredentials: T = "same-origin",
    fetchOptions: N
  } = xt(l);
  _ = _ ? (_ + "").toLowerCase() : "text";
  let [q, B] = A || m || S ? Er([A, m], S) : [], M, W;
  const J = () => {
    !M && setTimeout(() => {
      q && q.unsubscribe();
    }), M = !0;
  };
  let se;
  try {
    if (V && Fr && O !== "get" && O !== "head" && (se = await Ir(U, e)) !== 0) {
      let ne = new Request(h, {
        method: "POST",
        body: e,
        duplex: "half"
      }), oe;
      g.isFormData(e) && (oe = ne.headers.get("content-type")) && U.setContentType(oe), ne.body && (e = lt(ne.body, dt, ct(
        se,
        Re(V)
      ), null, De));
    }
    g.isString(T) || (T = T ? "cors" : "omit"), W = new Request(h, {
      ...N,
      signal: q,
      method: O.toUpperCase(),
      headers: U.normalize().toJSON(),
      body: e,
      duplex: "half",
      withCredentials: T
    });
    let H = await fetch(W);
    const ue = He && (_ === "stream" || _ === "response");
    if (He && (j || ue)) {
      const ne = {};
      ["status", "statusText", "headers"].forEach((fe) => {
        ne[fe] = H[fe];
      });
      const oe = g.toFiniteNumber(H.headers.get("content-length"));
      H = new Response(
        lt(H.body, dt, j && ct(
          oe,
          Re(j, !0)
        ), ue && J, De),
        ne
      );
    }
    _ = _ || "text";
    let Ce = await _e[g.findKey(_e, _) || "text"](H, l);
    return !ue && J(), B && B(), await new Promise((ne, oe) => {
      wt(ne, oe, {
        data: Ce,
        headers: Z.from(H.headers),
        status: H.status,
        statusText: H.statusText,
        config: l,
        request: W
      });
    });
  } catch (H) {
    throw J(), H && H.name === "TypeError" && /fetch/i.test(H.message) ? Object.assign(
      new w("Network Error", w.ERR_NETWORK, l, W),
      {
        cause: H.cause || H
      }
    ) : w.from(H, H && H.code, l, W);
  }
}), Ne = {
  http: Xa,
  xhr: yr,
  fetch: wr
};
g.forEach(Ne, (l, h) => {
  if (l) {
    try {
      Object.defineProperty(l, "name", { value: h });
    } catch {
    }
    Object.defineProperty(l, "adapterName", { value: h });
  }
});
const ut = (l) => `- ${l}`, Mr = (l) => g.isFunction(l) || l === null || l === !1, qt = {
  getAdapter: (l) => {
    l = g.isArray(l) ? l : [l];
    const { length: h } = l;
    let O, e;
    const A = {};
    for (let m = 0; m < h; m++) {
      O = l[m];
      let S;
      if (e = O, !Mr(O) && (e = Ne[(S = String(O)).toLowerCase()], e === void 0))
        throw new w(`Unknown adapter '${S}'`);
      if (e)
        break;
      A[S || "#" + m] = e;
    }
    if (!e) {
      const m = Object.entries(A).map(
        ([j, V]) => `adapter ${j} ` + (V === !1 ? "is not supported by the environment" : "is not available in the build")
      );
      let S = h ? m.length > 1 ? `since :
` + m.map(ut).join(`
`) : " " + ut(m[0]) : "as no adapter specified";
      throw new w(
        "There is no suitable adapter to dispatch the request " + S,
        "ERR_NOT_SUPPORT"
      );
    }
    return e;
  },
  adapters: Ne
};
function xe(l) {
  if (l.cancelToken && l.cancelToken.throwIfRequested(), l.signal && l.signal.aborted)
    throw new Oe(null, l);
}
function ht(l) {
  return xe(l), l.headers = Z.from(l.headers), l.data = Me.call(
    l,
    l.transformRequest
  ), ["post", "put", "patch"].indexOf(l.method) !== -1 && l.headers.setContentType("application/x-www-form-urlencoded", !1), qt.getAdapter(l.adapter || ge.adapter)(l).then(function(e) {
    return xe(l), e.data = Me.call(
      l,
      l.transformResponse,
      e
    ), e.headers = Z.from(e.headers), e;
  }, function(e) {
    return It(e) || (xe(l), e && e.response && (e.response.data = Me.call(
      l,
      l.transformResponse,
      e.response
    ), e.response.headers = Z.from(e.response.headers))), Promise.reject(e);
  });
}
const Dt = "1.7.2", We = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((l, h) => {
  We[l] = function(e) {
    return typeof e === l || "a" + (h < 1 ? "n " : " ") + l;
  };
});
const pt = {};
We.transitional = function(h, O, e) {
  function A(m, S) {
    return "[Axios v" + Dt + "] Transitional option '" + m + "'" + S + (e ? ". " + e : "");
  }
  return (m, S, j) => {
    if (h === !1)
      throw new w(
        A(S, " has been removed" + (O ? " in " + O : "")),
        w.ERR_DEPRECATED
      );
    return O && !pt[S] && (pt[S] = !0, console.warn(
      A(
        S,
        " has been deprecated since v" + O + " and will be removed in the near future"
      )
    )), h ? h(m, S, j) : !0;
  };
};
function xr(l, h, O) {
  if (typeof l != "object")
    throw new w("options must be an object", w.ERR_BAD_OPTION_VALUE);
  const e = Object.keys(l);
  let A = e.length;
  for (; A-- > 0; ) {
    const m = e[A], S = h[m];
    if (S) {
      const j = l[m], V = j === void 0 || S(j, m, l);
      if (V !== !0)
        throw new w("option " + m + " must be " + V, w.ERR_BAD_OPTION_VALUE);
      continue;
    }
    if (O !== !0)
      throw new w("Unknown option " + m, w.ERR_BAD_OPTION);
  }
}
const Ge = {
  assertOptions: xr,
  validators: We
}, ce = Ge.validators;
let pe = class {
  constructor(h) {
    this.defaults = h, this.interceptors = {
      request: new nt(),
      response: new nt()
    };
  }
  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  async request(h, O) {
    try {
      return await this._request(h, O);
    } catch (e) {
      if (e instanceof Error) {
        let A;
        Error.captureStackTrace ? Error.captureStackTrace(A = {}) : A = new Error();
        const m = A.stack ? A.stack.replace(/^.+\n/, "") : "";
        try {
          e.stack ? m && !String(e.stack).endsWith(m.replace(/^.+\n.+\n/, "")) && (e.stack += `
` + m) : e.stack = m;
        } catch {
        }
      }
      throw e;
    }
  }
  _request(h, O) {
    typeof h == "string" ? (O = O || {}, O.url = h) : O = h || {}, O = ve(this.defaults, O);
    const { transitional: e, paramsSerializer: A, headers: m } = O;
    e !== void 0 && Ge.assertOptions(e, {
      silentJSONParsing: ce.transitional(ce.boolean),
      forcedJSONParsing: ce.transitional(ce.boolean),
      clarifyTimeoutError: ce.transitional(ce.boolean)
    }, !1), A != null && (g.isFunction(A) ? O.paramsSerializer = {
      serialize: A
    } : Ge.assertOptions(A, {
      encode: ce.function,
      serialize: ce.function
    }, !0)), O.method = (O.method || this.defaults.method || "get").toLowerCase();
    let S = m && g.merge(
      m.common,
      m[O.method]
    );
    m && g.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      (B) => {
        delete m[B];
      }
    ), O.headers = Z.concat(S, m);
    const j = [];
    let V = !0;
    this.interceptors.request.forEach(function(M) {
      typeof M.runWhen == "function" && M.runWhen(O) === !1 || (V = V && M.synchronous, j.unshift(M.fulfilled, M.rejected));
    });
    const _ = [];
    this.interceptors.response.forEach(function(M) {
      _.push(M.fulfilled, M.rejected);
    });
    let U, T = 0, N;
    if (!V) {
      const B = [ht.bind(this), void 0];
      for (B.unshift.apply(B, j), B.push.apply(B, _), N = B.length, U = Promise.resolve(O); T < N; )
        U = U.then(B[T++], B[T++]);
      return U;
    }
    N = j.length;
    let q = O;
    for (T = 0; T < N; ) {
      const B = j[T++], M = j[T++];
      try {
        q = B(q);
      } catch (W) {
        M.call(this, W);
        break;
      }
    }
    try {
      U = ht.call(this, q);
    } catch (B) {
      return Promise.reject(B);
    }
    for (T = 0, N = _.length; T < N; )
      U = U.then(_[T++], _[T++]);
    return U;
  }
  getUri(h) {
    h = ve(this.defaults, h);
    const O = Mt(h.baseURL, h.url);
    return Bt(O, h.params, h.paramsSerializer);
  }
};
g.forEach(["delete", "get", "head", "options"], function(h) {
  pe.prototype[h] = function(O, e) {
    return this.request(ve(e || {}, {
      method: h,
      url: O,
      data: (e || {}).data
    }));
  };
});
g.forEach(["post", "put", "patch"], function(h) {
  function O(e) {
    return function(m, S, j) {
      return this.request(ve(j || {}, {
        method: h,
        headers: e ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url: m,
        data: S
      }));
    };
  }
  pe.prototype[h] = O(), pe.prototype[h + "Form"] = O(!0);
});
let Lr = class Ht {
  constructor(h) {
    if (typeof h != "function")
      throw new TypeError("executor must be a function.");
    let O;
    this.promise = new Promise(function(m) {
      O = m;
    });
    const e = this;
    this.promise.then((A) => {
      if (!e._listeners) return;
      let m = e._listeners.length;
      for (; m-- > 0; )
        e._listeners[m](A);
      e._listeners = null;
    }), this.promise.then = (A) => {
      let m;
      const S = new Promise((j) => {
        e.subscribe(j), m = j;
      }).then(A);
      return S.cancel = function() {
        e.unsubscribe(m);
      }, S;
    }, h(function(m, S, j) {
      e.reason || (e.reason = new Oe(m, S, j), O(e.reason));
    });
  }
  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason)
      throw this.reason;
  }
  /**
   * Subscribe to the cancel signal
   */
  subscribe(h) {
    if (this.reason) {
      h(this.reason);
      return;
    }
    this._listeners ? this._listeners.push(h) : this._listeners = [h];
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(h) {
    if (!this._listeners)
      return;
    const O = this._listeners.indexOf(h);
    O !== -1 && this._listeners.splice(O, 1);
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let h;
    return {
      token: new Ht(function(A) {
        h = A;
      }),
      cancel: h
    };
  }
};
function qr(l) {
  return function(O) {
    return l.apply(null, O);
  };
}
function Dr(l) {
  return g.isObject(l) && l.isAxiosError === !0;
}
const ke = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511
};
Object.entries(ke).forEach(([l, h]) => {
  ke[h] = l;
});
function Nt(l) {
  const h = new pe(l), O = mt(pe.prototype.request, h);
  return g.extend(O, pe.prototype, h, { allOwnKeys: !0 }), g.extend(O, h, null, { allOwnKeys: !0 }), O.create = function(A) {
    return Nt(ve(l, A));
  }, O;
}
const Y = Nt(ge);
Y.Axios = pe;
Y.CanceledError = Oe;
Y.CancelToken = Lr;
Y.isCancel = It;
Y.VERSION = Dt;
Y.toFormData = Te;
Y.AxiosError = w;
Y.Cancel = Y.CanceledError;
Y.all = function(h) {
  return Promise.all(h);
};
Y.spread = qr;
Y.isAxiosError = Dr;
Y.mergeConfig = ve;
Y.AxiosHeaders = Z;
Y.formToJSON = (l) => Ct(g.isHTMLForm(l) ? new FormData(l) : l);
Y.getAdapter = qt.getAdapter;
Y.HttpStatusCode = ke;
Y.default = Y;
const {
  Axios: Hr,
  AxiosError: Nr,
  CanceledError: Gr,
  isCancel: kr,
  CancelToken: Qr,
  VERSION: Yr,
  all: $r,
  Cancel: zr,
  isAxiosError: Kr,
  spread: Wr,
  toFormData: Jr,
  AxiosHeaders: Xr,
  HttpStatusCode: Zr,
  formToJSON: en,
  getAdapter: tn,
  mergeConfig: sn
} = Y, an = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Axios: Hr,
  AxiosError: Nr,
  AxiosHeaders: Xr,
  Cancel: zr,
  CancelToken: Qr,
  CanceledError: Gr,
  HttpStatusCode: Zr,
  VERSION: Yr,
  all: $r,
  default: Y,
  formToJSON: en,
  getAdapter: tn,
  isAxiosError: Kr,
  isCancel: kr,
  mergeConfig: sn,
  spread: Wr,
  toFormData: Jr
}, Symbol.toStringTag, { value: "Module" })), Gt = /* @__PURE__ */ pa(an);
var Q = {}, Je = {};
(function(l) {
  Object.defineProperty(l, "__esModule", { value: !0 }), l.operationServerMap = l.RequiredError = l.BaseAPI = l.COLLECTION_FORMATS = l.BASE_PATH = void 0;
  const h = Gt;
  l.BASE_PATH = "http://undefinedundefined".replace(/\/+$/, ""), l.COLLECTION_FORMATS = {
    csv: ",",
    ssv: " ",
    tsv: "	",
    pipes: "|"
  };
  class O {
    constructor(m, S = l.BASE_PATH, j = h.default) {
      var V;
      this.basePath = S, this.axios = j, m && (this.configuration = m, this.basePath = (V = m.basePath) !== null && V !== void 0 ? V : S);
    }
  }
  l.BaseAPI = O;
  class e extends Error {
    constructor(m, S) {
      super(S), this.field = m, this.name = "RequiredError";
    }
  }
  l.RequiredError = e, l.operationServerMap = {};
})(Je);
var Xe = de && de.__awaiter || function(l, h, O, e) {
  function A(m) {
    return m instanceof O ? m : new O(function(S) {
      S(m);
    });
  }
  return new (O || (O = Promise))(function(m, S) {
    function j(U) {
      try {
        _(e.next(U));
      } catch (T) {
        S(T);
      }
    }
    function V(U) {
      try {
        _(e.throw(U));
      } catch (T) {
        S(T);
      }
    }
    function _(U) {
      U.done ? m(U.value) : A(U.value).then(j, V);
    }
    _((e = e.apply(l, h || [])).next());
  });
};
Object.defineProperty(Q, "__esModule", { value: !0 });
Q.createRequestFunction = Q.toPathString = Q.serializeDataIfNeeded = Q.setSearchParams = Q.setOAuthToObject = Q.setBearerAuthToObject = Q.setBasicAuthToObject = Q.setApiKeyToObject = Q.assertParamExists = Q.DUMMY_BASE_URL = void 0;
const rn = Je;
Q.DUMMY_BASE_URL = "https://example.com";
const nn = function(l, h, O) {
  if (O == null)
    throw new rn.RequiredError(h, `Required parameter ${h} was null or undefined when calling ${l}.`);
};
Q.assertParamExists = nn;
const on = function(l, h, O) {
  return Xe(this, void 0, void 0, function* () {
    if (O && O.apiKey) {
      const e = typeof O.apiKey == "function" ? yield O.apiKey(h) : yield O.apiKey;
      l[h] = e;
    }
  });
};
Q.setApiKeyToObject = on;
const ln = function(l, h) {
  h && (h.username || h.password) && (l.auth = { username: h.username, password: h.password });
};
Q.setBasicAuthToObject = ln;
const cn = function(l, h) {
  return Xe(this, void 0, void 0, function* () {
    if (h && h.accessToken) {
      const O = typeof h.accessToken == "function" ? yield h.accessToken() : yield h.accessToken;
      l.Authorization = "Bearer " + O;
    }
  });
};
Q.setBearerAuthToObject = cn;
const dn = function(l, h, O, e) {
  return Xe(this, void 0, void 0, function* () {
    if (e && e.accessToken) {
      const A = typeof e.accessToken == "function" ? yield e.accessToken(h, O) : yield e.accessToken;
      l.Authorization = "Bearer " + A;
    }
  });
};
Q.setOAuthToObject = dn;
function Qe(l, h, O = "") {
  h != null && (typeof h == "object" ? Array.isArray(h) ? h.forEach((e) => Qe(l, e, O)) : Object.keys(h).forEach((e) => Qe(l, h[e], `${O}${O !== "" ? "." : ""}${e}`)) : l.has(O) ? l.append(O, h) : l.set(O, h));
}
const un = function(l, ...h) {
  const O = new URLSearchParams(l.search);
  Qe(O, h), l.search = O.toString();
};
Q.setSearchParams = un;
const hn = function(l, h, O) {
  const e = typeof l != "string";
  return (e && O && O.isJsonMime ? O.isJsonMime(h.headers["Content-Type"]) : e) ? JSON.stringify(l !== void 0 ? l : {}) : l || "";
};
Q.serializeDataIfNeeded = hn;
const pn = function(l) {
  return l.pathname + l.search + l.hash;
};
Q.toPathString = pn;
const vn = function(l, h, O, e) {
  return (A = h, m = O) => {
    var S;
    const j = Object.assign(Object.assign({}, l.options), { url: (A.defaults.baseURL ? "" : (S = e == null ? void 0 : e.basePath) !== null && S !== void 0 ? S : m) + l.url });
    return A.request(j);
  };
};
Q.createRequestFunction = vn;
(function(l) {
  var h = de && de.__awaiter || function(r, c, o, i) {
    function t(a) {
      return a instanceof o ? a : new o(function(s) {
        s(a);
      });
    }
    return new (o || (o = Promise))(function(a, s) {
      function n(p) {
        try {
          d(i.next(p));
        } catch (v) {
          s(v);
        }
      }
      function u(p) {
        try {
          d(i.throw(p));
        } catch (v) {
          s(v);
        }
      }
      function d(p) {
        p.done ? a(p.value) : t(p.value).then(n, u);
      }
      d((i = i.apply(r, c || [])).next());
    });
  };
  Object.defineProperty(l, "__esModule", { value: !0 }), l.ProductCategoriesApiFactory = l.ProductCategoriesApiFp = l.ProductCategoriesApiAxiosParamCreator = l.PointofsaleApi = l.PointofsaleApiFactory = l.PointofsaleApiFp = l.PointofsaleApiAxiosParamCreator = l.PayoutRequestsApi = l.PayoutRequestsApiFactory = l.PayoutRequestsApiFp = l.PayoutRequestsApiAxiosParamCreator = l.GetAllInvoicesCurrentStateEnum = l.InvoicesApi = l.InvoicesApiFactory = l.InvoicesApiFp = l.InvoicesApiAxiosParamCreator = l.FilesApi = l.FilesApiFactory = l.FilesApiFp = l.FilesApiAxiosParamCreator = l.EventsApi = l.EventsApiFactory = l.EventsApiFp = l.EventsApiAxiosParamCreator = l.DebtorsApi = l.DebtorsApiFactory = l.DebtorsApiFp = l.DebtorsApiAxiosParamCreator = l.ContainersApi = l.ContainersApiFactory = l.ContainersApiFp = l.ContainersApiAxiosParamCreator = l.BannersApi = l.BannersApiFactory = l.BannersApiFp = l.BannersApiAxiosParamCreator = l.GetAllBalanceOrderDirectionEnum = l.GetAllBalanceUserTypesEnum = l.BalanceApi = l.BalanceApiFactory = l.BalanceApiFp = l.BalanceApiAxiosParamCreator = l.AuthenticateApi = l.AuthenticateApiFactory = l.AuthenticateApiFp = l.AuthenticateApiAxiosParamCreator = l.UpdateInvoiceRequestStateEnum = l.PayoutRequestStatusRequestStateEnum = l.InvoiceStatusResponseStateEnum = l.FinancialMutationResponseTypeEnum = void 0, l.VouchergroupsApi = l.VouchergroupsApiFactory = l.VouchergroupsApiFp = l.VouchergroupsApiAxiosParamCreator = l.VatGroupsApi = l.VatGroupsApiFactory = l.VatGroupsApiFp = l.VatGroupsApiAxiosParamCreator = l.GetAllUsersTypeEnum = l.UsersApi = l.UsersApiFactory = l.UsersApiFp = l.UsersApiAxiosParamCreator = l.TransfersApi = l.TransfersApiFactory = l.TransfersApiFp = l.TransfersApiAxiosParamCreator = l.TransactionsApi = l.TransactionsApiFactory = l.TransactionsApiFp = l.TransactionsApiAxiosParamCreator = l.TestOperationsOfTheTestControllerApi = l.TestOperationsOfTheTestControllerApiFactory = l.TestOperationsOfTheTestControllerApiFp = l.TestOperationsOfTheTestControllerApiAxiosParamCreator = l.StripeApi = l.StripeApiFactory = l.StripeApiFp = l.StripeApiAxiosParamCreator = l.RootApi = l.RootApiFactory = l.RootApiFp = l.RootApiAxiosParamCreator = l.RbacApi = l.RbacApiFactory = l.RbacApiFp = l.RbacApiAxiosParamCreator = l.ProductsApi = l.ProductsApiFactory = l.ProductsApiFp = l.ProductsApiAxiosParamCreator = l.ProductCategoriesApi = void 0;
  const O = Gt, e = Q, A = Je;
  l.FinancialMutationResponseTypeEnum = {
    Transfer: "transfer",
    Transaction: "transaction"
  }, l.InvoiceStatusResponseStateEnum = {
    Created: "CREATED",
    Sent: "SENT",
    Paid: "PAID",
    Deleted: "DELETED"
  }, l.PayoutRequestStatusRequestStateEnum = {
    Created: "CREATED",
    Approved: "APPROVED",
    Denied: "DENIED",
    Cancelled: "CANCELLED"
  }, l.UpdateInvoiceRequestStateEnum = {
    Created: "CREATED",
    Sent: "SENT",
    Paid: "PAID",
    Deleted: "DELETED"
  };
  const m = function(r) {
    return {
      /**
       *
       * @summary EAN login and hand out token
       * @param {AuthenticationEanRequest} authenticationEanRequest The EAN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      eanAuthentication: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("eanAuthentication", "authenticationEanRequest", i);
        const a = "/authentication/ean", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisLDAPAuthentication: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("gewisLDAPAuthentication", "authenticationLDAPRequest", i);
        const a = "/authentication/GEWIS/LDAP", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary PIN login and hand out token.
       * @param {GEWISAuthenticationPinRequest} gEWISAuthenticationPinRequest The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisPinAuthentication: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("gewisPinAuthentication", "gEWISAuthenticationPinRequest", i);
        const a = "/authentication/GEWIS/pin", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
       * @param {GewiswebAuthenticationRequest} gewiswebAuthenticationRequest The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisWebAuthentication: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("gewisWebAuthentication", "gewiswebAuthenticationRequest", i);
        const a = "/authentication/gewisweb", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Key login and hand out token.
       * @param {AuthenticationKeyRequest} authenticationKeyRequest The key login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      keyAuthentication: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("keyAuthentication", "authenticationKeyRequest", i);
        const a = "/authentication/key", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary LDAP login and hand out token If user has never signed in before this also creates an account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ldapAuthentication: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("ldapAuthentication", "authenticationLDAPRequest", i);
        const a = "/authentication/LDAP", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Local login and hand out token
       * @param {AuthenticationLocalRequest} authenticationLocalRequest The local login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      localAuthentication: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("localAuthentication", "authenticationLocalRequest", i);
        const a = "/authentication/local", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Mock login and hand out token.
       * @param {AuthenticationMockRequest} authenticationMockRequest The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      mockAuthentication: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("mockAuthentication", "authenticationMockRequest", i);
        const a = "/authentication/mock", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary NFC login and hand out token
       * @param {AuthenticationNfcRequest} authenticationNfcRequest The NFC login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      nfcAuthentication: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("nfcAuthentication", "authenticationNfcRequest", i);
        const a = "/authentication/nfc", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary PIN login and hand out token
       * @param {AuthenticationPinRequest} authenticationPinRequest The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      pinAuthentication: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("pinAuthentication", "authenticationPinRequest", i);
        const a = "/authentication/pin", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get a new JWT token, lesser if the existing token is also lesser
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      refreshToken: (...c) => h(this, [...c], void 0, function* (o = {}) {
        const i = "/authentication/refreshToken", t = new URL(i, e.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const s = Object.assign(Object.assign({ method: "GET" }, a), o), n = {}, u = {};
        yield (0, e.setBearerAuthToObject)(n, r), (0, e.setSearchParams)(t, u);
        let d = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, n), d), o.headers), {
          url: (0, e.toPathString)(t),
          options: s
        };
      }),
      /**
       *
       * @summary Creates a reset token for the local authentication
       * @param {ResetLocalRequest} resetLocalRequest The reset info.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocal: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("resetLocal", "resetLocalRequest", i);
        const a = "/authentication/local/reset", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Reset local authentication using the provided token
       * @param {AuthenticationResetTokenRequest} authenticationResetTokenRequest The reset token.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocalWithToken: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("resetLocalWithToken", "authenticationResetTokenRequest", i);
        const a = "/authentication/local", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "PUT" }, n), t), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      })
    };
  };
  l.AuthenticateApiAxiosParamCreator = m;
  const S = function(r) {
    const c = (0, l.AuthenticateApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary EAN login and hand out token
       * @param {AuthenticationEanRequest} authenticationEanRequest The EAN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      eanAuthentication(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.eanAuthentication(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["AuthenticateApi.eanAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisLDAPAuthentication(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.gewisLDAPAuthentication(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["AuthenticateApi.gewisLDAPAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary PIN login and hand out token.
       * @param {GEWISAuthenticationPinRequest} gEWISAuthenticationPinRequest The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisPinAuthentication(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.gewisPinAuthentication(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["AuthenticateApi.gewisPinAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
       * @param {GewiswebAuthenticationRequest} gewiswebAuthenticationRequest The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisWebAuthentication(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.gewisWebAuthentication(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["AuthenticateApi.gewisWebAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Key login and hand out token.
       * @param {AuthenticationKeyRequest} authenticationKeyRequest The key login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      keyAuthentication(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.keyAuthentication(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["AuthenticateApi.keyAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary LDAP login and hand out token If user has never signed in before this also creates an account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ldapAuthentication(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.ldapAuthentication(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["AuthenticateApi.ldapAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Local login and hand out token
       * @param {AuthenticationLocalRequest} authenticationLocalRequest The local login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      localAuthentication(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.localAuthentication(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["AuthenticateApi.localAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Mock login and hand out token.
       * @param {AuthenticationMockRequest} authenticationMockRequest The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      mockAuthentication(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.mockAuthentication(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["AuthenticateApi.mockAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary NFC login and hand out token
       * @param {AuthenticationNfcRequest} authenticationNfcRequest The NFC login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      nfcAuthentication(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.nfcAuthentication(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["AuthenticateApi.nfcAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary PIN login and hand out token
       * @param {AuthenticationPinRequest} authenticationPinRequest The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      pinAuthentication(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.pinAuthentication(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["AuthenticateApi.pinAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Get a new JWT token, lesser if the existing token is also lesser
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      refreshToken(o) {
        return h(this, void 0, void 0, function* () {
          var i, t, a;
          const s = yield c.refreshToken(o), n = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (a = (t = A.operationServerMap["AuthenticateApi.refreshToken"]) === null || t === void 0 ? void 0 : t[n]) === null || a === void 0 ? void 0 : a.url;
          return (d, p) => (0, e.createRequestFunction)(s, O.default, A.BASE_PATH, r)(d, u || p);
        });
      },
      /**
       *
       * @summary Creates a reset token for the local authentication
       * @param {ResetLocalRequest} resetLocalRequest The reset info.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocal(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.resetLocal(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["AuthenticateApi.resetLocal"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Reset local authentication using the provided token
       * @param {AuthenticationResetTokenRequest} authenticationResetTokenRequest The reset token.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocalWithToken(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.resetLocalWithToken(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["AuthenticateApi.resetLocalWithToken"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      }
    };
  };
  l.AuthenticateApiFp = S;
  const j = function(r, c, o) {
    const i = (0, l.AuthenticateApiFp)(r);
    return {
      /**
       *
       * @summary EAN login and hand out token
       * @param {AuthenticationEanRequest} authenticationEanRequest The EAN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      eanAuthentication(t, a) {
        return i.eanAuthentication(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisLDAPAuthentication(t, a) {
        return i.gewisLDAPAuthentication(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary PIN login and hand out token.
       * @param {GEWISAuthenticationPinRequest} gEWISAuthenticationPinRequest The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisPinAuthentication(t, a) {
        return i.gewisPinAuthentication(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
       * @param {GewiswebAuthenticationRequest} gewiswebAuthenticationRequest The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisWebAuthentication(t, a) {
        return i.gewisWebAuthentication(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Key login and hand out token.
       * @param {AuthenticationKeyRequest} authenticationKeyRequest The key login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      keyAuthentication(t, a) {
        return i.keyAuthentication(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary LDAP login and hand out token If user has never signed in before this also creates an account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ldapAuthentication(t, a) {
        return i.ldapAuthentication(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Local login and hand out token
       * @param {AuthenticationLocalRequest} authenticationLocalRequest The local login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      localAuthentication(t, a) {
        return i.localAuthentication(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Mock login and hand out token.
       * @param {AuthenticationMockRequest} authenticationMockRequest The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      mockAuthentication(t, a) {
        return i.mockAuthentication(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary NFC login and hand out token
       * @param {AuthenticationNfcRequest} authenticationNfcRequest The NFC login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      nfcAuthentication(t, a) {
        return i.nfcAuthentication(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary PIN login and hand out token
       * @param {AuthenticationPinRequest} authenticationPinRequest The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      pinAuthentication(t, a) {
        return i.pinAuthentication(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Get a new JWT token, lesser if the existing token is also lesser
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      refreshToken(t) {
        return i.refreshToken(t).then((a) => a(o, c));
      },
      /**
       *
       * @summary Creates a reset token for the local authentication
       * @param {ResetLocalRequest} resetLocalRequest The reset info.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocal(t, a) {
        return i.resetLocal(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Reset local authentication using the provided token
       * @param {AuthenticationResetTokenRequest} authenticationResetTokenRequest The reset token.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocalWithToken(t, a) {
        return i.resetLocalWithToken(t, a).then((s) => s(o, c));
      }
    };
  };
  l.AuthenticateApiFactory = j;
  class V extends A.BaseAPI {
    /**
     *
     * @summary EAN login and hand out token
     * @param {AuthenticationEanRequest} authenticationEanRequest The EAN login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    eanAuthentication(c, o) {
      return (0, l.AuthenticateApiFp)(this.configuration).eanAuthentication(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
     * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    gewisLDAPAuthentication(c, o) {
      return (0, l.AuthenticateApiFp)(this.configuration).gewisLDAPAuthentication(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary PIN login and hand out token.
     * @param {GEWISAuthenticationPinRequest} gEWISAuthenticationPinRequest The PIN login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    gewisPinAuthentication(c, o) {
      return (0, l.AuthenticateApiFp)(this.configuration).gewisPinAuthentication(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
     * @param {GewiswebAuthenticationRequest} gewiswebAuthenticationRequest The mock login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    gewisWebAuthentication(c, o) {
      return (0, l.AuthenticateApiFp)(this.configuration).gewisWebAuthentication(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Key login and hand out token.
     * @param {AuthenticationKeyRequest} authenticationKeyRequest The key login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    keyAuthentication(c, o) {
      return (0, l.AuthenticateApiFp)(this.configuration).keyAuthentication(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary LDAP login and hand out token If user has never signed in before this also creates an account.
     * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    ldapAuthentication(c, o) {
      return (0, l.AuthenticateApiFp)(this.configuration).ldapAuthentication(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Local login and hand out token
     * @param {AuthenticationLocalRequest} authenticationLocalRequest The local login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    localAuthentication(c, o) {
      return (0, l.AuthenticateApiFp)(this.configuration).localAuthentication(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Mock login and hand out token.
     * @param {AuthenticationMockRequest} authenticationMockRequest The mock login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    mockAuthentication(c, o) {
      return (0, l.AuthenticateApiFp)(this.configuration).mockAuthentication(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary NFC login and hand out token
     * @param {AuthenticationNfcRequest} authenticationNfcRequest The NFC login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    nfcAuthentication(c, o) {
      return (0, l.AuthenticateApiFp)(this.configuration).nfcAuthentication(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary PIN login and hand out token
     * @param {AuthenticationPinRequest} authenticationPinRequest The PIN login.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    pinAuthentication(c, o) {
      return (0, l.AuthenticateApiFp)(this.configuration).pinAuthentication(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a new JWT token, lesser if the existing token is also lesser
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    refreshToken(c) {
      return (0, l.AuthenticateApiFp)(this.configuration).refreshToken(c).then((o) => o(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates a reset token for the local authentication
     * @param {ResetLocalRequest} resetLocalRequest The reset info.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    resetLocal(c, o) {
      return (0, l.AuthenticateApiFp)(this.configuration).resetLocal(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Reset local authentication using the provided token
     * @param {AuthenticationResetTokenRequest} authenticationResetTokenRequest The reset token.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    resetLocalWithToken(c, o) {
      return (0, l.AuthenticateApiFp)(this.configuration).resetLocalWithToken(c, o).then((i) => i(this.axios, this.basePath));
    }
  }
  l.AuthenticateApi = V;
  const _ = function(r) {
    return {
      /**
       *
       * @summary Get balance of the current user
       * @param {string} [date] Timestamp to get balances for
       * @param {number} [minBalance] Minimum balance
       * @param {number} [maxBalance] Maximum balance
       * @param {boolean} [hasFine] Only users with(out) fines
       * @param {number} [minFine] Minimum fine
       * @param {number} [maxFine] Maximum fine
       * @param {GetAllBalanceUserTypesEnum} [userTypes] Filter based on user type.
       * @param {string} [orderBy] Column to order balance by - eg: id,amount
       * @param {GetAllBalanceOrderDirectionEnum} [orderDirection] Order direction
       * @param {boolean} [allowDeleted] Whether to include deleted users
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBalance: (c, o, i, t, a, s, n, u, d, p, v, P, ...b) => h(this, [c, o, i, t, a, s, n, u, d, p, v, P, ...b], void 0, function* (f, R, y, E, I, C, F, L, x, X, G, z, le = {}) {
        const he = "/balances/all", D = new URL(he, e.DUMMY_BASE_URL);
        let ie;
        r && (ie = r.baseOptions);
        const Ze = Object.assign(Object.assign({ method: "GET" }, ie), le), et = {}, ee = {};
        yield (0, e.setBearerAuthToObject)(et, r), f !== void 0 && (ee.date = f), R !== void 0 && (ee.minBalance = R), y !== void 0 && (ee.maxBalance = y), E !== void 0 && (ee.hasFine = E), I !== void 0 && (ee.minFine = I), C !== void 0 && (ee.maxFine = C), F && (ee.userTypes = F), L !== void 0 && (ee.orderBy = L), x !== void 0 && (ee.orderDirection = x), X !== void 0 && (ee.allowDeleted = X), G !== void 0 && (ee.take = G), z !== void 0 && (ee.skip = z), (0, e.setSearchParams)(D, ee);
        let ea = ie && ie.headers ? ie.headers : {};
        return Ze.headers = Object.assign(Object.assign(Object.assign({}, et), ea), le.headers), {
          url: (0, e.toPathString)(D),
          options: Ze
        };
      }),
      /**
       *
       * @summary Retrieves the requested balance
       * @param {number} id The id of the user for which the saldo is requested
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalanceId: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getBalanceId", "id", i);
        const a = "/balances/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get balance of the current user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalances: (...c) => h(this, [...c], void 0, function* (o = {}) {
        const i = "/balances", t = new URL(i, e.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const s = Object.assign(Object.assign({ method: "GET" }, a), o), n = {}, u = {};
        yield (0, e.setBearerAuthToObject)(n, r), (0, e.setSearchParams)(t, u);
        let d = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, n), d), o.headers), {
          url: (0, e.toPathString)(t),
          options: s
        };
      })
    };
  };
  l.BalanceApiAxiosParamCreator = _;
  const U = function(r) {
    const c = (0, l.BalanceApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Get balance of the current user
       * @param {string} [date] Timestamp to get balances for
       * @param {number} [minBalance] Minimum balance
       * @param {number} [maxBalance] Maximum balance
       * @param {boolean} [hasFine] Only users with(out) fines
       * @param {number} [minFine] Minimum fine
       * @param {number} [maxFine] Maximum fine
       * @param {GetAllBalanceUserTypesEnum} [userTypes] Filter based on user type.
       * @param {string} [orderBy] Column to order balance by - eg: id,amount
       * @param {GetAllBalanceOrderDirectionEnum} [orderDirection] Order direction
       * @param {boolean} [allowDeleted] Whether to include deleted users
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBalance(o, i, t, a, s, n, u, d, p, v, P, b, f) {
        return h(this, void 0, void 0, function* () {
          var R, y, E;
          const I = yield c.getAllBalance(o, i, t, a, s, n, u, d, p, v, P, b, f), C = (R = r == null ? void 0 : r.serverIndex) !== null && R !== void 0 ? R : 0, F = (E = (y = A.operationServerMap["BalanceApi.getAllBalance"]) === null || y === void 0 ? void 0 : y[C]) === null || E === void 0 ? void 0 : E.url;
          return (L, x) => (0, e.createRequestFunction)(I, O.default, A.BASE_PATH, r)(L, F || x);
        });
      },
      /**
       *
       * @summary Retrieves the requested balance
       * @param {number} id The id of the user for which the saldo is requested
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalanceId(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getBalanceId(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["BalanceApi.getBalanceId"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Get balance of the current user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalances(o) {
        return h(this, void 0, void 0, function* () {
          var i, t, a;
          const s = yield c.getBalances(o), n = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (a = (t = A.operationServerMap["BalanceApi.getBalances"]) === null || t === void 0 ? void 0 : t[n]) === null || a === void 0 ? void 0 : a.url;
          return (d, p) => (0, e.createRequestFunction)(s, O.default, A.BASE_PATH, r)(d, u || p);
        });
      }
    };
  };
  l.BalanceApiFp = U;
  const T = function(r, c, o) {
    const i = (0, l.BalanceApiFp)(r);
    return {
      /**
       *
       * @summary Get balance of the current user
       * @param {string} [date] Timestamp to get balances for
       * @param {number} [minBalance] Minimum balance
       * @param {number} [maxBalance] Maximum balance
       * @param {boolean} [hasFine] Only users with(out) fines
       * @param {number} [minFine] Minimum fine
       * @param {number} [maxFine] Maximum fine
       * @param {GetAllBalanceUserTypesEnum} [userTypes] Filter based on user type.
       * @param {string} [orderBy] Column to order balance by - eg: id,amount
       * @param {GetAllBalanceOrderDirectionEnum} [orderDirection] Order direction
       * @param {boolean} [allowDeleted] Whether to include deleted users
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBalance(t, a, s, n, u, d, p, v, P, b, f, R, y) {
        return i.getAllBalance(t, a, s, n, u, d, p, v, P, b, f, R, y).then((E) => E(o, c));
      },
      /**
       *
       * @summary Retrieves the requested balance
       * @param {number} id The id of the user for which the saldo is requested
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalanceId(t, a) {
        return i.getBalanceId(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Get balance of the current user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalances(t) {
        return i.getBalances(t).then((a) => a(o, c));
      }
    };
  };
  l.BalanceApiFactory = T;
  class N extends A.BaseAPI {
    /**
     *
     * @summary Get balance of the current user
     * @param {string} [date] Timestamp to get balances for
     * @param {number} [minBalance] Minimum balance
     * @param {number} [maxBalance] Maximum balance
     * @param {boolean} [hasFine] Only users with(out) fines
     * @param {number} [minFine] Minimum fine
     * @param {number} [maxFine] Maximum fine
     * @param {GetAllBalanceUserTypesEnum} [userTypes] Filter based on user type.
     * @param {string} [orderBy] Column to order balance by - eg: id,amount
     * @param {GetAllBalanceOrderDirectionEnum} [orderDirection] Order direction
     * @param {boolean} [allowDeleted] Whether to include deleted users
     * @param {number} [take] How many transactions the endpoint should return
     * @param {number} [skip] How many transactions should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BalanceApi
     */
    getAllBalance(c, o, i, t, a, s, n, u, d, p, v, P, b) {
      return (0, l.BalanceApiFp)(this.configuration).getAllBalance(c, o, i, t, a, s, n, u, d, p, v, P, b).then((f) => f(this.axios, this.basePath));
    }
    /**
     *
     * @summary Retrieves the requested balance
     * @param {number} id The id of the user for which the saldo is requested
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BalanceApi
     */
    getBalanceId(c, o) {
      return (0, l.BalanceApiFp)(this.configuration).getBalanceId(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get balance of the current user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BalanceApi
     */
    getBalances(c) {
      return (0, l.BalanceApiFp)(this.configuration).getBalances(c).then((o) => o(this.axios, this.basePath));
    }
  }
  l.BalanceApi = N, l.GetAllBalanceUserTypesEnum = {}, l.GetAllBalanceOrderDirectionEnum = {
    Asc: "ASC",
    Desc: "DESC"
  };
  const q = function(r) {
    return {
      /**
       *
       * @summary Deletes the requested banner
       * @param {number} id The id of the banner which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      _delete: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("_delete", "id", i);
        const a = "/banners/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Saves a banner to the database
       * @param {BannerRequest} bannerRequest The banner which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      create: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("create", "bannerRequest", i);
        const a = "/banners", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns all active banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getActive: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        const n = "/banners/active", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBanners: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        const n = "/banners", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllOpenBanners: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        const n = "/open/banners", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Returns the requested banner
       * @param {number} id The id of the banner which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBanner: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getBanner", "id", i);
        const a = "/banners/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Updates the requested banner
       * @param {number} id The id of the banner which should be updated
       * @param {BannerRequest} bannerRequest The updated banner
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      update: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("update", "id", t), (0, e.assertParamExists)("update", "bannerRequest", a);
        const n = "/banners/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Uploads a banner image to the given banner
       * @param {number} id The id of the banner
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateImage: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateImage", "id", t);
        const n = "/banners/{id}/image".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "POST" }, d), s), v = {}, P = {}, b = new (r && r.formDataCtor || FormData)();
        yield (0, e.setBearerAuthToObject)(v, r), a !== void 0 && b.append("file", a), v["Content-Type"] = "multipart/form-data", (0, e.setSearchParams)(u, P);
        let f = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), f), s.headers), p.data = b, {
          url: (0, e.toPathString)(u),
          options: p
        };
      })
    };
  };
  l.BannersApiAxiosParamCreator = q;
  const B = function(r) {
    const c = (0, l.BannersApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Deletes the requested banner
       * @param {number} id The id of the banner which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      _delete(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c._delete(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["BannersApi._delete"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Saves a banner to the database
       * @param {BannerRequest} bannerRequest The banner which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      create(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.create(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["BannersApi.create"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Returns all active banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getActive(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getActive(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["BannersApi.getActive"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBanners(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllBanners(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["BannersApi.getAllBanners"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllOpenBanners(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllOpenBanners(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["BannersApi.getAllOpenBanners"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Returns the requested banner
       * @param {number} id The id of the banner which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBanner(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getBanner(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["BannersApi.getBanner"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Updates the requested banner
       * @param {number} id The id of the banner which should be updated
       * @param {BannerRequest} bannerRequest The updated banner
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      update(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.update(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["BannersApi.update"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Uploads a banner image to the given banner
       * @param {number} id The id of the banner
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateImage(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateImage(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["BannersApi.updateImage"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      }
    };
  };
  l.BannersApiFp = B;
  const M = function(r, c, o) {
    const i = (0, l.BannersApiFp)(r);
    return {
      /**
       *
       * @summary Deletes the requested banner
       * @param {number} id The id of the banner which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      _delete(t, a) {
        return i._delete(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Saves a banner to the database
       * @param {BannerRequest} bannerRequest The banner which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      create(t, a) {
        return i.create(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Returns all active banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getActive(t, a, s) {
        return i.getActive(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBanners(t, a, s) {
        return i.getAllBanners(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllOpenBanners(t, a, s) {
        return i.getAllOpenBanners(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Returns the requested banner
       * @param {number} id The id of the banner which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBanner(t, a) {
        return i.getBanner(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Updates the requested banner
       * @param {number} id The id of the banner which should be updated
       * @param {BannerRequest} bannerRequest The updated banner
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      update(t, a, s) {
        return i.update(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Uploads a banner image to the given banner
       * @param {number} id The id of the banner
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateImage(t, a, s) {
        return i.updateImage(t, a, s).then((n) => n(o, c));
      }
    };
  };
  l.BannersApiFactory = M;
  class W extends A.BaseAPI {
    /**
     *
     * @summary Deletes the requested banner
     * @param {number} id The id of the banner which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    _delete(c, o) {
      return (0, l.BannersApiFp)(this.configuration)._delete(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Saves a banner to the database
     * @param {BannerRequest} bannerRequest The banner which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    create(c, o) {
      return (0, l.BannersApiFp)(this.configuration).create(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all active banners
     * @param {number} [take] How many banners the endpoint should return
     * @param {number} [skip] How many banners should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    getActive(c, o, i) {
      return (0, l.BannersApiFp)(this.configuration).getActive(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all existing banners
     * @param {number} [take] How many banners the endpoint should return
     * @param {number} [skip] How many banners should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    getAllBanners(c, o, i) {
      return (0, l.BannersApiFp)(this.configuration).getAllBanners(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all existing banners
     * @param {number} [take] How many banners the endpoint should return
     * @param {number} [skip] How many banners should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    getAllOpenBanners(c, o, i) {
      return (0, l.BannersApiFp)(this.configuration).getAllOpenBanners(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested banner
     * @param {number} id The id of the banner which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    getBanner(c, o) {
      return (0, l.BannersApiFp)(this.configuration).getBanner(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Updates the requested banner
     * @param {number} id The id of the banner which should be updated
     * @param {BannerRequest} bannerRequest The updated banner
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    update(c, o, i) {
      return (0, l.BannersApiFp)(this.configuration).update(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Uploads a banner image to the given banner
     * @param {number} id The id of the banner
     * @param {File} [file] file
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof BannersApi
     */
    updateImage(c, o, i) {
      return (0, l.BannersApiFp)(this.configuration).updateImage(c, o, i).then((t) => t(this.axios, this.basePath));
    }
  }
  l.BannersApi = W;
  const J = function(r) {
    return {
      /**
       *
       * @summary Create a new container.
       * @param {CreateContainerRequest} createContainerRequest    The container which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createContainer: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createContainer", "createContainerRequest", i);
        const a = "/containers", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary (Soft) delete the given container. Cannot be undone.
       * @param {number} id The id of the container which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteContainer: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteContainer", "id", i);
        const a = "/containers/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns all existing containers
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllContainers: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        const n = "/containers", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Returns all the products in the container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getProductsContainer: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getProductsContainer", "id", i);
        const a = "/containers/{id}/products".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns all public container
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getPublicContainers: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        const n = "/containers/public", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Returns the requested container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleContainer: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSingleContainer", "id", i);
        const a = "/containers/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Update an existing container.
       * @param {number} id The id of the container which should be updated
       * @param {UpdateContainerRequest} updateContainerRequest    The container which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateContainer: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateContainer", "id", t), (0, e.assertParamExists)("updateContainer", "updateContainerRequest", a);
        const n = "/containers/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      })
    };
  };
  l.ContainersApiAxiosParamCreator = J;
  const se = function(r) {
    const c = (0, l.ContainersApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Create a new container.
       * @param {CreateContainerRequest} createContainerRequest    The container which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createContainer(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createContainer(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["ContainersApi.createContainer"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary (Soft) delete the given container. Cannot be undone.
       * @param {number} id The id of the container which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteContainer(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.deleteContainer(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["ContainersApi.deleteContainer"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Returns all existing containers
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllContainers(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllContainers(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["ContainersApi.getAllContainers"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Returns all the products in the container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getProductsContainer(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getProductsContainer(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["ContainersApi.getProductsContainer"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Returns all public container
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getPublicContainers(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getPublicContainers(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["ContainersApi.getPublicContainers"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Returns the requested container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleContainer(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getSingleContainer(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["ContainersApi.getSingleContainer"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Update an existing container.
       * @param {number} id The id of the container which should be updated
       * @param {UpdateContainerRequest} updateContainerRequest    The container which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateContainer(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateContainer(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["ContainersApi.updateContainer"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      }
    };
  };
  l.ContainersApiFp = se;
  const H = function(r, c, o) {
    const i = (0, l.ContainersApiFp)(r);
    return {
      /**
       *
       * @summary Create a new container.
       * @param {CreateContainerRequest} createContainerRequest    The container which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createContainer(t, a) {
        return i.createContainer(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary (Soft) delete the given container. Cannot be undone.
       * @param {number} id The id of the container which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteContainer(t, a) {
        return i.deleteContainer(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Returns all existing containers
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllContainers(t, a, s) {
        return i.getAllContainers(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Returns all the products in the container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getProductsContainer(t, a) {
        return i.getProductsContainer(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Returns all public container
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getPublicContainers(t, a, s) {
        return i.getPublicContainers(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Returns the requested container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleContainer(t, a) {
        return i.getSingleContainer(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Update an existing container.
       * @param {number} id The id of the container which should be updated
       * @param {UpdateContainerRequest} updateContainerRequest    The container which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateContainer(t, a, s) {
        return i.updateContainer(t, a, s).then((n) => n(o, c));
      }
    };
  };
  l.ContainersApiFactory = H;
  class ue extends A.BaseAPI {
    /**
     *
     * @summary Create a new container.
     * @param {CreateContainerRequest} createContainerRequest    The container which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    createContainer(c, o) {
      return (0, l.ContainersApiFp)(this.configuration).createContainer(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary (Soft) delete the given container. Cannot be undone.
     * @param {number} id The id of the container which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    deleteContainer(c, o) {
      return (0, l.ContainersApiFp)(this.configuration).deleteContainer(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all existing containers
     * @param {number} [take] How many containers the endpoint should return
     * @param {number} [skip] How many containers should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getAllContainers(c, o, i) {
      return (0, l.ContainersApiFp)(this.configuration).getAllContainers(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all the products in the container
     * @param {number} id The id of the container which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getProductsContainer(c, o) {
      return (0, l.ContainersApiFp)(this.configuration).getProductsContainer(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all public container
     * @param {number} [take] How many containers the endpoint should return
     * @param {number} [skip] How many containers should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getPublicContainers(c, o, i) {
      return (0, l.ContainersApiFp)(this.configuration).getPublicContainers(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested container
     * @param {number} id The id of the container which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    getSingleContainer(c, o) {
      return (0, l.ContainersApiFp)(this.configuration).getSingleContainer(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Update an existing container.
     * @param {number} id The id of the container which should be updated
     * @param {UpdateContainerRequest} updateContainerRequest    The container which should be updated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ContainersApi
     */
    updateContainer(c, o, i) {
      return (0, l.ContainersApiFp)(this.configuration).updateContainer(c, o, i).then((t) => t(this.axios, this.basePath));
    }
  }
  l.ContainersApi = ue;
  const Ce = function(r) {
    return {
      /**
       *
       * @summary Return all users that had at most -5 euros balance both now and on the reference date.    For all these users, also return their fine based on the reference date.
       * @param {Array<string>} referenceDates Dates to base the fines on. Every returned user has at    least five euros debt on every reference date. The height of the fine is based on the first date in the array.
       * @param {Array<number>} [userTypes] List of all user types fines should be calculated for 1 (MEMBER), 2 (ORGAN), 3 (VOUCHER), 4 (LOCAL_USER), 5 (LOCAL_ADMIN), 6 (INVOICE), 7 (AUTOMATIC_INVOICE).
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      calculateFines: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("calculateFines", "referenceDates", t);
        const n = "/fines/eligible", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), a && (P.userTypes = a), t && (P.referenceDates = t), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Delete a fine
       * @param {number} id The id of the fine which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFine: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteFine", "id", i);
        const a = "/fines/single/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get a report of all fines
       * @param {string} [fromDate] The start date of the report, inclusive
       * @param {string} [toDate] The end date of the report, exclusive
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFineReport: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        const n = "/fines/report", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), t !== void 0 && (P.fromDate = t), a !== void 0 && (P.toDate = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Get a report of all fines in pdf format
       * @param {string} [fromDate] The start date of the report, inclusive
       * @param {string} [toDate] The end date of the report, exclusive
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFineReportPdf: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        const n = "/fines/report/pdf", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), t !== void 0 && (P.fromDate = t), a !== void 0 && (P.toDate = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Handout fines to all given users. Fines will be handed out \"now\" to prevent rewriting history.
       * @param {HandoutFinesRequest} handoutFinesRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      handoutFines: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("handoutFines", "handoutFinesRequest", i);
        const a = "/fines/handout", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Send an email to all given users about their possible future fine.
       * @param {HandoutFinesRequest} handoutFinesRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      notifyAboutFutureFines: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("notifyAboutFutureFines", "handoutFinesRequest", i);
        const a = "/fines/notify", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get all fine handout events
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      returnAllFineHandoutEvents: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        const n = "/fines", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Get all fine handout events
       * @param {number} id The id of the fine handout event which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      returnSingleFineHandoutEvent: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("returnSingleFineHandoutEvent", "id", i);
        const a = "/fines/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      })
    };
  };
  l.DebtorsApiAxiosParamCreator = Ce;
  const ne = function(r) {
    const c = (0, l.DebtorsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Return all users that had at most -5 euros balance both now and on the reference date.    For all these users, also return their fine based on the reference date.
       * @param {Array<string>} referenceDates Dates to base the fines on. Every returned user has at    least five euros debt on every reference date. The height of the fine is based on the first date in the array.
       * @param {Array<number>} [userTypes] List of all user types fines should be calculated for 1 (MEMBER), 2 (ORGAN), 3 (VOUCHER), 4 (LOCAL_USER), 5 (LOCAL_ADMIN), 6 (INVOICE), 7 (AUTOMATIC_INVOICE).
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      calculateFines(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.calculateFines(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["DebtorsApi.calculateFines"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Delete a fine
       * @param {number} id The id of the fine which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFine(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.deleteFine(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["DebtorsApi.deleteFine"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Get a report of all fines
       * @param {string} [fromDate] The start date of the report, inclusive
       * @param {string} [toDate] The end date of the report, exclusive
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFineReport(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getFineReport(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["DebtorsApi.getFineReport"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Get a report of all fines in pdf format
       * @param {string} [fromDate] The start date of the report, inclusive
       * @param {string} [toDate] The end date of the report, exclusive
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFineReportPdf(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getFineReportPdf(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["DebtorsApi.getFineReportPdf"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Handout fines to all given users. Fines will be handed out \"now\" to prevent rewriting history.
       * @param {HandoutFinesRequest} handoutFinesRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      handoutFines(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.handoutFines(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["DebtorsApi.handoutFines"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Send an email to all given users about their possible future fine.
       * @param {HandoutFinesRequest} handoutFinesRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      notifyAboutFutureFines(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.notifyAboutFutureFines(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["DebtorsApi.notifyAboutFutureFines"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Get all fine handout events
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      returnAllFineHandoutEvents(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.returnAllFineHandoutEvents(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["DebtorsApi.returnAllFineHandoutEvents"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Get all fine handout events
       * @param {number} id The id of the fine handout event which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      returnSingleFineHandoutEvent(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.returnSingleFineHandoutEvent(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["DebtorsApi.returnSingleFineHandoutEvent"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      }
    };
  };
  l.DebtorsApiFp = ne;
  const oe = function(r, c, o) {
    const i = (0, l.DebtorsApiFp)(r);
    return {
      /**
       *
       * @summary Return all users that had at most -5 euros balance both now and on the reference date.    For all these users, also return their fine based on the reference date.
       * @param {Array<string>} referenceDates Dates to base the fines on. Every returned user has at    least five euros debt on every reference date. The height of the fine is based on the first date in the array.
       * @param {Array<number>} [userTypes] List of all user types fines should be calculated for 1 (MEMBER), 2 (ORGAN), 3 (VOUCHER), 4 (LOCAL_USER), 5 (LOCAL_ADMIN), 6 (INVOICE), 7 (AUTOMATIC_INVOICE).
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      calculateFines(t, a, s) {
        return i.calculateFines(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Delete a fine
       * @param {number} id The id of the fine which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFine(t, a) {
        return i.deleteFine(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Get a report of all fines
       * @param {string} [fromDate] The start date of the report, inclusive
       * @param {string} [toDate] The end date of the report, exclusive
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFineReport(t, a, s) {
        return i.getFineReport(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Get a report of all fines in pdf format
       * @param {string} [fromDate] The start date of the report, inclusive
       * @param {string} [toDate] The end date of the report, exclusive
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFineReportPdf(t, a, s) {
        return i.getFineReportPdf(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Handout fines to all given users. Fines will be handed out \"now\" to prevent rewriting history.
       * @param {HandoutFinesRequest} handoutFinesRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      handoutFines(t, a) {
        return i.handoutFines(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Send an email to all given users about their possible future fine.
       * @param {HandoutFinesRequest} handoutFinesRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      notifyAboutFutureFines(t, a) {
        return i.notifyAboutFutureFines(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Get all fine handout events
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      returnAllFineHandoutEvents(t, a, s) {
        return i.returnAllFineHandoutEvents(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Get all fine handout events
       * @param {number} id The id of the fine handout event which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      returnSingleFineHandoutEvent(t, a) {
        return i.returnSingleFineHandoutEvent(t, a).then((s) => s(o, c));
      }
    };
  };
  l.DebtorsApiFactory = oe;
  class fe extends A.BaseAPI {
    /**
     *
     * @summary Return all users that had at most -5 euros balance both now and on the reference date.    For all these users, also return their fine based on the reference date.
     * @param {Array<string>} referenceDates Dates to base the fines on. Every returned user has at    least five euros debt on every reference date. The height of the fine is based on the first date in the array.
     * @param {Array<number>} [userTypes] List of all user types fines should be calculated for 1 (MEMBER), 2 (ORGAN), 3 (VOUCHER), 4 (LOCAL_USER), 5 (LOCAL_ADMIN), 6 (INVOICE), 7 (AUTOMATIC_INVOICE).
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    calculateFines(c, o, i) {
      return (0, l.DebtorsApiFp)(this.configuration).calculateFines(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a fine
     * @param {number} id The id of the fine which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    deleteFine(c, o) {
      return (0, l.DebtorsApiFp)(this.configuration).deleteFine(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a report of all fines
     * @param {string} [fromDate] The start date of the report, inclusive
     * @param {string} [toDate] The end date of the report, exclusive
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    getFineReport(c, o, i) {
      return (0, l.DebtorsApiFp)(this.configuration).getFineReport(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a report of all fines in pdf format
     * @param {string} [fromDate] The start date of the report, inclusive
     * @param {string} [toDate] The end date of the report, exclusive
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    getFineReportPdf(c, o, i) {
      return (0, l.DebtorsApiFp)(this.configuration).getFineReportPdf(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Handout fines to all given users. Fines will be handed out \"now\" to prevent rewriting history.
     * @param {HandoutFinesRequest} handoutFinesRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    handoutFines(c, o) {
      return (0, l.DebtorsApiFp)(this.configuration).handoutFines(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Send an email to all given users about their possible future fine.
     * @param {HandoutFinesRequest} handoutFinesRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    notifyAboutFutureFines(c, o) {
      return (0, l.DebtorsApiFp)(this.configuration).notifyAboutFutureFines(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all fine handout events
     * @param {number} [take] How many entries the endpoint should return
     * @param {number} [skip] How many entries should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    returnAllFineHandoutEvents(c, o, i) {
      return (0, l.DebtorsApiFp)(this.configuration).returnAllFineHandoutEvents(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all fine handout events
     * @param {number} id The id of the fine handout event which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DebtorsApi
     */
    returnSingleFineHandoutEvent(c, o) {
      return (0, l.DebtorsApiFp)(this.configuration).returnSingleFineHandoutEvent(c, o).then((i) => i(this.axios, this.basePath));
    }
  }
  l.DebtorsApi = fe;
  const kt = function(r) {
    return {
      /**
       *
       * @summary Change the assignment of users to shifts on an event
       * @param {number} eventId The id of the event
       * @param {number} shiftId The id of the shift
       * @param {number} userId The id of the user
       * @param {EventAnswerAssignmentRequest} eventAnswerAssignmentRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      assignEventShift: (c, o, i, t, ...a) => h(this, [c, o, i, t, ...a], void 0, function* (s, n, u, d, p = {}) {
        (0, e.assertParamExists)("assignEventShift", "eventId", s), (0, e.assertParamExists)("assignEventShift", "shiftId", n), (0, e.assertParamExists)("assignEventShift", "userId", u), (0, e.assertParamExists)("assignEventShift", "eventAnswerAssignmentRequest", d);
        const v = "/events/{eventId}/shift/{shiftId}/user/{userId}/assign".replace("{eventId}", encodeURIComponent(String(s))).replace("{shiftId}", encodeURIComponent(String(n))).replace("{userId}", encodeURIComponent(String(u))), P = new URL(v, e.DUMMY_BASE_URL);
        let b;
        r && (b = r.baseOptions);
        const f = Object.assign(Object.assign({ method: "PUT" }, b), p), R = {}, y = {};
        yield (0, e.setBearerAuthToObject)(R, r), R["Content-Type"] = "application/json", (0, e.setSearchParams)(P, y);
        let E = b && b.headers ? b.headers : {};
        return f.headers = Object.assign(Object.assign(Object.assign({}, R), E), p.headers), f.data = (0, e.serializeDataIfNeeded)(d, f, r), {
          url: (0, e.toPathString)(P),
          options: f
        };
      }),
      /**
       *
       * @summary Create an event with its corresponding answers objects
       * @param {CreateEventRequest} createEventRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEvent: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createEvent", "createEventRequest", i);
        const a = "/events", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Create an event shift
       * @param {CreateShiftRequest} createShiftRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEventShift: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createEventShift", "createShiftRequest", i);
        const a = "/eventshifts", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Delete an event with its answers
       * @param {number} id The id of the event which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteEvent: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteEvent", "id", i);
        const a = "/events/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Delete an event shift with its answers
       * @param {number} id The id of the event which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteEventShift: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteEventShift", "id", i);
        const a = "/eventshifts/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get all event shifts
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllEventShifts: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        const n = "/eventshifts", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Get all events
       * @param {string} [name] Name of the event
       * @param {number} [createdById] ID of user that created the event
       * @param {string} [beforeDate] Get only events that start after this date
       * @param {string} [afterDate] Get only events that start before this date
       * @param {string} [type] Get only events that are this type
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllEvents: (c, o, i, t, a, s, n, ...u) => h(this, [c, o, i, t, a, s, n, ...u], void 0, function* (d, p, v, P, b, f, R, y = {}) {
        const E = "/events", I = new URL(E, e.DUMMY_BASE_URL);
        let C;
        r && (C = r.baseOptions);
        const F = Object.assign(Object.assign({ method: "GET" }, C), y), L = {}, x = {};
        yield (0, e.setBearerAuthToObject)(L, r), d !== void 0 && (x.name = d), p !== void 0 && (x.createdById = p), v !== void 0 && (x.beforeDate = v), P !== void 0 && (x.afterDate = P), b !== void 0 && (x.type = b), f !== void 0 && (x.take = f), R !== void 0 && (x.skip = R), (0, e.setSearchParams)(I, x);
        let X = C && C.headers ? C.headers : {};
        return F.headers = Object.assign(Object.assign(Object.assign({}, L), X), y.headers), {
          url: (0, e.toPathString)(I),
          options: F
        };
      }),
      /**
       *
       * @summary Get the number of times a user has been selected for the given shift
       * @param {number} id The id of the event shift
       * @param {string} [eventType] Only include events of this type
       * @param {string} [afterDate] Only include events after this date
       * @param {string} [beforeDate] Only include events before this date
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getEventShiftCount: (c, o, i, t, ...a) => h(this, [c, o, i, t, ...a], void 0, function* (s, n, u, d, p = {}) {
        (0, e.assertParamExists)("getEventShiftCount", "id", s);
        const v = "/eventshifts/{id}/counts".replace("{id}", encodeURIComponent(String(s))), P = new URL(v, e.DUMMY_BASE_URL);
        let b;
        r && (b = r.baseOptions);
        const f = Object.assign(Object.assign({ method: "GET" }, b), p), R = {}, y = {};
        yield (0, e.setBearerAuthToObject)(R, r), n !== void 0 && (y.eventType = n), u !== void 0 && (y.afterDate = u), d !== void 0 && (y.beforeDate = d), (0, e.setSearchParams)(P, y);
        let E = b && b.headers ? b.headers : {};
        return f.headers = Object.assign(Object.assign(Object.assign({}, R), E), p.headers), {
          url: (0, e.toPathString)(P),
          options: f
        };
      }),
      /**
       *
       * @summary Get a single event with its answers and shifts
       * @param {number} id The id of the event which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleEvent: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSingleEvent", "id", i);
        const a = "/events/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Update an event with its corresponding answers objects
       * @param {number} id The id of the event which should be returned
       * @param {UpdateEventRequest} updateEventRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateEvent: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateEvent", "id", t), (0, e.assertParamExists)("updateEvent", "updateEventRequest", a);
        const n = "/events/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Update an event shift
       * @param {number} id The id of the event which should be returned
       * @param {UpdateShiftRequest} updateShiftRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateEventShift: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateEventShift", "id", t), (0, e.assertParamExists)("updateEventShift", "updateShiftRequest", a);
        const n = "/eventshifts/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Update the availability of a user for a shift in an event
       * @param {number} eventId The id of the event
       * @param {number} shiftId The id of the shift
       * @param {number} userId The id of the user
       * @param {EventAnswerAvailabilityRequest} eventAnswerAvailabilityRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateEventShiftAvailability: (c, o, i, t, ...a) => h(this, [c, o, i, t, ...a], void 0, function* (s, n, u, d, p = {}) {
        (0, e.assertParamExists)("updateEventShiftAvailability", "eventId", s), (0, e.assertParamExists)("updateEventShiftAvailability", "shiftId", n), (0, e.assertParamExists)("updateEventShiftAvailability", "userId", u), (0, e.assertParamExists)("updateEventShiftAvailability", "eventAnswerAvailabilityRequest", d);
        const v = "/events/{eventId}/shift/{shiftId}/user/{userId}/availability".replace("{eventId}", encodeURIComponent(String(s))).replace("{shiftId}", encodeURIComponent(String(n))).replace("{userId}", encodeURIComponent(String(u))), P = new URL(v, e.DUMMY_BASE_URL);
        let b;
        r && (b = r.baseOptions);
        const f = Object.assign(Object.assign({ method: "POST" }, b), p), R = {}, y = {};
        yield (0, e.setBearerAuthToObject)(R, r), R["Content-Type"] = "application/json", (0, e.setSearchParams)(P, y);
        let E = b && b.headers ? b.headers : {};
        return f.headers = Object.assign(Object.assign(Object.assign({}, R), E), p.headers), f.data = (0, e.serializeDataIfNeeded)(d, f, r), {
          url: (0, e.toPathString)(P),
          options: f
        };
      })
    };
  };
  l.EventsApiAxiosParamCreator = kt;
  const Qt = function(r) {
    const c = (0, l.EventsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Change the assignment of users to shifts on an event
       * @param {number} eventId The id of the event
       * @param {number} shiftId The id of the shift
       * @param {number} userId The id of the user
       * @param {EventAnswerAssignmentRequest} eventAnswerAssignmentRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      assignEventShift(o, i, t, a, s) {
        return h(this, void 0, void 0, function* () {
          var n, u, d;
          const p = yield c.assignEventShift(o, i, t, a, s), v = (n = r == null ? void 0 : r.serverIndex) !== null && n !== void 0 ? n : 0, P = (d = (u = A.operationServerMap["EventsApi.assignEventShift"]) === null || u === void 0 ? void 0 : u[v]) === null || d === void 0 ? void 0 : d.url;
          return (b, f) => (0, e.createRequestFunction)(p, O.default, A.BASE_PATH, r)(b, P || f);
        });
      },
      /**
       *
       * @summary Create an event with its corresponding answers objects
       * @param {CreateEventRequest} createEventRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEvent(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createEvent(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["EventsApi.createEvent"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Create an event shift
       * @param {CreateShiftRequest} createShiftRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEventShift(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createEventShift(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["EventsApi.createEventShift"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Delete an event with its answers
       * @param {number} id The id of the event which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteEvent(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.deleteEvent(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["EventsApi.deleteEvent"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Delete an event shift with its answers
       * @param {number} id The id of the event which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteEventShift(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.deleteEventShift(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["EventsApi.deleteEventShift"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Get all event shifts
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllEventShifts(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllEventShifts(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["EventsApi.getAllEventShifts"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Get all events
       * @param {string} [name] Name of the event
       * @param {number} [createdById] ID of user that created the event
       * @param {string} [beforeDate] Get only events that start after this date
       * @param {string} [afterDate] Get only events that start before this date
       * @param {string} [type] Get only events that are this type
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllEvents(o, i, t, a, s, n, u, d) {
        return h(this, void 0, void 0, function* () {
          var p, v, P;
          const b = yield c.getAllEvents(o, i, t, a, s, n, u, d), f = (p = r == null ? void 0 : r.serverIndex) !== null && p !== void 0 ? p : 0, R = (P = (v = A.operationServerMap["EventsApi.getAllEvents"]) === null || v === void 0 ? void 0 : v[f]) === null || P === void 0 ? void 0 : P.url;
          return (y, E) => (0, e.createRequestFunction)(b, O.default, A.BASE_PATH, r)(y, R || E);
        });
      },
      /**
       *
       * @summary Get the number of times a user has been selected for the given shift
       * @param {number} id The id of the event shift
       * @param {string} [eventType] Only include events of this type
       * @param {string} [afterDate] Only include events after this date
       * @param {string} [beforeDate] Only include events before this date
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getEventShiftCount(o, i, t, a, s) {
        return h(this, void 0, void 0, function* () {
          var n, u, d;
          const p = yield c.getEventShiftCount(o, i, t, a, s), v = (n = r == null ? void 0 : r.serverIndex) !== null && n !== void 0 ? n : 0, P = (d = (u = A.operationServerMap["EventsApi.getEventShiftCount"]) === null || u === void 0 ? void 0 : u[v]) === null || d === void 0 ? void 0 : d.url;
          return (b, f) => (0, e.createRequestFunction)(p, O.default, A.BASE_PATH, r)(b, P || f);
        });
      },
      /**
       *
       * @summary Get a single event with its answers and shifts
       * @param {number} id The id of the event which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleEvent(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getSingleEvent(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["EventsApi.getSingleEvent"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Update an event with its corresponding answers objects
       * @param {number} id The id of the event which should be returned
       * @param {UpdateEventRequest} updateEventRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateEvent(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateEvent(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["EventsApi.updateEvent"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Update an event shift
       * @param {number} id The id of the event which should be returned
       * @param {UpdateShiftRequest} updateShiftRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateEventShift(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateEventShift(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["EventsApi.updateEventShift"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Update the availability of a user for a shift in an event
       * @param {number} eventId The id of the event
       * @param {number} shiftId The id of the shift
       * @param {number} userId The id of the user
       * @param {EventAnswerAvailabilityRequest} eventAnswerAvailabilityRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateEventShiftAvailability(o, i, t, a, s) {
        return h(this, void 0, void 0, function* () {
          var n, u, d;
          const p = yield c.updateEventShiftAvailability(o, i, t, a, s), v = (n = r == null ? void 0 : r.serverIndex) !== null && n !== void 0 ? n : 0, P = (d = (u = A.operationServerMap["EventsApi.updateEventShiftAvailability"]) === null || u === void 0 ? void 0 : u[v]) === null || d === void 0 ? void 0 : d.url;
          return (b, f) => (0, e.createRequestFunction)(p, O.default, A.BASE_PATH, r)(b, P || f);
        });
      }
    };
  };
  l.EventsApiFp = Qt;
  const Yt = function(r, c, o) {
    const i = (0, l.EventsApiFp)(r);
    return {
      /**
       *
       * @summary Change the assignment of users to shifts on an event
       * @param {number} eventId The id of the event
       * @param {number} shiftId The id of the shift
       * @param {number} userId The id of the user
       * @param {EventAnswerAssignmentRequest} eventAnswerAssignmentRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      assignEventShift(t, a, s, n, u) {
        return i.assignEventShift(t, a, s, n, u).then((d) => d(o, c));
      },
      /**
       *
       * @summary Create an event with its corresponding answers objects
       * @param {CreateEventRequest} createEventRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEvent(t, a) {
        return i.createEvent(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Create an event shift
       * @param {CreateShiftRequest} createShiftRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEventShift(t, a) {
        return i.createEventShift(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Delete an event with its answers
       * @param {number} id The id of the event which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteEvent(t, a) {
        return i.deleteEvent(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Delete an event shift with its answers
       * @param {number} id The id of the event which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteEventShift(t, a) {
        return i.deleteEventShift(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Get all event shifts
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllEventShifts(t, a, s) {
        return i.getAllEventShifts(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Get all events
       * @param {string} [name] Name of the event
       * @param {number} [createdById] ID of user that created the event
       * @param {string} [beforeDate] Get only events that start after this date
       * @param {string} [afterDate] Get only events that start before this date
       * @param {string} [type] Get only events that are this type
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllEvents(t, a, s, n, u, d, p, v) {
        return i.getAllEvents(t, a, s, n, u, d, p, v).then((P) => P(o, c));
      },
      /**
       *
       * @summary Get the number of times a user has been selected for the given shift
       * @param {number} id The id of the event shift
       * @param {string} [eventType] Only include events of this type
       * @param {string} [afterDate] Only include events after this date
       * @param {string} [beforeDate] Only include events before this date
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getEventShiftCount(t, a, s, n, u) {
        return i.getEventShiftCount(t, a, s, n, u).then((d) => d(o, c));
      },
      /**
       *
       * @summary Get a single event with its answers and shifts
       * @param {number} id The id of the event which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleEvent(t, a) {
        return i.getSingleEvent(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Update an event with its corresponding answers objects
       * @param {number} id The id of the event which should be returned
       * @param {UpdateEventRequest} updateEventRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateEvent(t, a, s) {
        return i.updateEvent(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Update an event shift
       * @param {number} id The id of the event which should be returned
       * @param {UpdateShiftRequest} updateShiftRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateEventShift(t, a, s) {
        return i.updateEventShift(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Update the availability of a user for a shift in an event
       * @param {number} eventId The id of the event
       * @param {number} shiftId The id of the shift
       * @param {number} userId The id of the user
       * @param {EventAnswerAvailabilityRequest} eventAnswerAvailabilityRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateEventShiftAvailability(t, a, s, n, u) {
        return i.updateEventShiftAvailability(t, a, s, n, u).then((d) => d(o, c));
      }
    };
  };
  l.EventsApiFactory = Yt;
  class $t extends A.BaseAPI {
    /**
     *
     * @summary Change the assignment of users to shifts on an event
     * @param {number} eventId The id of the event
     * @param {number} shiftId The id of the shift
     * @param {number} userId The id of the user
     * @param {EventAnswerAssignmentRequest} eventAnswerAssignmentRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    assignEventShift(c, o, i, t, a) {
      return (0, l.EventsApiFp)(this.configuration).assignEventShift(c, o, i, t, a).then((s) => s(this.axios, this.basePath));
    }
    /**
     *
     * @summary Create an event with its corresponding answers objects
     * @param {CreateEventRequest} createEventRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    createEvent(c, o) {
      return (0, l.EventsApiFp)(this.configuration).createEvent(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Create an event shift
     * @param {CreateShiftRequest} createShiftRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    createEventShift(c, o) {
      return (0, l.EventsApiFp)(this.configuration).createEventShift(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete an event with its answers
     * @param {number} id The id of the event which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    deleteEvent(c, o) {
      return (0, l.EventsApiFp)(this.configuration).deleteEvent(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete an event shift with its answers
     * @param {number} id The id of the event which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    deleteEventShift(c, o) {
      return (0, l.EventsApiFp)(this.configuration).deleteEventShift(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all event shifts
     * @param {number} [take] How many entries the endpoint should return
     * @param {number} [skip] How many entries should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    getAllEventShifts(c, o, i) {
      return (0, l.EventsApiFp)(this.configuration).getAllEventShifts(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all events
     * @param {string} [name] Name of the event
     * @param {number} [createdById] ID of user that created the event
     * @param {string} [beforeDate] Get only events that start after this date
     * @param {string} [afterDate] Get only events that start before this date
     * @param {string} [type] Get only events that are this type
     * @param {number} [take] How many entries the endpoint should return
     * @param {number} [skip] How many entries should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    getAllEvents(c, o, i, t, a, s, n, u) {
      return (0, l.EventsApiFp)(this.configuration).getAllEvents(c, o, i, t, a, s, n, u).then((d) => d(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get the number of times a user has been selected for the given shift
     * @param {number} id The id of the event shift
     * @param {string} [eventType] Only include events of this type
     * @param {string} [afterDate] Only include events after this date
     * @param {string} [beforeDate] Only include events before this date
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    getEventShiftCount(c, o, i, t, a) {
      return (0, l.EventsApiFp)(this.configuration).getEventShiftCount(c, o, i, t, a).then((s) => s(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a single event with its answers and shifts
     * @param {number} id The id of the event which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    getSingleEvent(c, o) {
      return (0, l.EventsApiFp)(this.configuration).getSingleEvent(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Update an event with its corresponding answers objects
     * @param {number} id The id of the event which should be returned
     * @param {UpdateEventRequest} updateEventRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    updateEvent(c, o, i) {
      return (0, l.EventsApiFp)(this.configuration).updateEvent(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Update an event shift
     * @param {number} id The id of the event which should be returned
     * @param {UpdateShiftRequest} updateShiftRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    updateEventShift(c, o, i) {
      return (0, l.EventsApiFp)(this.configuration).updateEventShift(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Update the availability of a user for a shift in an event
     * @param {number} eventId The id of the event
     * @param {number} shiftId The id of the shift
     * @param {number} userId The id of the user
     * @param {EventAnswerAvailabilityRequest} eventAnswerAvailabilityRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof EventsApi
     */
    updateEventShiftAvailability(c, o, i, t, a) {
      return (0, l.EventsApiFp)(this.configuration).updateEventShiftAvailability(c, o, i, t, a).then((s) => s(this.axios, this.basePath));
    }
  }
  l.EventsApi = $t;
  const zt = function(r) {
    return {
      /**
       *
       * @summary Upload a file with the given name.
       * @param {string} name The name of the file
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createFile: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("createFile", "name", t);
        const n = "/files", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "POST" }, d), s), v = {}, P = {}, b = new (r && r.formDataCtor || FormData)();
        yield (0, e.setBearerAuthToObject)(v, r), t !== void 0 && b.append("name", t), a !== void 0 && b.append("file", a), v["Content-Type"] = "multipart/form-data", (0, e.setSearchParams)(u, P);
        let f = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), f), s.headers), p.data = b, {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Delete the file with the given id.
       * @param {number} id The id of the file which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFile: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteFile", "id", i);
        const a = "/files/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Download a file with the given id.
       * @param {number} id The id of the file which should be downloaded
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFile: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getFile", "id", i);
        const a = "/files/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      })
    };
  };
  l.FilesApiAxiosParamCreator = zt;
  const Kt = function(r) {
    const c = (0, l.FilesApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Upload a file with the given name.
       * @param {string} name The name of the file
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createFile(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.createFile(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["FilesApi.createFile"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Delete the file with the given id.
       * @param {number} id The id of the file which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFile(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.deleteFile(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["FilesApi.deleteFile"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Download a file with the given id.
       * @param {number} id The id of the file which should be downloaded
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFile(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getFile(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["FilesApi.getFile"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      }
    };
  };
  l.FilesApiFp = Kt;
  const Wt = function(r, c, o) {
    const i = (0, l.FilesApiFp)(r);
    return {
      /**
       *
       * @summary Upload a file with the given name.
       * @param {string} name The name of the file
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createFile(t, a, s) {
        return i.createFile(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Delete the file with the given id.
       * @param {number} id The id of the file which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFile(t, a) {
        return i.deleteFile(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Download a file with the given id.
       * @param {number} id The id of the file which should be downloaded
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFile(t, a) {
        return i.getFile(t, a).then((s) => s(o, c));
      }
    };
  };
  l.FilesApiFactory = Wt;
  class Jt extends A.BaseAPI {
    /**
     *
     * @summary Upload a file with the given name.
     * @param {string} name The name of the file
     * @param {File} [file] file
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FilesApi
     */
    createFile(c, o, i) {
      return (0, l.FilesApiFp)(this.configuration).createFile(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete the file with the given id.
     * @param {number} id The id of the file which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FilesApi
     */
    deleteFile(c, o) {
      return (0, l.FilesApiFp)(this.configuration).deleteFile(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Download a file with the given id.
     * @param {number} id The id of the file which should be downloaded
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof FilesApi
     */
    getFile(c, o) {
      return (0, l.FilesApiFp)(this.configuration).getFile(c, o).then((i) => i(this.axios, this.basePath));
    }
  }
  l.FilesApi = Jt;
  const Xt = function(r) {
    return {
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {CreateInvoiceRequest} createInvoiceRequest The invoice which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createInvoice: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createInvoice", "createInvoiceRequest", i);
        const a = "/invoices", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Deletes an invoice.
       * @param {number} id The id of the invoice which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteInvoice: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteInvoice", "id", i);
        const a = "/invoices/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Delete invoice user defaults.
       * @param {number} id The id of the invoice user to delete.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteInvoiceUser: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteInvoiceUser", "id", i);
        const a = "/invoices/users/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns all invoices in the system.
       * @param {number} [toId] Filter on Id of the debtor
       * @param {number} [invoiceId] Filter on invoice ID
       * @param {GetAllInvoicesCurrentStateEnum} [currentState] Filter based on Invoice State.
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned
       * @param {string} [fromDate] Start date for selected invoices (inclusive)
       * @param {string} [tillDate] End date for selected invoices (exclusive)
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllInvoices: (c, o, i, t, a, s, n, u, ...d) => h(this, [c, o, i, t, a, s, n, u, ...d], void 0, function* (p, v, P, b, f, R, y, E, I = {}) {
        const C = "/invoices", F = new URL(C, e.DUMMY_BASE_URL);
        let L;
        r && (L = r.baseOptions);
        const x = Object.assign(Object.assign({ method: "GET" }, L), I), X = {}, G = {};
        yield (0, e.setBearerAuthToObject)(X, r), p !== void 0 && (G.toId = p), v !== void 0 && (G.invoiceId = v), P && (G.currentState = P), b !== void 0 && (G.returnEntries = b), f !== void 0 && (G.fromDate = f), R !== void 0 && (G.tillDate = R), y !== void 0 && (G.take = y), E !== void 0 && (G.skip = E), (0, e.setSearchParams)(F, G);
        let z = L && L.headers ? L.headers : {};
        return x.headers = Object.assign(Object.assign(Object.assign({}, X), z), I.headers), {
          url: (0, e.toPathString)(F),
          options: x
        };
      }),
      /**
       *
       * @summary Get an invoice pdf.
       * @param {number} id The id of the invoice to return
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getInvoicePdf: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getInvoicePdf", "id", i);
        const a = "/invoices/{id}/pdf".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns a single invoice in the system.
       * @param {number} id The id of the requested invoice
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned, defaults to true.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleInvoice: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("getSingleInvoice", "id", t);
        const n = "/invoices/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), a !== void 0 && (P.returnEntries = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Get invoice user defaults.
       * @param {number} id The id of the invoice user to return.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleInvoiceUser: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSingleInvoiceUser", "id", i);
        const a = "/invoices/users/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Update or create invoice user defaults.
       * @param {number} id The id of the user to update
       * @param {UpdateInvoiceUserRequest} updateInvoiceUserRequest The invoice user which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      putInvoiceUser: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("putInvoiceUser", "id", t), (0, e.assertParamExists)("putInvoiceUser", "updateInvoiceUserRequest", a);
        const n = "/invoices/users/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PUT" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {number} id The id of the invoice which should be updated
       * @param {UpdateInvoiceRequest} updateInvoiceRequest The invoice update to process
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateInvoice: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateInvoice", "id", t), (0, e.assertParamExists)("updateInvoice", "updateInvoiceRequest", a);
        const n = "/invoices/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      })
    };
  };
  l.InvoicesApiAxiosParamCreator = Xt;
  const Zt = function(r) {
    const c = (0, l.InvoicesApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {CreateInvoiceRequest} createInvoiceRequest The invoice which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createInvoice(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createInvoice(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["InvoicesApi.createInvoice"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Deletes an invoice.
       * @param {number} id The id of the invoice which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteInvoice(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.deleteInvoice(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["InvoicesApi.deleteInvoice"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Delete invoice user defaults.
       * @param {number} id The id of the invoice user to delete.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteInvoiceUser(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.deleteInvoiceUser(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["InvoicesApi.deleteInvoiceUser"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Returns all invoices in the system.
       * @param {number} [toId] Filter on Id of the debtor
       * @param {number} [invoiceId] Filter on invoice ID
       * @param {GetAllInvoicesCurrentStateEnum} [currentState] Filter based on Invoice State.
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned
       * @param {string} [fromDate] Start date for selected invoices (inclusive)
       * @param {string} [tillDate] End date for selected invoices (exclusive)
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllInvoices(o, i, t, a, s, n, u, d, p) {
        return h(this, void 0, void 0, function* () {
          var v, P, b;
          const f = yield c.getAllInvoices(o, i, t, a, s, n, u, d, p), R = (v = r == null ? void 0 : r.serverIndex) !== null && v !== void 0 ? v : 0, y = (b = (P = A.operationServerMap["InvoicesApi.getAllInvoices"]) === null || P === void 0 ? void 0 : P[R]) === null || b === void 0 ? void 0 : b.url;
          return (E, I) => (0, e.createRequestFunction)(f, O.default, A.BASE_PATH, r)(E, y || I);
        });
      },
      /**
       *
       * @summary Get an invoice pdf.
       * @param {number} id The id of the invoice to return
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getInvoicePdf(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getInvoicePdf(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["InvoicesApi.getInvoicePdf"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Returns a single invoice in the system.
       * @param {number} id The id of the requested invoice
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned, defaults to true.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleInvoice(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getSingleInvoice(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["InvoicesApi.getSingleInvoice"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Get invoice user defaults.
       * @param {number} id The id of the invoice user to return.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleInvoiceUser(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getSingleInvoiceUser(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["InvoicesApi.getSingleInvoiceUser"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Update or create invoice user defaults.
       * @param {number} id The id of the user to update
       * @param {UpdateInvoiceUserRequest} updateInvoiceUserRequest The invoice user which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      putInvoiceUser(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.putInvoiceUser(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["InvoicesApi.putInvoiceUser"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {number} id The id of the invoice which should be updated
       * @param {UpdateInvoiceRequest} updateInvoiceRequest The invoice update to process
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateInvoice(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateInvoice(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["InvoicesApi.updateInvoice"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      }
    };
  };
  l.InvoicesApiFp = Zt;
  const es = function(r, c, o) {
    const i = (0, l.InvoicesApiFp)(r);
    return {
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {CreateInvoiceRequest} createInvoiceRequest The invoice which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createInvoice(t, a) {
        return i.createInvoice(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Deletes an invoice.
       * @param {number} id The id of the invoice which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteInvoice(t, a) {
        return i.deleteInvoice(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Delete invoice user defaults.
       * @param {number} id The id of the invoice user to delete.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteInvoiceUser(t, a) {
        return i.deleteInvoiceUser(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Returns all invoices in the system.
       * @param {number} [toId] Filter on Id of the debtor
       * @param {number} [invoiceId] Filter on invoice ID
       * @param {GetAllInvoicesCurrentStateEnum} [currentState] Filter based on Invoice State.
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned
       * @param {string} [fromDate] Start date for selected invoices (inclusive)
       * @param {string} [tillDate] End date for selected invoices (exclusive)
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllInvoices(t, a, s, n, u, d, p, v, P) {
        return i.getAllInvoices(t, a, s, n, u, d, p, v, P).then((b) => b(o, c));
      },
      /**
       *
       * @summary Get an invoice pdf.
       * @param {number} id The id of the invoice to return
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getInvoicePdf(t, a) {
        return i.getInvoicePdf(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Returns a single invoice in the system.
       * @param {number} id The id of the requested invoice
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned, defaults to true.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleInvoice(t, a, s) {
        return i.getSingleInvoice(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Get invoice user defaults.
       * @param {number} id The id of the invoice user to return.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleInvoiceUser(t, a) {
        return i.getSingleInvoiceUser(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Update or create invoice user defaults.
       * @param {number} id The id of the user to update
       * @param {UpdateInvoiceUserRequest} updateInvoiceUserRequest The invoice user which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      putInvoiceUser(t, a, s) {
        return i.putInvoiceUser(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {number} id The id of the invoice which should be updated
       * @param {UpdateInvoiceRequest} updateInvoiceRequest The invoice update to process
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateInvoice(t, a, s) {
        return i.updateInvoice(t, a, s).then((n) => n(o, c));
      }
    };
  };
  l.InvoicesApiFactory = es;
  class ts extends A.BaseAPI {
    /**
     *
     * @summary Adds an invoice to the system.
     * @param {CreateInvoiceRequest} createInvoiceRequest The invoice which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    createInvoice(c, o) {
      return (0, l.InvoicesApiFp)(this.configuration).createInvoice(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Deletes an invoice.
     * @param {number} id The id of the invoice which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    deleteInvoice(c, o) {
      return (0, l.InvoicesApiFp)(this.configuration).deleteInvoice(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete invoice user defaults.
     * @param {number} id The id of the invoice user to delete.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    deleteInvoiceUser(c, o) {
      return (0, l.InvoicesApiFp)(this.configuration).deleteInvoiceUser(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all invoices in the system.
     * @param {number} [toId] Filter on Id of the debtor
     * @param {number} [invoiceId] Filter on invoice ID
     * @param {GetAllInvoicesCurrentStateEnum} [currentState] Filter based on Invoice State.
     * @param {boolean} [returnEntries] Boolean if invoice entries should be returned
     * @param {string} [fromDate] Start date for selected invoices (inclusive)
     * @param {string} [tillDate] End date for selected invoices (exclusive)
     * @param {number} [take] How many entries the endpoint should return
     * @param {number} [skip] How many entries should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    getAllInvoices(c, o, i, t, a, s, n, u, d) {
      return (0, l.InvoicesApiFp)(this.configuration).getAllInvoices(c, o, i, t, a, s, n, u, d).then((p) => p(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get an invoice pdf.
     * @param {number} id The id of the invoice to return
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    getInvoicePdf(c, o) {
      return (0, l.InvoicesApiFp)(this.configuration).getInvoicePdf(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns a single invoice in the system.
     * @param {number} id The id of the requested invoice
     * @param {boolean} [returnEntries] Boolean if invoice entries should be returned, defaults to true.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    getSingleInvoice(c, o, i) {
      return (0, l.InvoicesApiFp)(this.configuration).getSingleInvoice(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get invoice user defaults.
     * @param {number} id The id of the invoice user to return.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    getSingleInvoiceUser(c, o) {
      return (0, l.InvoicesApiFp)(this.configuration).getSingleInvoiceUser(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Update or create invoice user defaults.
     * @param {number} id The id of the user to update
     * @param {UpdateInvoiceUserRequest} updateInvoiceUserRequest The invoice user which should be updated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    putInvoiceUser(c, o, i) {
      return (0, l.InvoicesApiFp)(this.configuration).putInvoiceUser(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Adds an invoice to the system.
     * @param {number} id The id of the invoice which should be updated
     * @param {UpdateInvoiceRequest} updateInvoiceRequest The invoice update to process
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof InvoicesApi
     */
    updateInvoice(c, o, i) {
      return (0, l.InvoicesApiFp)(this.configuration).updateInvoice(c, o, i).then((t) => t(this.axios, this.basePath));
    }
  }
  l.InvoicesApi = ts, l.GetAllInvoicesCurrentStateEnum = {};
  const ss = function(r) {
    return {
      /**
       *
       * @summary Create a new payout request
       * @param {PayoutRequestRequest} payoutRequestRequest New payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPayoutRequest: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createPayoutRequest", "payoutRequestRequest", i);
        const a = "/payoutrequests", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns all payout requests given the filter parameters
       * @param {GetAllPayoutRequestsRequestedByIdParameter} [requestedById] ID of user(s) who requested a payout
       * @param {GetAllPayoutRequestsRequestedByIdParameter} [approvedById] ID of user(s) who approved a payout
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {string} [status] Status of the payout requests (OR relation)
       * @param {number} [take] How many payout requests the endpoint should return
       * @param {number} [skip] How many payout requests should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPayoutRequests: (c, o, i, t, a, s, n, ...u) => h(this, [c, o, i, t, a, s, n, ...u], void 0, function* (d, p, v, P, b, f, R, y = {}) {
        const E = "/payoutrequests", I = new URL(E, e.DUMMY_BASE_URL);
        let C;
        r && (C = r.baseOptions);
        const F = Object.assign(Object.assign({ method: "GET" }, C), y), L = {}, x = {};
        if (yield (0, e.setBearerAuthToObject)(L, r), d !== void 0)
          for (const [G, z] of Object.entries(d))
            x[G] = z;
        if (p !== void 0)
          for (const [G, z] of Object.entries(p))
            x[G] = z;
        v !== void 0 && (x.fromDate = v), P !== void 0 && (x.tillDate = P), b !== void 0 && (x.status = b), f !== void 0 && (x.take = f), R !== void 0 && (x.skip = R), (0, e.setSearchParams)(I, x);
        let X = C && C.headers ? C.headers : {};
        return F.headers = Object.assign(Object.assign(Object.assign({}, L), X), y.headers), {
          url: (0, e.toPathString)(I),
          options: F
        };
      }),
      /**
       *
       * @summary Get a payout request pdf
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getPayoutRequestPdf: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getPayoutRequestPdf", "id", i);
        const a = "/payoutrequests/{id}/pdf".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get a single payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePayoutRequest: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSinglePayoutRequest", "id", i);
        const a = "/payoutrequests/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Create a new status for a payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {PayoutRequestStatusRequest} payoutRequestStatusRequest New state of payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      setPayoutRequestStatus: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("setPayoutRequestStatus", "id", t), (0, e.assertParamExists)("setPayoutRequestStatus", "payoutRequestStatusRequest", a);
        const n = "/payoutrequests/{id}/status".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "POST" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      })
    };
  };
  l.PayoutRequestsApiAxiosParamCreator = ss;
  const as = function(r) {
    const c = (0, l.PayoutRequestsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Create a new payout request
       * @param {PayoutRequestRequest} payoutRequestRequest New payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPayoutRequest(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createPayoutRequest(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["PayoutRequestsApi.createPayoutRequest"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Returns all payout requests given the filter parameters
       * @param {GetAllPayoutRequestsRequestedByIdParameter} [requestedById] ID of user(s) who requested a payout
       * @param {GetAllPayoutRequestsRequestedByIdParameter} [approvedById] ID of user(s) who approved a payout
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {string} [status] Status of the payout requests (OR relation)
       * @param {number} [take] How many payout requests the endpoint should return
       * @param {number} [skip] How many payout requests should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPayoutRequests(o, i, t, a, s, n, u, d) {
        return h(this, void 0, void 0, function* () {
          var p, v, P;
          const b = yield c.getAllPayoutRequests(o, i, t, a, s, n, u, d), f = (p = r == null ? void 0 : r.serverIndex) !== null && p !== void 0 ? p : 0, R = (P = (v = A.operationServerMap["PayoutRequestsApi.getAllPayoutRequests"]) === null || v === void 0 ? void 0 : v[f]) === null || P === void 0 ? void 0 : P.url;
          return (y, E) => (0, e.createRequestFunction)(b, O.default, A.BASE_PATH, r)(y, R || E);
        });
      },
      /**
       *
       * @summary Get a payout request pdf
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getPayoutRequestPdf(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getPayoutRequestPdf(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["PayoutRequestsApi.getPayoutRequestPdf"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Get a single payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePayoutRequest(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getSinglePayoutRequest(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["PayoutRequestsApi.getSinglePayoutRequest"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Create a new status for a payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {PayoutRequestStatusRequest} payoutRequestStatusRequest New state of payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      setPayoutRequestStatus(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.setPayoutRequestStatus(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["PayoutRequestsApi.setPayoutRequestStatus"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      }
    };
  };
  l.PayoutRequestsApiFp = as;
  const rs = function(r, c, o) {
    const i = (0, l.PayoutRequestsApiFp)(r);
    return {
      /**
       *
       * @summary Create a new payout request
       * @param {PayoutRequestRequest} payoutRequestRequest New payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPayoutRequest(t, a) {
        return i.createPayoutRequest(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Returns all payout requests given the filter parameters
       * @param {GetAllPayoutRequestsRequestedByIdParameter} [requestedById] ID of user(s) who requested a payout
       * @param {GetAllPayoutRequestsRequestedByIdParameter} [approvedById] ID of user(s) who approved a payout
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {string} [status] Status of the payout requests (OR relation)
       * @param {number} [take] How many payout requests the endpoint should return
       * @param {number} [skip] How many payout requests should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPayoutRequests(t, a, s, n, u, d, p, v) {
        return i.getAllPayoutRequests(t, a, s, n, u, d, p, v).then((P) => P(o, c));
      },
      /**
       *
       * @summary Get a payout request pdf
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getPayoutRequestPdf(t, a) {
        return i.getPayoutRequestPdf(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Get a single payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePayoutRequest(t, a) {
        return i.getSinglePayoutRequest(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Create a new status for a payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {PayoutRequestStatusRequest} payoutRequestStatusRequest New state of payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      setPayoutRequestStatus(t, a, s) {
        return i.setPayoutRequestStatus(t, a, s).then((n) => n(o, c));
      }
    };
  };
  l.PayoutRequestsApiFactory = rs;
  class ns extends A.BaseAPI {
    /**
     *
     * @summary Create a new payout request
     * @param {PayoutRequestRequest} payoutRequestRequest New payout request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PayoutRequestsApi
     */
    createPayoutRequest(c, o) {
      return (0, l.PayoutRequestsApiFp)(this.configuration).createPayoutRequest(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all payout requests given the filter parameters
     * @param {GetAllPayoutRequestsRequestedByIdParameter} [requestedById] ID of user(s) who requested a payout
     * @param {GetAllPayoutRequestsRequestedByIdParameter} [approvedById] ID of user(s) who approved a payout
     * @param {string} [fromDate] Start date for selected transactions (inclusive)
     * @param {string} [tillDate] End date for selected transactions (exclusive)
     * @param {string} [status] Status of the payout requests (OR relation)
     * @param {number} [take] How many payout requests the endpoint should return
     * @param {number} [skip] How many payout requests should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PayoutRequestsApi
     */
    getAllPayoutRequests(c, o, i, t, a, s, n, u) {
      return (0, l.PayoutRequestsApiFp)(this.configuration).getAllPayoutRequests(c, o, i, t, a, s, n, u).then((d) => d(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a payout request pdf
     * @param {number} id The ID of the payout request object that should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PayoutRequestsApi
     */
    getPayoutRequestPdf(c, o) {
      return (0, l.PayoutRequestsApiFp)(this.configuration).getPayoutRequestPdf(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a single payout request
     * @param {number} id The ID of the payout request object that should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PayoutRequestsApi
     */
    getSinglePayoutRequest(c, o) {
      return (0, l.PayoutRequestsApiFp)(this.configuration).getSinglePayoutRequest(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Create a new status for a payout request
     * @param {number} id The ID of the payout request object that should be returned
     * @param {PayoutRequestStatusRequest} payoutRequestStatusRequest New state of payout request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PayoutRequestsApi
     */
    setPayoutRequestStatus(c, o, i) {
      return (0, l.PayoutRequestsApiFp)(this.configuration).setPayoutRequestStatus(c, o, i).then((t) => t(this.axios, this.basePath));
    }
  }
  l.PayoutRequestsApi = ns;
  const is = function(r) {
    return {
      /**
       *
       * @summary Create a new Point of Sale.
       * @param {CreatePointOfSaleRequest} createPointOfSaleRequest The point of sale which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPointOfSale: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createPointOfSale", "createPointOfSaleRequest", i);
        const a = "/pointsofsale", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary (Soft) delete the given point of sale. Cannot be undone.
       * @param {number} id The id of the point of sale which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deletePointOfSale: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deletePointOfSale", "id", i);
        const a = "/pointsofsale/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns the containers of the requested Point of Sale, empty list if POS does not exist
       * @param {number} id The id of the point of sale
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointOfSaleContainers: (c, o, i, ...t) => h(this, [c, o, i, ...t], void 0, function* (a, s, n, u = {}) {
        (0, e.assertParamExists)("getAllPointOfSaleContainers", "id", a);
        const d = "/pointsofsale/{id}/containers".replace("{id}", encodeURIComponent(String(a))), p = new URL(d, e.DUMMY_BASE_URL);
        let v;
        r && (v = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, v), u), b = {}, f = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (f.take = s), n !== void 0 && (f.skip = n), (0, e.setSearchParams)(p, f);
        let R = v && v.headers ? v.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), R), u.headers), {
          url: (0, e.toPathString)(p),
          options: P
        };
      }),
      /**
       *
       * @summary Returns the products of the requested Point of Sale, empty list if POS does not exist
       * @param {number} id The id of the point of sale
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointOfSaleProducts: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getAllPointOfSaleProducts", "id", i);
        const a = "/pointsofsale/{id}/products".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns all existing Point of Sales
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointsOfSale: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        const n = "/pointsofsale", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Returns a Point of Sale\'s associate users
       * @param {number} id The id of the Point of Sale of which to get the associate users.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getPointOfSaleAssociates: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getPointOfSaleAssociates", "id", i);
        const a = "/pointsofsale/{id}/associates".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns the requested Point of Sale
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePointOfSale: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSinglePointOfSale", "id", i);
        const a = "/pointsofsale/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns a Point of Sale transactions
       * @param {number} id The id of the Point of Sale of which to get the transactions.
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getTransactions: (c, o, i, ...t) => h(this, [c, o, i, ...t], void 0, function* (a, s, n, u = {}) {
        (0, e.assertParamExists)("getTransactions", "id", a);
        const d = "/pointsofsale/{id}/transactions".replace("{id}", encodeURIComponent(String(a))), p = new URL(d, e.DUMMY_BASE_URL);
        let v;
        r && (v = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, v), u), b = {}, f = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (f.take = s), n !== void 0 && (f.skip = n), (0, e.setSearchParams)(p, f);
        let R = v && v.headers ? v.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), R), u.headers), {
          url: (0, e.toPathString)(p),
          options: P
        };
      }),
      /**
       *
       * @summary Update an existing Point of Sale.
       * @param {number} id The id of the Point of Sale which should be updated
       * @param {UpdatePointOfSaleRequest} updatePointOfSaleRequest    The Point of Sale which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updatePointOfSale: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updatePointOfSale", "id", t), (0, e.assertParamExists)("updatePointOfSale", "updatePointOfSaleRequest", a);
        const n = "/pointsofsale/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      })
    };
  };
  l.PointofsaleApiAxiosParamCreator = is;
  const os = function(r) {
    const c = (0, l.PointofsaleApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Create a new Point of Sale.
       * @param {CreatePointOfSaleRequest} createPointOfSaleRequest The point of sale which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPointOfSale(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createPointOfSale(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["PointofsaleApi.createPointOfSale"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary (Soft) delete the given point of sale. Cannot be undone.
       * @param {number} id The id of the point of sale which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deletePointOfSale(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.deletePointOfSale(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["PointofsaleApi.deletePointOfSale"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Returns the containers of the requested Point of Sale, empty list if POS does not exist
       * @param {number} id The id of the point of sale
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointOfSaleContainers(o, i, t, a) {
        return h(this, void 0, void 0, function* () {
          var s, n, u;
          const d = yield c.getAllPointOfSaleContainers(o, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, v = (u = (n = A.operationServerMap["PointofsaleApi.getAllPointOfSaleContainers"]) === null || n === void 0 ? void 0 : n[p]) === null || u === void 0 ? void 0 : u.url;
          return (P, b) => (0, e.createRequestFunction)(d, O.default, A.BASE_PATH, r)(P, v || b);
        });
      },
      /**
       *
       * @summary Returns the products of the requested Point of Sale, empty list if POS does not exist
       * @param {number} id The id of the point of sale
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointOfSaleProducts(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getAllPointOfSaleProducts(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["PointofsaleApi.getAllPointOfSaleProducts"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Returns all existing Point of Sales
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointsOfSale(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllPointsOfSale(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["PointofsaleApi.getAllPointsOfSale"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Returns a Point of Sale\'s associate users
       * @param {number} id The id of the Point of Sale of which to get the associate users.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getPointOfSaleAssociates(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getPointOfSaleAssociates(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["PointofsaleApi.getPointOfSaleAssociates"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Returns the requested Point of Sale
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePointOfSale(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getSinglePointOfSale(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["PointofsaleApi.getSinglePointOfSale"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Returns a Point of Sale transactions
       * @param {number} id The id of the Point of Sale of which to get the transactions.
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getTransactions(o, i, t, a) {
        return h(this, void 0, void 0, function* () {
          var s, n, u;
          const d = yield c.getTransactions(o, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, v = (u = (n = A.operationServerMap["PointofsaleApi.getTransactions"]) === null || n === void 0 ? void 0 : n[p]) === null || u === void 0 ? void 0 : u.url;
          return (P, b) => (0, e.createRequestFunction)(d, O.default, A.BASE_PATH, r)(P, v || b);
        });
      },
      /**
       *
       * @summary Update an existing Point of Sale.
       * @param {number} id The id of the Point of Sale which should be updated
       * @param {UpdatePointOfSaleRequest} updatePointOfSaleRequest    The Point of Sale which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updatePointOfSale(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updatePointOfSale(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["PointofsaleApi.updatePointOfSale"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      }
    };
  };
  l.PointofsaleApiFp = os;
  const ls = function(r, c, o) {
    const i = (0, l.PointofsaleApiFp)(r);
    return {
      /**
       *
       * @summary Create a new Point of Sale.
       * @param {CreatePointOfSaleRequest} createPointOfSaleRequest The point of sale which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPointOfSale(t, a) {
        return i.createPointOfSale(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary (Soft) delete the given point of sale. Cannot be undone.
       * @param {number} id The id of the point of sale which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deletePointOfSale(t, a) {
        return i.deletePointOfSale(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Returns the containers of the requested Point of Sale, empty list if POS does not exist
       * @param {number} id The id of the point of sale
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointOfSaleContainers(t, a, s, n) {
        return i.getAllPointOfSaleContainers(t, a, s, n).then((u) => u(o, c));
      },
      /**
       *
       * @summary Returns the products of the requested Point of Sale, empty list if POS does not exist
       * @param {number} id The id of the point of sale
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointOfSaleProducts(t, a) {
        return i.getAllPointOfSaleProducts(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Returns all existing Point of Sales
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointsOfSale(t, a, s) {
        return i.getAllPointsOfSale(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Returns a Point of Sale\'s associate users
       * @param {number} id The id of the Point of Sale of which to get the associate users.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getPointOfSaleAssociates(t, a) {
        return i.getPointOfSaleAssociates(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Returns the requested Point of Sale
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePointOfSale(t, a) {
        return i.getSinglePointOfSale(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Returns a Point of Sale transactions
       * @param {number} id The id of the Point of Sale of which to get the transactions.
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getTransactions(t, a, s, n) {
        return i.getTransactions(t, a, s, n).then((u) => u(o, c));
      },
      /**
       *
       * @summary Update an existing Point of Sale.
       * @param {number} id The id of the Point of Sale which should be updated
       * @param {UpdatePointOfSaleRequest} updatePointOfSaleRequest    The Point of Sale which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updatePointOfSale(t, a, s) {
        return i.updatePointOfSale(t, a, s).then((n) => n(o, c));
      }
    };
  };
  l.PointofsaleApiFactory = ls;
  class cs extends A.BaseAPI {
    /**
     *
     * @summary Create a new Point of Sale.
     * @param {CreatePointOfSaleRequest} createPointOfSaleRequest The point of sale which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    createPointOfSale(c, o) {
      return (0, l.PointofsaleApiFp)(this.configuration).createPointOfSale(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary (Soft) delete the given point of sale. Cannot be undone.
     * @param {number} id The id of the point of sale which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    deletePointOfSale(c, o) {
      return (0, l.PointofsaleApiFp)(this.configuration).deletePointOfSale(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the containers of the requested Point of Sale, empty list if POS does not exist
     * @param {number} id The id of the point of sale
     * @param {number} [take] How many containers the endpoint should return
     * @param {number} [skip] How many containers should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getAllPointOfSaleContainers(c, o, i, t) {
      return (0, l.PointofsaleApiFp)(this.configuration).getAllPointOfSaleContainers(c, o, i, t).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the products of the requested Point of Sale, empty list if POS does not exist
     * @param {number} id The id of the point of sale
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getAllPointOfSaleProducts(c, o) {
      return (0, l.PointofsaleApiFp)(this.configuration).getAllPointOfSaleProducts(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all existing Point of Sales
     * @param {number} [take] How many points of sale the endpoint should return
     * @param {number} [skip] How many points of sale should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getAllPointsOfSale(c, o, i) {
      return (0, l.PointofsaleApiFp)(this.configuration).getAllPointsOfSale(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns a Point of Sale\'s associate users
     * @param {number} id The id of the Point of Sale of which to get the associate users.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getPointOfSaleAssociates(c, o) {
      return (0, l.PointofsaleApiFp)(this.configuration).getPointOfSaleAssociates(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested Point of Sale
     * @param {number} id The id of the Point of Sale which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getSinglePointOfSale(c, o) {
      return (0, l.PointofsaleApiFp)(this.configuration).getSinglePointOfSale(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns a Point of Sale transactions
     * @param {number} id The id of the Point of Sale of which to get the transactions.
     * @param {number} [take] How many transactions the endpoint should return
     * @param {number} [skip] How many transactions should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    getTransactions(c, o, i, t) {
      return (0, l.PointofsaleApiFp)(this.configuration).getTransactions(c, o, i, t).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Update an existing Point of Sale.
     * @param {number} id The id of the Point of Sale which should be updated
     * @param {UpdatePointOfSaleRequest} updatePointOfSaleRequest    The Point of Sale which should be updated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof PointofsaleApi
     */
    updatePointOfSale(c, o, i) {
      return (0, l.PointofsaleApiFp)(this.configuration).updatePointOfSale(c, o, i).then((t) => t(this.axios, this.basePath));
    }
  }
  l.PointofsaleApi = cs;
  const ds = function(r) {
    return {
      /**
       *
       * @summary Post a new productCategory.
       * @param {ProductCategoryRequest} productCategoryRequest The productCategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProductCategory: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createProductCategory", "productCategoryRequest", i);
        const a = "/productcategories", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns all existing productcategories
       * @param {number} [take] How many product categories the endpoint should return
       * @param {number} [skip] How many product categories should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProductCategories: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        const n = "/productcategories", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Returns the requested productcategory
       * @param {number} id The id of the productcategory which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProductCategory: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSingleProductCategory", "id", i);
        const a = "/productcategories/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Update an existing productcategory.
       * @param {number} id The id of the productcategory which should be returned
       * @param {ProductCategoryRequest} productCategoryRequest The productcategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductCategory: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateProductCategory", "id", t), (0, e.assertParamExists)("updateProductCategory", "productCategoryRequest", a);
        const n = "/productcategories/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      })
    };
  };
  l.ProductCategoriesApiAxiosParamCreator = ds;
  const us = function(r) {
    const c = (0, l.ProductCategoriesApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Post a new productCategory.
       * @param {ProductCategoryRequest} productCategoryRequest The productCategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProductCategory(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createProductCategory(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["ProductCategoriesApi.createProductCategory"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Returns all existing productcategories
       * @param {number} [take] How many product categories the endpoint should return
       * @param {number} [skip] How many product categories should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProductCategories(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllProductCategories(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["ProductCategoriesApi.getAllProductCategories"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Returns the requested productcategory
       * @param {number} id The id of the productcategory which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProductCategory(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getSingleProductCategory(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["ProductCategoriesApi.getSingleProductCategory"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Update an existing productcategory.
       * @param {number} id The id of the productcategory which should be returned
       * @param {ProductCategoryRequest} productCategoryRequest The productcategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductCategory(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateProductCategory(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["ProductCategoriesApi.updateProductCategory"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      }
    };
  };
  l.ProductCategoriesApiFp = us;
  const hs = function(r, c, o) {
    const i = (0, l.ProductCategoriesApiFp)(r);
    return {
      /**
       *
       * @summary Post a new productCategory.
       * @param {ProductCategoryRequest} productCategoryRequest The productCategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProductCategory(t, a) {
        return i.createProductCategory(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Returns all existing productcategories
       * @param {number} [take] How many product categories the endpoint should return
       * @param {number} [skip] How many product categories should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProductCategories(t, a, s) {
        return i.getAllProductCategories(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Returns the requested productcategory
       * @param {number} id The id of the productcategory which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProductCategory(t, a) {
        return i.getSingleProductCategory(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Update an existing productcategory.
       * @param {number} id The id of the productcategory which should be returned
       * @param {ProductCategoryRequest} productCategoryRequest The productcategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductCategory(t, a, s) {
        return i.updateProductCategory(t, a, s).then((n) => n(o, c));
      }
    };
  };
  l.ProductCategoriesApiFactory = hs;
  class ps extends A.BaseAPI {
    /**
     *
     * @summary Post a new productCategory.
     * @param {ProductCategoryRequest} productCategoryRequest The productCategory which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    createProductCategory(c, o) {
      return (0, l.ProductCategoriesApiFp)(this.configuration).createProductCategory(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all existing productcategories
     * @param {number} [take] How many product categories the endpoint should return
     * @param {number} [skip] How many product categories should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    getAllProductCategories(c, o, i) {
      return (0, l.ProductCategoriesApiFp)(this.configuration).getAllProductCategories(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested productcategory
     * @param {number} id The id of the productcategory which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    getSingleProductCategory(c, o) {
      return (0, l.ProductCategoriesApiFp)(this.configuration).getSingleProductCategory(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Update an existing productcategory.
     * @param {number} id The id of the productcategory which should be returned
     * @param {ProductCategoryRequest} productCategoryRequest The productcategory which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductCategoriesApi
     */
    updateProductCategory(c, o, i) {
      return (0, l.ProductCategoriesApiFp)(this.configuration).updateProductCategory(c, o, i).then((t) => t(this.axios, this.basePath));
    }
  }
  l.ProductCategoriesApi = ps;
  const vs = function(r) {
    return {
      /**
       *
       * @summary Create a new product.
       * @param {CreateProductRequest} createProductRequest The product which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProduct: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createProduct", "createProductRequest", i);
        const a = "/products", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary (Soft) delete the given product. Cannot be undone.
       * @param {number} id The id of the product which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteProduct: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteProduct", "id", i);
        const a = "/products/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns all existing products
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProducts: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        const n = "/products", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Returns the requested product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProduct: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSingleProduct", "id", i);
        const a = "/products/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Update an existing product.
       * @param {number} id The id of the product which should be updated
       * @param {UpdateProductRequest} updateProductRequest The product which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProduct: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateProduct", "id", t), (0, e.assertParamExists)("updateProduct", "updateProductRequest", a);
        const n = "/products/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Upload a new image for a product
       * @param {number} id The id of the product which should be returned
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductImage: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateProductImage", "id", t);
        const n = "/products/{id}/image".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "POST" }, d), s), v = {}, P = {}, b = new (r && r.formDataCtor || FormData)();
        yield (0, e.setBearerAuthToObject)(v, r), a !== void 0 && b.append("file", a), v["Content-Type"] = "multipart/form-data", (0, e.setSearchParams)(u, P);
        let f = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), f), s.headers), p.data = b, {
          url: (0, e.toPathString)(u),
          options: p
        };
      })
    };
  };
  l.ProductsApiAxiosParamCreator = vs;
  const As = function(r) {
    const c = (0, l.ProductsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Create a new product.
       * @param {CreateProductRequest} createProductRequest The product which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProduct(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createProduct(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["ProductsApi.createProduct"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary (Soft) delete the given product. Cannot be undone.
       * @param {number} id The id of the product which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteProduct(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.deleteProduct(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["ProductsApi.deleteProduct"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Returns all existing products
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProducts(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllProducts(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["ProductsApi.getAllProducts"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Returns the requested product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProduct(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getSingleProduct(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["ProductsApi.getSingleProduct"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Update an existing product.
       * @param {number} id The id of the product which should be updated
       * @param {UpdateProductRequest} updateProductRequest The product which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProduct(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateProduct(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["ProductsApi.updateProduct"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Upload a new image for a product
       * @param {number} id The id of the product which should be returned
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductImage(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateProductImage(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["ProductsApi.updateProductImage"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      }
    };
  };
  l.ProductsApiFp = As;
  const Os = function(r, c, o) {
    const i = (0, l.ProductsApiFp)(r);
    return {
      /**
       *
       * @summary Create a new product.
       * @param {CreateProductRequest} createProductRequest The product which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProduct(t, a) {
        return i.createProduct(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary (Soft) delete the given product. Cannot be undone.
       * @param {number} id The id of the product which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteProduct(t, a) {
        return i.deleteProduct(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Returns all existing products
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProducts(t, a, s) {
        return i.getAllProducts(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Returns the requested product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProduct(t, a) {
        return i.getSingleProduct(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Update an existing product.
       * @param {number} id The id of the product which should be updated
       * @param {UpdateProductRequest} updateProductRequest The product which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProduct(t, a, s) {
        return i.updateProduct(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Upload a new image for a product
       * @param {number} id The id of the product which should be returned
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductImage(t, a, s) {
        return i.updateProductImage(t, a, s).then((n) => n(o, c));
      }
    };
  };
  l.ProductsApiFactory = Os;
  class Ps extends A.BaseAPI {
    /**
     *
     * @summary Create a new product.
     * @param {CreateProductRequest} createProductRequest The product which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    createProduct(c, o) {
      return (0, l.ProductsApiFp)(this.configuration).createProduct(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary (Soft) delete the given product. Cannot be undone.
     * @param {number} id The id of the product which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    deleteProduct(c, o) {
      return (0, l.ProductsApiFp)(this.configuration).deleteProduct(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all existing products
     * @param {number} [take] How many products the endpoint should return
     * @param {number} [skip] How many products should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    getAllProducts(c, o, i) {
      return (0, l.ProductsApiFp)(this.configuration).getAllProducts(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested product
     * @param {number} id The id of the product which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    getSingleProduct(c, o) {
      return (0, l.ProductsApiFp)(this.configuration).getSingleProduct(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Update an existing product.
     * @param {number} id The id of the product which should be updated
     * @param {UpdateProductRequest} updateProductRequest The product which should be updated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    updateProduct(c, o, i) {
      return (0, l.ProductsApiFp)(this.configuration).updateProduct(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Upload a new image for a product
     * @param {number} id The id of the product which should be returned
     * @param {File} [file] file
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ProductsApi
     */
    updateProductImage(c, o, i) {
      return (0, l.ProductsApiFp)(this.configuration).updateProductImage(c, o, i).then((t) => t(this.axios, this.basePath));
    }
  }
  l.ProductsApi = Ps;
  const bs = function(r) {
    return {
      /**
       *
       * @summary Add new permissions to an existing role
       * @param {number} id The ID of the role which should get the new permissions
       * @param {Array<CreatePermissionParams>} createPermissionParams The permissions that need to be added
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      addPermissions: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("addPermissions", "id", t), (0, e.assertParamExists)("addPermissions", "createPermissionParams", a);
        const n = "/rbac/roles/{id}/permissions".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "POST" }, d), s), v = {}, P = {};
        v["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Create a new role
       * @param {UpdateRoleRequest} updateRoleRequest The role which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createRole: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createRole", "updateRoleRequest", i);
        const a = "/rbac/roles", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Delete a permission from an existing role
       * @param {number} id The ID of the role
       * @param {number} entity The entity of the permission
       * @param {number} action The action of the permission
       * @param {number} relation The relation of the permission
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deletePermission: (c, o, i, t, ...a) => h(this, [c, o, i, t, ...a], void 0, function* (s, n, u, d, p = {}) {
        (0, e.assertParamExists)("deletePermission", "id", s), (0, e.assertParamExists)("deletePermission", "entity", n), (0, e.assertParamExists)("deletePermission", "action", u), (0, e.assertParamExists)("deletePermission", "relation", d);
        const v = "/rbac/roles/{id}/permissions/{entity}/{action}/{relation}".replace("{id}", encodeURIComponent(String(s))).replace("{entity}", encodeURIComponent(String(n))).replace("{action}", encodeURIComponent(String(u))).replace("{relation}", encodeURIComponent(String(d))), P = new URL(v, e.DUMMY_BASE_URL);
        let b;
        r && (b = r.baseOptions);
        const f = Object.assign(Object.assign({ method: "DELETE" }, b), p), R = {}, y = {};
        (0, e.setSearchParams)(P, y);
        let E = b && b.headers ? b.headers : {};
        return f.headers = Object.assign(Object.assign(Object.assign({}, R), E), p.headers), {
          url: (0, e.toPathString)(P),
          options: f
        };
      }),
      /**
       *
       * @summary Delete an existing role
       * @param {number} id The ID of the role which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteRole: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteRole", "id", i);
        const a = "/rbac/roles/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get all existing roles
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllRoles: (...c) => h(this, [...c], void 0, function* (o = {}) {
        const i = "/rbac/roles", t = new URL(i, e.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const s = Object.assign(Object.assign({ method: "GET" }, a), o), n = {}, u = {};
        yield (0, e.setBearerAuthToObject)(n, r), (0, e.setSearchParams)(t, u);
        let d = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, n), d), o.headers), {
          url: (0, e.toPathString)(t),
          options: s
        };
      }),
      /**
       *
       * @summary Get a single existing role with its permissions
       * @param {number} id The ID of the role that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleRole: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSingleRole", "id", i);
        const a = "/rbac/roles/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Update an existing role
       * @param {number} id The ID of the role which should be updated
       * @param {UpdateRoleRequest} updateRoleRequest The role which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateRole: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateRole", "id", t), (0, e.assertParamExists)("updateRole", "updateRoleRequest", a);
        const n = "/rbac/roles/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      })
    };
  };
  l.RbacApiAxiosParamCreator = bs;
  const ms = function(r) {
    const c = (0, l.RbacApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Add new permissions to an existing role
       * @param {number} id The ID of the role which should get the new permissions
       * @param {Array<CreatePermissionParams>} createPermissionParams The permissions that need to be added
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      addPermissions(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.addPermissions(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["RbacApi.addPermissions"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Create a new role
       * @param {UpdateRoleRequest} updateRoleRequest The role which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createRole(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createRole(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["RbacApi.createRole"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Delete a permission from an existing role
       * @param {number} id The ID of the role
       * @param {number} entity The entity of the permission
       * @param {number} action The action of the permission
       * @param {number} relation The relation of the permission
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deletePermission(o, i, t, a, s) {
        return h(this, void 0, void 0, function* () {
          var n, u, d;
          const p = yield c.deletePermission(o, i, t, a, s), v = (n = r == null ? void 0 : r.serverIndex) !== null && n !== void 0 ? n : 0, P = (d = (u = A.operationServerMap["RbacApi.deletePermission"]) === null || u === void 0 ? void 0 : u[v]) === null || d === void 0 ? void 0 : d.url;
          return (b, f) => (0, e.createRequestFunction)(p, O.default, A.BASE_PATH, r)(b, P || f);
        });
      },
      /**
       *
       * @summary Delete an existing role
       * @param {number} id The ID of the role which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteRole(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.deleteRole(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["RbacApi.deleteRole"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Get all existing roles
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllRoles(o) {
        return h(this, void 0, void 0, function* () {
          var i, t, a;
          const s = yield c.getAllRoles(o), n = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (a = (t = A.operationServerMap["RbacApi.getAllRoles"]) === null || t === void 0 ? void 0 : t[n]) === null || a === void 0 ? void 0 : a.url;
          return (d, p) => (0, e.createRequestFunction)(s, O.default, A.BASE_PATH, r)(d, u || p);
        });
      },
      /**
       *
       * @summary Get a single existing role with its permissions
       * @param {number} id The ID of the role that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleRole(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getSingleRole(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["RbacApi.getSingleRole"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Update an existing role
       * @param {number} id The ID of the role which should be updated
       * @param {UpdateRoleRequest} updateRoleRequest The role which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateRole(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateRole(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["RbacApi.updateRole"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      }
    };
  };
  l.RbacApiFp = ms;
  const Ss = function(r, c, o) {
    const i = (0, l.RbacApiFp)(r);
    return {
      /**
       *
       * @summary Add new permissions to an existing role
       * @param {number} id The ID of the role which should get the new permissions
       * @param {Array<CreatePermissionParams>} createPermissionParams The permissions that need to be added
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      addPermissions(t, a, s) {
        return i.addPermissions(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Create a new role
       * @param {UpdateRoleRequest} updateRoleRequest The role which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createRole(t, a) {
        return i.createRole(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Delete a permission from an existing role
       * @param {number} id The ID of the role
       * @param {number} entity The entity of the permission
       * @param {number} action The action of the permission
       * @param {number} relation The relation of the permission
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deletePermission(t, a, s, n, u) {
        return i.deletePermission(t, a, s, n, u).then((d) => d(o, c));
      },
      /**
       *
       * @summary Delete an existing role
       * @param {number} id The ID of the role which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteRole(t, a) {
        return i.deleteRole(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Get all existing roles
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllRoles(t) {
        return i.getAllRoles(t).then((a) => a(o, c));
      },
      /**
       *
       * @summary Get a single existing role with its permissions
       * @param {number} id The ID of the role that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleRole(t, a) {
        return i.getSingleRole(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Update an existing role
       * @param {number} id The ID of the role which should be updated
       * @param {UpdateRoleRequest} updateRoleRequest The role which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateRole(t, a, s) {
        return i.updateRole(t, a, s).then((n) => n(o, c));
      }
    };
  };
  l.RbacApiFactory = Ss;
  class gs extends A.BaseAPI {
    /**
     *
     * @summary Add new permissions to an existing role
     * @param {number} id The ID of the role which should get the new permissions
     * @param {Array<CreatePermissionParams>} createPermissionParams The permissions that need to be added
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RbacApi
     */
    addPermissions(c, o, i) {
      return (0, l.RbacApiFp)(this.configuration).addPermissions(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Create a new role
     * @param {UpdateRoleRequest} updateRoleRequest The role which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RbacApi
     */
    createRole(c, o) {
      return (0, l.RbacApiFp)(this.configuration).createRole(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a permission from an existing role
     * @param {number} id The ID of the role
     * @param {number} entity The entity of the permission
     * @param {number} action The action of the permission
     * @param {number} relation The relation of the permission
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RbacApi
     */
    deletePermission(c, o, i, t, a) {
      return (0, l.RbacApiFp)(this.configuration).deletePermission(c, o, i, t, a).then((s) => s(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete an existing role
     * @param {number} id The ID of the role which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RbacApi
     */
    deleteRole(c, o) {
      return (0, l.RbacApiFp)(this.configuration).deleteRole(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all existing roles
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RbacApi
     */
    getAllRoles(c) {
      return (0, l.RbacApiFp)(this.configuration).getAllRoles(c).then((o) => o(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a single existing role with its permissions
     * @param {number} id The ID of the role that should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RbacApi
     */
    getSingleRole(c, o) {
      return (0, l.RbacApiFp)(this.configuration).getSingleRole(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Update an existing role
     * @param {number} id The ID of the role which should be updated
     * @param {UpdateRoleRequest} updateRoleRequest The role which should be updated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RbacApi
     */
    updateRole(c, o, i) {
      return (0, l.RbacApiFp)(this.configuration).updateRole(c, o, i).then((t) => t(this.axios, this.basePath));
    }
  }
  l.RbacApi = gs;
  const fs = function(r) {
    return {
      /**
       *
       * @summary Ping the backend to check whether everything is working correctly
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ping: (...c) => h(this, [...c], void 0, function* (o = {}) {
        const i = "/ping", t = new URL(i, e.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const s = Object.assign(Object.assign({ method: "GET" }, a), o), n = {}, u = {};
        (0, e.setSearchParams)(t, u);
        let d = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, n), d), o.headers), {
          url: (0, e.toPathString)(t),
          options: s
        };
      })
    };
  };
  l.RootApiAxiosParamCreator = fs;
  const js = function(r) {
    const c = (0, l.RootApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Ping the backend to check whether everything is working correctly
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ping(o) {
        return h(this, void 0, void 0, function* () {
          var i, t, a;
          const s = yield c.ping(o), n = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (a = (t = A.operationServerMap["RootApi.ping"]) === null || t === void 0 ? void 0 : t[n]) === null || a === void 0 ? void 0 : a.url;
          return (d, p) => (0, e.createRequestFunction)(s, O.default, A.BASE_PATH, r)(d, u || p);
        });
      }
    };
  };
  l.RootApiFp = js;
  const Us = function(r, c, o) {
    const i = (0, l.RootApiFp)(r);
    return {
      /**
       *
       * @summary Ping the backend to check whether everything is working correctly
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ping(t) {
        return i.ping(t).then((a) => a(o, c));
      }
    };
  };
  l.RootApiFactory = Us;
  class Rs extends A.BaseAPI {
    /**
     *
     * @summary Ping the backend to check whether everything is working correctly
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RootApi
     */
    ping(c) {
      return (0, l.RootApiFp)(this.configuration).ping(c).then((o) => o(this.axios, this.basePath));
    }
  }
  l.RootApi = Rs;
  const _s = function(r) {
    return {
      /**
       *
       * @summary Start the stripe deposit flow
       * @param {StripeRequest} stripeRequest The deposit that should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deposit: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deposit", "stripeRequest", i);
        const a = "/stripe/deposit", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      })
    };
  };
  l.StripeApiAxiosParamCreator = _s;
  const Vs = function(r) {
    const c = (0, l.StripeApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Start the stripe deposit flow
       * @param {StripeRequest} stripeRequest The deposit that should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deposit(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.deposit(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["StripeApi.deposit"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      }
    };
  };
  l.StripeApiFp = Vs;
  const ys = function(r, c, o) {
    const i = (0, l.StripeApiFp)(r);
    return {
      /**
       *
       * @summary Start the stripe deposit flow
       * @param {StripeRequest} stripeRequest The deposit that should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deposit(t, a) {
        return i.deposit(t, a).then((s) => s(o, c));
      }
    };
  };
  l.StripeApiFactory = ys;
  class Es extends A.BaseAPI {
    /**
     *
     * @summary Start the stripe deposit flow
     * @param {StripeRequest} stripeRequest The deposit that should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof StripeApi
     */
    deposit(c, o) {
      return (0, l.StripeApiFp)(this.configuration).deposit(c, o).then((i) => i(this.axios, this.basePath));
    }
  }
  l.StripeApi = Es;
  const Ts = function(r) {
    return {
      /**
       *
       * @summary Get a beautiful Hello World email to your inbox
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      helloworld: (...c) => h(this, [...c], void 0, function* (o = {}) {
        const i = "/test/helloworld", t = new URL(i, e.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const s = Object.assign(Object.assign({ method: "POST" }, a), o), n = {}, u = {};
        yield (0, e.setBearerAuthToObject)(n, r), (0, e.setSearchParams)(t, u);
        let d = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, n), d), o.headers), {
          url: (0, e.toPathString)(t),
          options: s
        };
      })
    };
  };
  l.TestOperationsOfTheTestControllerApiAxiosParamCreator = Ts;
  const Bs = function(r) {
    const c = (0, l.TestOperationsOfTheTestControllerApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Get a beautiful Hello World email to your inbox
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      helloworld(o) {
        return h(this, void 0, void 0, function* () {
          var i, t, a;
          const s = yield c.helloworld(o), n = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (a = (t = A.operationServerMap["TestOperationsOfTheTestControllerApi.helloworld"]) === null || t === void 0 ? void 0 : t[n]) === null || a === void 0 ? void 0 : a.url;
          return (d, p) => (0, e.createRequestFunction)(s, O.default, A.BASE_PATH, r)(d, u || p);
        });
      }
    };
  };
  l.TestOperationsOfTheTestControllerApiFp = Bs;
  const Fs = function(r, c, o) {
    const i = (0, l.TestOperationsOfTheTestControllerApiFp)(r);
    return {
      /**
       *
       * @summary Get a beautiful Hello World email to your inbox
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      helloworld(t) {
        return i.helloworld(t).then((a) => a(o, c));
      }
    };
  };
  l.TestOperationsOfTheTestControllerApiFactory = Fs;
  class Cs extends A.BaseAPI {
    /**
     *
     * @summary Get a beautiful Hello World email to your inbox
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TestOperationsOfTheTestControllerApi
     */
    helloworld(c) {
      return (0, l.TestOperationsOfTheTestControllerApiFp)(this.configuration).helloworld(c).then((o) => o(this.axios, this.basePath));
    }
  }
  l.TestOperationsOfTheTestControllerApi = Cs;
  const Is = function(r) {
    return {
      /**
       *
       * @summary Creates a new transaction
       * @param {TransactionRequest} transactionRequest The transaction which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransaction: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createTransaction", "transactionRequest", i);
        const a = "/transactions", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Deletes a transaction
       * @param {number} id The id of the transaction which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteTransaction: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteTransaction", "id", i);
        const a = "/transactions/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get a list of all transactions
       * @param {number} [fromId] From-user for selected transactions
       * @param {number} [createdById] User that created selected transaction
       * @param {number} [toId] To-user for selected transactions transactions. Requires ContainerId
       * @param {number} [pointOfSaleId] Point of sale ID for selected transactions
       * @param {number} [productId] Product ID for selected transactions
       * @param {number} [productRevision] Product Revision for selected transactions. Requires ProductID
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllTransactions: (c, o, i, t, a, s, n, u, d, p, ...v) => h(this, [c, o, i, t, a, s, n, u, d, p, ...v], void 0, function* (P, b, f, R, y, E, I, C, F, L, x = {}) {
        const X = "/transactions", G = new URL(X, e.DUMMY_BASE_URL);
        let z;
        r && (z = r.baseOptions);
        const le = Object.assign(Object.assign({ method: "GET" }, z), x), he = {}, D = {};
        yield (0, e.setBearerAuthToObject)(he, r), P !== void 0 && (D.fromId = P), b !== void 0 && (D.createdById = b), f !== void 0 && (D.toId = f), R !== void 0 && (D.pointOfSaleId = R), y !== void 0 && (D.productId = y), E !== void 0 && (D.productRevision = E), I !== void 0 && (D.fromDate = I), C !== void 0 && (D.tillDate = C), F !== void 0 && (D.take = F), L !== void 0 && (D.skip = L), (0, e.setSearchParams)(G, D);
        let ie = z && z.headers ? z.headers : {};
        return le.headers = Object.assign(Object.assign(Object.assign({}, he), ie), x.headers), {
          url: (0, e.toPathString)(G),
          options: le
        };
      }),
      /**
       *
       * @summary Get a single transaction
       * @param {number} id The id of the transaction which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransaction: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSingleTransaction", "id", i);
        const a = "/transactions/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Updates the requested transaction
       * @param {number} id The id of the transaction which should be updated
       * @param {TransactionRequest} transactionRequest The updated transaction
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateTransaction: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateTransaction", "id", t), (0, e.assertParamExists)("updateTransaction", "transactionRequest", a);
        const n = "/transactions/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Function to validate the transaction immediatly after it is created
       * @param {TransactionRequest} transactionRequest The transaction which should be validated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      validateTransaction: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("validateTransaction", "transactionRequest", i);
        const a = "/transactions/validate", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      })
    };
  };
  l.TransactionsApiAxiosParamCreator = Is;
  const ws = function(r) {
    const c = (0, l.TransactionsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Creates a new transaction
       * @param {TransactionRequest} transactionRequest The transaction which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransaction(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createTransaction(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["TransactionsApi.createTransaction"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Deletes a transaction
       * @param {number} id The id of the transaction which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteTransaction(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.deleteTransaction(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["TransactionsApi.deleteTransaction"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Get a list of all transactions
       * @param {number} [fromId] From-user for selected transactions
       * @param {number} [createdById] User that created selected transaction
       * @param {number} [toId] To-user for selected transactions transactions. Requires ContainerId
       * @param {number} [pointOfSaleId] Point of sale ID for selected transactions
       * @param {number} [productId] Product ID for selected transactions
       * @param {number} [productRevision] Product Revision for selected transactions. Requires ProductID
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllTransactions(o, i, t, a, s, n, u, d, p, v, P) {
        return h(this, void 0, void 0, function* () {
          var b, f, R;
          const y = yield c.getAllTransactions(o, i, t, a, s, n, u, d, p, v, P), E = (b = r == null ? void 0 : r.serverIndex) !== null && b !== void 0 ? b : 0, I = (R = (f = A.operationServerMap["TransactionsApi.getAllTransactions"]) === null || f === void 0 ? void 0 : f[E]) === null || R === void 0 ? void 0 : R.url;
          return (C, F) => (0, e.createRequestFunction)(y, O.default, A.BASE_PATH, r)(C, I || F);
        });
      },
      /**
       *
       * @summary Get a single transaction
       * @param {number} id The id of the transaction which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransaction(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getSingleTransaction(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["TransactionsApi.getSingleTransaction"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Updates the requested transaction
       * @param {number} id The id of the transaction which should be updated
       * @param {TransactionRequest} transactionRequest The updated transaction
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateTransaction(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateTransaction(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["TransactionsApi.updateTransaction"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Function to validate the transaction immediatly after it is created
       * @param {TransactionRequest} transactionRequest The transaction which should be validated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      validateTransaction(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.validateTransaction(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["TransactionsApi.validateTransaction"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      }
    };
  };
  l.TransactionsApiFp = ws;
  const Ms = function(r, c, o) {
    const i = (0, l.TransactionsApiFp)(r);
    return {
      /**
       *
       * @summary Creates a new transaction
       * @param {TransactionRequest} transactionRequest The transaction which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransaction(t, a) {
        return i.createTransaction(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Deletes a transaction
       * @param {number} id The id of the transaction which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteTransaction(t, a) {
        return i.deleteTransaction(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Get a list of all transactions
       * @param {number} [fromId] From-user for selected transactions
       * @param {number} [createdById] User that created selected transaction
       * @param {number} [toId] To-user for selected transactions transactions. Requires ContainerId
       * @param {number} [pointOfSaleId] Point of sale ID for selected transactions
       * @param {number} [productId] Product ID for selected transactions
       * @param {number} [productRevision] Product Revision for selected transactions. Requires ProductID
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllTransactions(t, a, s, n, u, d, p, v, P, b, f) {
        return i.getAllTransactions(t, a, s, n, u, d, p, v, P, b, f).then((R) => R(o, c));
      },
      /**
       *
       * @summary Get a single transaction
       * @param {number} id The id of the transaction which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransaction(t, a) {
        return i.getSingleTransaction(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Updates the requested transaction
       * @param {number} id The id of the transaction which should be updated
       * @param {TransactionRequest} transactionRequest The updated transaction
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateTransaction(t, a, s) {
        return i.updateTransaction(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Function to validate the transaction immediatly after it is created
       * @param {TransactionRequest} transactionRequest The transaction which should be validated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      validateTransaction(t, a) {
        return i.validateTransaction(t, a).then((s) => s(o, c));
      }
    };
  };
  l.TransactionsApiFactory = Ms;
  class xs extends A.BaseAPI {
    /**
     *
     * @summary Creates a new transaction
     * @param {TransactionRequest} transactionRequest The transaction which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    createTransaction(c, o) {
      return (0, l.TransactionsApiFp)(this.configuration).createTransaction(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Deletes a transaction
     * @param {number} id The id of the transaction which should be deleted
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    deleteTransaction(c, o) {
      return (0, l.TransactionsApiFp)(this.configuration).deleteTransaction(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a list of all transactions
     * @param {number} [fromId] From-user for selected transactions
     * @param {number} [createdById] User that created selected transaction
     * @param {number} [toId] To-user for selected transactions transactions. Requires ContainerId
     * @param {number} [pointOfSaleId] Point of sale ID for selected transactions
     * @param {number} [productId] Product ID for selected transactions
     * @param {number} [productRevision] Product Revision for selected transactions. Requires ProductID
     * @param {string} [fromDate] Start date for selected transactions (inclusive)
     * @param {string} [tillDate] End date for selected transactions (exclusive)
     * @param {number} [take] How many transactions the endpoint should return
     * @param {number} [skip] How many transactions should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    getAllTransactions(c, o, i, t, a, s, n, u, d, p, v) {
      return (0, l.TransactionsApiFp)(this.configuration).getAllTransactions(c, o, i, t, a, s, n, u, d, p, v).then((P) => P(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a single transaction
     * @param {number} id The id of the transaction which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    getSingleTransaction(c, o) {
      return (0, l.TransactionsApiFp)(this.configuration).getSingleTransaction(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Updates the requested transaction
     * @param {number} id The id of the transaction which should be updated
     * @param {TransactionRequest} transactionRequest The updated transaction
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    updateTransaction(c, o, i) {
      return (0, l.TransactionsApiFp)(this.configuration).updateTransaction(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Function to validate the transaction immediatly after it is created
     * @param {TransactionRequest} transactionRequest The transaction which should be validated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransactionsApi
     */
    validateTransaction(c, o) {
      return (0, l.TransactionsApiFp)(this.configuration).validateTransaction(c, o).then((i) => i(this.axios, this.basePath));
    }
  }
  l.TransactionsApi = xs;
  const Ls = function(r) {
    return {
      /**
       *
       * @summary Post a new transfer.
       * @param {TransferRequest} transferRequest The transfer which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransfer: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createTransfer", "transferRequest", i);
        const a = "/transfers", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns all existing transfers
       * @param {number} [take] How many transfers the endpoint should return
       * @param {number} [skip] How many transfers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllTransfers: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        const n = "/transfers", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Returns the requested transfer
       * @param {number} id The id of the transfer which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransfer: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSingleTransfer", "id", i);
        const a = "/transfers/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      })
    };
  };
  l.TransfersApiAxiosParamCreator = Ls;
  const qs = function(r) {
    const c = (0, l.TransfersApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Post a new transfer.
       * @param {TransferRequest} transferRequest The transfer which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransfer(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createTransfer(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["TransfersApi.createTransfer"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Returns all existing transfers
       * @param {number} [take] How many transfers the endpoint should return
       * @param {number} [skip] How many transfers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllTransfers(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllTransfers(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["TransfersApi.getAllTransfers"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Returns the requested transfer
       * @param {number} id The id of the transfer which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransfer(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getSingleTransfer(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["TransfersApi.getSingleTransfer"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      }
    };
  };
  l.TransfersApiFp = qs;
  const Ds = function(r, c, o) {
    const i = (0, l.TransfersApiFp)(r);
    return {
      /**
       *
       * @summary Post a new transfer.
       * @param {TransferRequest} transferRequest The transfer which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransfer(t, a) {
        return i.createTransfer(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Returns all existing transfers
       * @param {number} [take] How many transfers the endpoint should return
       * @param {number} [skip] How many transfers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllTransfers(t, a, s) {
        return i.getAllTransfers(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Returns the requested transfer
       * @param {number} id The id of the transfer which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransfer(t, a) {
        return i.getSingleTransfer(t, a).then((s) => s(o, c));
      }
    };
  };
  l.TransfersApiFactory = Ds;
  class Hs extends A.BaseAPI {
    /**
     *
     * @summary Post a new transfer.
     * @param {TransferRequest} transferRequest The transfer which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransfersApi
     */
    createTransfer(c, o) {
      return (0, l.TransfersApiFp)(this.configuration).createTransfer(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all existing transfers
     * @param {number} [take] How many transfers the endpoint should return
     * @param {number} [skip] How many transfers should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransfersApi
     */
    getAllTransfers(c, o, i) {
      return (0, l.TransfersApiFp)(this.configuration).getAllTransfers(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested transfer
     * @param {number} id The id of the transfer which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TransfersApi
     */
    getSingleTransfer(c, o) {
      return (0, l.TransfersApiFp)(this.configuration).getSingleTransfer(c, o).then((i) => i(this.axios, this.basePath));
    }
  }
  l.TransfersApi = Hs;
  const Ns = function(r) {
    return {
      /**
       *
       * @summary Accept the Terms of Service if you have not accepted it yet
       * @param {AcceptTosRequest} acceptTosRequest \&quot;Tosrequest body\&quot;
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      acceptTos: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("acceptTos", "acceptTosRequest", i);
        const a = "/users/acceptTos", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Authenticate as another user
       * @param {number} id The id of the user that should be authenticated as
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      authenticateAs: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("authenticateAs", "id", i);
        const a = "/users/{id}/authenticate".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Create a new user
       * @param {CreateUserRequest} createUserRequest The user which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createUser: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createUser", "createUserRequest", i);
        const a = "/users", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Delete a single user
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUser: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteUser", "id", i);
        const a = "/users/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Delete a users key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserKey: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteUserKey", "id", i);
        const a = "/users/{id}/authenticator/key".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Delete a nfc code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserNfc: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("deleteUserNfc", "id", i);
        const a = "/users/{id}/authenticator/nfc".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get a list of all users
       * @param {number} [take] How many users the endpoint should return
       * @param {number} [skip] How many users should be skipped (for pagination)
       * @param {string} [search] Filter based on first name
       * @param {boolean} [active] Filter based if the user is active
       * @param {boolean} [ofAge] Filter based if the user is 18+
       * @param {number} [id] Filter based on user ID
       * @param {GetAllUsersTypeEnum} [type] Filter based on user type.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllUsers: (c, o, i, t, a, s, n, ...u) => h(this, [c, o, i, t, a, s, n, ...u], void 0, function* (d, p, v, P, b, f, R, y = {}) {
        const E = "/users", I = new URL(E, e.DUMMY_BASE_URL);
        let C;
        r && (C = r.baseOptions);
        const F = Object.assign(Object.assign({ method: "GET" }, C), y), L = {}, x = {};
        yield (0, e.setBearerAuthToObject)(L, r), d !== void 0 && (x.take = d), p !== void 0 && (x.skip = p), v !== void 0 && (x.search = v), P !== void 0 && (x.active = P), b !== void 0 && (x.ofAge = b), f !== void 0 && (x.id = f), R !== void 0 && (x.type = R), (0, e.setSearchParams)(I, x);
        let X = C && C.headers ? C.headers : {};
        return F.headers = Object.assign(Object.assign(Object.assign({}, L), X), y.headers), {
          url: (0, e.toPathString)(I),
          options: F
        };
      }),
      /**
       *
       * @summary Get all users of user type
       * @param {string} userType The userType of the requested users
       * @param {number} [take] How many users the endpoint should return
       * @param {number} [skip] How many users should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllUsersOfUserType: (c, o, i, ...t) => h(this, [c, o, i, ...t], void 0, function* (a, s, n, u = {}) {
        (0, e.assertParamExists)("getAllUsersOfUserType", "userType", a);
        const d = "/users/usertype/{userType}".replace("{userType}", encodeURIComponent(String(a))), p = new URL(d, e.DUMMY_BASE_URL);
        let v;
        r && (v = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, v), u), b = {}, f = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (f.take = s), n !== void 0 && (f.skip = n), (0, e.setSearchParams)(p, f);
        let R = v && v.headers ? v.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), R), u.headers), {
          url: (0, e.toPathString)(p),
          options: P
        };
      }),
      /**
       *
       * @summary Get an individual user
       * @param {number} id userID
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getIndividualUser: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getIndividualUser", "id", i);
        const a = "/users/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get an organs members
       * @param {number} id The id of the user
       * @param {number} [take] How many members the endpoint should return
       * @param {number} [skip] How many members should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getOrganMembers: (c, o, i, ...t) => h(this, [c, o, i, ...t], void 0, function* (a, s, n, u = {}) {
        (0, e.assertParamExists)("getOrganMembers", "id", a);
        const d = "/users/{id}/members".replace("{id}", encodeURIComponent(String(a))), p = new URL(d, e.DUMMY_BASE_URL);
        let v;
        r && (v = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, v), u), b = {}, f = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (f.take = s), n !== void 0 && (f.skip = n), (0, e.setSearchParams)(p, f);
        let R = v && v.headers ? v.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), R), u.headers), {
          url: (0, e.toPathString)(p),
          options: P
        };
      }),
      /**
       *
       * @summary Get all users that the user can authenticate as
       * @param {number} id The id of the user to get authentications of
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserAuthenticatable: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getUserAuthenticatable", "id", i);
        const a = "/users/{id}/authenticate".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get all roles assigned to the user.
       * @param {number} id The id of the user to get the roles from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserRoles: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getUserRoles", "id", i);
        const a = "/users/{id}/roles".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns the user\'s containers
       * @param {number} id The id of the user
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersContainers: (c, o, i, ...t) => h(this, [c, o, i, ...t], void 0, function* (a, s, n, u = {}) {
        (0, e.assertParamExists)("getUsersContainers", "id", a);
        const d = "/users/{id}/containers".replace("{id}", encodeURIComponent(String(a))), p = new URL(d, e.DUMMY_BASE_URL);
        let v;
        r && (v = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, v), u), b = {}, f = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (f.take = s), n !== void 0 && (f.skip = n), (0, e.setSearchParams)(p, f);
        let R = v && v.headers ? v.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), R), u.headers), {
          url: (0, e.toPathString)(p),
          options: P
        };
      }),
      /**
       *
       * @summary Get all financial mutations of a user (from or to).
       * @param {number} id The id of the user to get the mutations from
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersFinancialMutations: (c, o, i, t, a, ...s) => h(this, [c, o, i, t, a, ...s], void 0, function* (n, u, d, p, v, P = {}) {
        (0, e.assertParamExists)("getUsersFinancialMutations", "id", n);
        const b = "/users/{id}/financialmutations".replace("{id}", encodeURIComponent(String(n))), f = new URL(b, e.DUMMY_BASE_URL);
        let R;
        r && (R = r.baseOptions);
        const y = Object.assign(Object.assign({ method: "GET" }, R), P), E = {}, I = {};
        yield (0, e.setBearerAuthToObject)(E, r), u !== void 0 && (I.fromDate = u), d !== void 0 && (I.tillDate = d), p !== void 0 && (I.take = p), v !== void 0 && (I.skip = v), (0, e.setSearchParams)(f, I);
        let C = R && R.headers ? R.headers : {};
        return y.headers = Object.assign(Object.assign(Object.assign({}, E), C), P.headers), {
          url: (0, e.toPathString)(f),
          options: y
        };
      }),
      /**
       *
       * @summary Returns the user\'s Points of Sale
       * @param {number} id The id of the user
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersPointsOfSale: (c, o, i, ...t) => h(this, [c, o, i, ...t], void 0, function* (a, s, n, u = {}) {
        (0, e.assertParamExists)("getUsersPointsOfSale", "id", a);
        const d = "/users/{id}/pointsofsale".replace("{id}", encodeURIComponent(String(a))), p = new URL(d, e.DUMMY_BASE_URL);
        let v;
        r && (v = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, v), u), b = {}, f = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (f.take = s), n !== void 0 && (f.skip = n), (0, e.setSearchParams)(p, f);
        let R = v && v.headers ? v.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), R), u.headers), {
          url: (0, e.toPathString)(p),
          options: P
        };
      }),
      /**
       *
       * @summary Get all deposits of a user that are still being processed by Stripe
       * @param {number} id The id of the user to get the deposits from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProcessingDeposits: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getUsersProcessingDeposits", "id", i);
        const a = "/users/{id}/deposits".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get an user\'s products
       * @param {number} id The id of the user
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProducts: (c, o, i, ...t) => h(this, [c, o, i, ...t], void 0, function* (a, s, n, u = {}) {
        (0, e.assertParamExists)("getUsersProducts", "id", a);
        const d = "/users/{id}/products".replace("{id}", encodeURIComponent(String(a))), p = new URL(d, e.DUMMY_BASE_URL);
        let v;
        r && (v = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, v), u), b = {}, f = {};
        yield (0, e.setBearerAuthToObject)(b, r), s !== void 0 && (f.take = s), n !== void 0 && (f.skip = n), (0, e.setSearchParams)(p, f);
        let R = v && v.headers ? v.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), R), u.headers), {
          url: (0, e.toPathString)(p),
          options: P
        };
      }),
      /**
       *
       * @summary Get transactions from a user.
       * @param {number} id The id of the user that should be involved in all returned transactions
       * @param {number} [fromId] From-user for selected transactions
       * @param {number} [createdById] User that created selected transaction
       * @param {number} [toId] To-user for selected transactions transactions. Requires ContainerId
       * @param {number} [productId] Product ID for selected transactions
       * @param {number} [productRevision] Product Revision for selected transactions. Requires ProductID
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransactions: (c, o, i, t, a, s, n, u, d, p, ...v) => h(this, [c, o, i, t, a, s, n, u, d, p, ...v], void 0, function* (P, b, f, R, y, E, I, C, F, L, x = {}) {
        (0, e.assertParamExists)("getUsersTransactions", "id", P);
        const X = "/users/{id}/transactions".replace("{id}", encodeURIComponent(String(P))), G = new URL(X, e.DUMMY_BASE_URL);
        let z;
        r && (z = r.baseOptions);
        const le = Object.assign(Object.assign({ method: "GET" }, z), x), he = {}, D = {};
        yield (0, e.setBearerAuthToObject)(he, r), b !== void 0 && (D.fromId = b), f !== void 0 && (D.createdById = f), R !== void 0 && (D.toId = R), y !== void 0 && (D.productId = y), E !== void 0 && (D.productRevision = E), I !== void 0 && (D.fromDate = I), C !== void 0 && (D.tillDate = C), F !== void 0 && (D.take = F), L !== void 0 && (D.skip = L), (0, e.setSearchParams)(G, D);
        let ie = z && z.headers ? z.headers : {};
        return le.headers = Object.assign(Object.assign(Object.assign({}, he), ie), x.headers), {
          url: (0, e.toPathString)(G),
          options: le
        };
      }),
      /**
       *
       * @summary Get transaction report for the given user
       * @param {number} id The id of the user to get the transaction report from
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [fromId] From-user for selected transactions
       * @param {number} [toId] To-user for selected transactions
       * @param {boolean} [exclusiveToId] If all sub-transactions should be to the toId user, default true
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransactionsReport: (c, o, i, t, a, s, ...n) => h(this, [c, o, i, t, a, s, ...n], void 0, function* (u, d, p, v, P, b, f = {}) {
        (0, e.assertParamExists)("getUsersTransactionsReport", "id", u);
        const R = "/users/{id}/transactions/report".replace("{id}", encodeURIComponent(String(u))), y = new URL(R, e.DUMMY_BASE_URL);
        let E;
        r && (E = r.baseOptions);
        const I = Object.assign(Object.assign({ method: "GET" }, E), f), C = {}, F = {};
        yield (0, e.setBearerAuthToObject)(C, r), d !== void 0 && (F.fromDate = d), p !== void 0 && (F.tillDate = p), v !== void 0 && (F.fromId = v), P !== void 0 && (F.toId = P), b !== void 0 && (F.exclusiveToId = b), (0, e.setSearchParams)(y, F);
        let L = E && E.headers ? E.headers : {};
        return I.headers = Object.assign(Object.assign(Object.assign({}, C), L), f.headers), {
          url: (0, e.toPathString)(y),
          options: I
        };
      }),
      /**
       *
       * @summary Get transfers to or from an user.
       * @param {number} id The id of the user that should be involved in all returned transfers
       * @param {number} [take] How many transfers the endpoint should return
       * @param {number} [skip] How many transfers should be skipped (for pagination)
       * @param {number} [fromId] From-user for selected transfers
       * @param {number} [toId] To-user for selected transfers
       * @param {number} [id2] ID of selected transfers
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransfers: (c, o, i, t, a, s, ...n) => h(this, [c, o, i, t, a, s, ...n], void 0, function* (u, d, p, v, P, b, f = {}) {
        (0, e.assertParamExists)("getUsersTransfers", "id", u);
        const R = "/users/{id}/transfers".replace("{id}", encodeURIComponent(String(u))), y = new URL(R, e.DUMMY_BASE_URL);
        let E;
        r && (E = r.baseOptions);
        const I = Object.assign(Object.assign({ method: "GET" }, E), f), C = {}, F = {};
        yield (0, e.setBearerAuthToObject)(C, r), d !== void 0 && (F.take = d), p !== void 0 && (F.skip = p), v !== void 0 && (F.fromId = v), P !== void 0 && (F.toId = P), b !== void 0 && (F.id = b), (0, e.setSearchParams)(y, F);
        let L = E && E.headers ? E.headers : {};
        return I.headers = Object.assign(Object.assign(Object.assign({}, C), L), f.headers), {
          url: (0, e.toPathString)(y),
          options: I
        };
      }),
      /**
       *
       * @summary Update a user
       * @param {number} id The id of the user
       * @param {UpdateUserRequest} updateUserRequest The user which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUser: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateUser", "id", t), (0, e.assertParamExists)("updateUser", "updateUserRequest", a);
        const n = "/users/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary POST an users update to new key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserKey: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("updateUserKey", "id", i);
        const a = "/users/{id}/authenticator/key".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Put a user\'s local password
       * @param {number} id The id of the user
       * @param {UpdateLocalRequest} updateLocalRequest    The password update
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserLocalPassword: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateUserLocalPassword", "id", t), (0, e.assertParamExists)("updateUserLocalPassword", "updateLocalRequest", a);
        const n = "/users/{id}/authenticator/local".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PUT" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Put a users NFC code
       * @param {number} id The id of the user
       * @param {UpdateNfcRequest} updateNfcRequest    The NFC code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserNfc: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateUserNfc", "id", t), (0, e.assertParamExists)("updateUserNfc", "updateNfcRequest", a);
        const n = "/users/{id}/authenticator/nfc".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PUT" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Put an users pin code
       * @param {number} id The id of the user
       * @param {UpdatePinRequest} updatePinRequest    The PIN code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserPin: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateUserPin", "id", t), (0, e.assertParamExists)("updateUserPin", "updatePinRequest", a);
        const n = "/users/{id}/authenticator/pin".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PUT" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Waive all given user\'s fines
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      waiveUserFines: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("waiveUserFines", "id", i);
        const a = "/users/{id}/fines/waive".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      })
    };
  };
  l.UsersApiAxiosParamCreator = Ns;
  const Gs = function(r) {
    const c = (0, l.UsersApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Accept the Terms of Service if you have not accepted it yet
       * @param {AcceptTosRequest} acceptTosRequest \&quot;Tosrequest body\&quot;
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      acceptTos(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.acceptTos(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["UsersApi.acceptTos"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Authenticate as another user
       * @param {number} id The id of the user that should be authenticated as
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      authenticateAs(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.authenticateAs(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["UsersApi.authenticateAs"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Create a new user
       * @param {CreateUserRequest} createUserRequest The user which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createUser(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createUser(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["UsersApi.createUser"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Delete a single user
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUser(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.deleteUser(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["UsersApi.deleteUser"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Delete a users key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserKey(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.deleteUserKey(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["UsersApi.deleteUserKey"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Delete a nfc code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserNfc(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.deleteUserNfc(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["UsersApi.deleteUserNfc"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Get a list of all users
       * @param {number} [take] How many users the endpoint should return
       * @param {number} [skip] How many users should be skipped (for pagination)
       * @param {string} [search] Filter based on first name
       * @param {boolean} [active] Filter based if the user is active
       * @param {boolean} [ofAge] Filter based if the user is 18+
       * @param {number} [id] Filter based on user ID
       * @param {GetAllUsersTypeEnum} [type] Filter based on user type.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllUsers(o, i, t, a, s, n, u, d) {
        return h(this, void 0, void 0, function* () {
          var p, v, P;
          const b = yield c.getAllUsers(o, i, t, a, s, n, u, d), f = (p = r == null ? void 0 : r.serverIndex) !== null && p !== void 0 ? p : 0, R = (P = (v = A.operationServerMap["UsersApi.getAllUsers"]) === null || v === void 0 ? void 0 : v[f]) === null || P === void 0 ? void 0 : P.url;
          return (y, E) => (0, e.createRequestFunction)(b, O.default, A.BASE_PATH, r)(y, R || E);
        });
      },
      /**
       *
       * @summary Get all users of user type
       * @param {string} userType The userType of the requested users
       * @param {number} [take] How many users the endpoint should return
       * @param {number} [skip] How many users should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllUsersOfUserType(o, i, t, a) {
        return h(this, void 0, void 0, function* () {
          var s, n, u;
          const d = yield c.getAllUsersOfUserType(o, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, v = (u = (n = A.operationServerMap["UsersApi.getAllUsersOfUserType"]) === null || n === void 0 ? void 0 : n[p]) === null || u === void 0 ? void 0 : u.url;
          return (P, b) => (0, e.createRequestFunction)(d, O.default, A.BASE_PATH, r)(P, v || b);
        });
      },
      /**
       *
       * @summary Get an individual user
       * @param {number} id userID
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getIndividualUser(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getIndividualUser(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["UsersApi.getIndividualUser"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Get an organs members
       * @param {number} id The id of the user
       * @param {number} [take] How many members the endpoint should return
       * @param {number} [skip] How many members should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getOrganMembers(o, i, t, a) {
        return h(this, void 0, void 0, function* () {
          var s, n, u;
          const d = yield c.getOrganMembers(o, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, v = (u = (n = A.operationServerMap["UsersApi.getOrganMembers"]) === null || n === void 0 ? void 0 : n[p]) === null || u === void 0 ? void 0 : u.url;
          return (P, b) => (0, e.createRequestFunction)(d, O.default, A.BASE_PATH, r)(P, v || b);
        });
      },
      /**
       *
       * @summary Get all users that the user can authenticate as
       * @param {number} id The id of the user to get authentications of
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserAuthenticatable(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getUserAuthenticatable(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["UsersApi.getUserAuthenticatable"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Get all roles assigned to the user.
       * @param {number} id The id of the user to get the roles from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserRoles(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getUserRoles(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["UsersApi.getUserRoles"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Returns the user\'s containers
       * @param {number} id The id of the user
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersContainers(o, i, t, a) {
        return h(this, void 0, void 0, function* () {
          var s, n, u;
          const d = yield c.getUsersContainers(o, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, v = (u = (n = A.operationServerMap["UsersApi.getUsersContainers"]) === null || n === void 0 ? void 0 : n[p]) === null || u === void 0 ? void 0 : u.url;
          return (P, b) => (0, e.createRequestFunction)(d, O.default, A.BASE_PATH, r)(P, v || b);
        });
      },
      /**
       *
       * @summary Get all financial mutations of a user (from or to).
       * @param {number} id The id of the user to get the mutations from
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersFinancialMutations(o, i, t, a, s, n) {
        return h(this, void 0, void 0, function* () {
          var u, d, p;
          const v = yield c.getUsersFinancialMutations(o, i, t, a, s, n), P = (u = r == null ? void 0 : r.serverIndex) !== null && u !== void 0 ? u : 0, b = (p = (d = A.operationServerMap["UsersApi.getUsersFinancialMutations"]) === null || d === void 0 ? void 0 : d[P]) === null || p === void 0 ? void 0 : p.url;
          return (f, R) => (0, e.createRequestFunction)(v, O.default, A.BASE_PATH, r)(f, b || R);
        });
      },
      /**
       *
       * @summary Returns the user\'s Points of Sale
       * @param {number} id The id of the user
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersPointsOfSale(o, i, t, a) {
        return h(this, void 0, void 0, function* () {
          var s, n, u;
          const d = yield c.getUsersPointsOfSale(o, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, v = (u = (n = A.operationServerMap["UsersApi.getUsersPointsOfSale"]) === null || n === void 0 ? void 0 : n[p]) === null || u === void 0 ? void 0 : u.url;
          return (P, b) => (0, e.createRequestFunction)(d, O.default, A.BASE_PATH, r)(P, v || b);
        });
      },
      /**
       *
       * @summary Get all deposits of a user that are still being processed by Stripe
       * @param {number} id The id of the user to get the deposits from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProcessingDeposits(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getUsersProcessingDeposits(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["UsersApi.getUsersProcessingDeposits"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Get an user\'s products
       * @param {number} id The id of the user
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProducts(o, i, t, a) {
        return h(this, void 0, void 0, function* () {
          var s, n, u;
          const d = yield c.getUsersProducts(o, i, t, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, v = (u = (n = A.operationServerMap["UsersApi.getUsersProducts"]) === null || n === void 0 ? void 0 : n[p]) === null || u === void 0 ? void 0 : u.url;
          return (P, b) => (0, e.createRequestFunction)(d, O.default, A.BASE_PATH, r)(P, v || b);
        });
      },
      /**
       *
       * @summary Get transactions from a user.
       * @param {number} id The id of the user that should be involved in all returned transactions
       * @param {number} [fromId] From-user for selected transactions
       * @param {number} [createdById] User that created selected transaction
       * @param {number} [toId] To-user for selected transactions transactions. Requires ContainerId
       * @param {number} [productId] Product ID for selected transactions
       * @param {number} [productRevision] Product Revision for selected transactions. Requires ProductID
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransactions(o, i, t, a, s, n, u, d, p, v, P) {
        return h(this, void 0, void 0, function* () {
          var b, f, R;
          const y = yield c.getUsersTransactions(o, i, t, a, s, n, u, d, p, v, P), E = (b = r == null ? void 0 : r.serverIndex) !== null && b !== void 0 ? b : 0, I = (R = (f = A.operationServerMap["UsersApi.getUsersTransactions"]) === null || f === void 0 ? void 0 : f[E]) === null || R === void 0 ? void 0 : R.url;
          return (C, F) => (0, e.createRequestFunction)(y, O.default, A.BASE_PATH, r)(C, I || F);
        });
      },
      /**
       *
       * @summary Get transaction report for the given user
       * @param {number} id The id of the user to get the transaction report from
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [fromId] From-user for selected transactions
       * @param {number} [toId] To-user for selected transactions
       * @param {boolean} [exclusiveToId] If all sub-transactions should be to the toId user, default true
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransactionsReport(o, i, t, a, s, n, u) {
        return h(this, void 0, void 0, function* () {
          var d, p, v;
          const P = yield c.getUsersTransactionsReport(o, i, t, a, s, n, u), b = (d = r == null ? void 0 : r.serverIndex) !== null && d !== void 0 ? d : 0, f = (v = (p = A.operationServerMap["UsersApi.getUsersTransactionsReport"]) === null || p === void 0 ? void 0 : p[b]) === null || v === void 0 ? void 0 : v.url;
          return (R, y) => (0, e.createRequestFunction)(P, O.default, A.BASE_PATH, r)(R, f || y);
        });
      },
      /**
       *
       * @summary Get transfers to or from an user.
       * @param {number} id The id of the user that should be involved in all returned transfers
       * @param {number} [take] How many transfers the endpoint should return
       * @param {number} [skip] How many transfers should be skipped (for pagination)
       * @param {number} [fromId] From-user for selected transfers
       * @param {number} [toId] To-user for selected transfers
       * @param {number} [id2] ID of selected transfers
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransfers(o, i, t, a, s, n, u) {
        return h(this, void 0, void 0, function* () {
          var d, p, v;
          const P = yield c.getUsersTransfers(o, i, t, a, s, n, u), b = (d = r == null ? void 0 : r.serverIndex) !== null && d !== void 0 ? d : 0, f = (v = (p = A.operationServerMap["UsersApi.getUsersTransfers"]) === null || p === void 0 ? void 0 : p[b]) === null || v === void 0 ? void 0 : v.url;
          return (R, y) => (0, e.createRequestFunction)(P, O.default, A.BASE_PATH, r)(R, f || y);
        });
      },
      /**
       *
       * @summary Update a user
       * @param {number} id The id of the user
       * @param {UpdateUserRequest} updateUserRequest The user which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUser(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateUser(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["UsersApi.updateUser"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary POST an users update to new key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserKey(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.updateUserKey(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["UsersApi.updateUserKey"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Put a user\'s local password
       * @param {number} id The id of the user
       * @param {UpdateLocalRequest} updateLocalRequest    The password update
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserLocalPassword(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateUserLocalPassword(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["UsersApi.updateUserLocalPassword"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Put a users NFC code
       * @param {number} id The id of the user
       * @param {UpdateNfcRequest} updateNfcRequest    The NFC code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserNfc(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateUserNfc(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["UsersApi.updateUserNfc"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Put an users pin code
       * @param {number} id The id of the user
       * @param {UpdatePinRequest} updatePinRequest    The PIN code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserPin(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateUserPin(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["UsersApi.updateUserPin"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Waive all given user\'s fines
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      waiveUserFines(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.waiveUserFines(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["UsersApi.waiveUserFines"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      }
    };
  };
  l.UsersApiFp = Gs;
  const ks = function(r, c, o) {
    const i = (0, l.UsersApiFp)(r);
    return {
      /**
       *
       * @summary Accept the Terms of Service if you have not accepted it yet
       * @param {AcceptTosRequest} acceptTosRequest \&quot;Tosrequest body\&quot;
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      acceptTos(t, a) {
        return i.acceptTos(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Authenticate as another user
       * @param {number} id The id of the user that should be authenticated as
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      authenticateAs(t, a) {
        return i.authenticateAs(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Create a new user
       * @param {CreateUserRequest} createUserRequest The user which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createUser(t, a) {
        return i.createUser(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Delete a single user
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUser(t, a) {
        return i.deleteUser(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Delete a users key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserKey(t, a) {
        return i.deleteUserKey(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Delete a nfc code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserNfc(t, a) {
        return i.deleteUserNfc(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Get a list of all users
       * @param {number} [take] How many users the endpoint should return
       * @param {number} [skip] How many users should be skipped (for pagination)
       * @param {string} [search] Filter based on first name
       * @param {boolean} [active] Filter based if the user is active
       * @param {boolean} [ofAge] Filter based if the user is 18+
       * @param {number} [id] Filter based on user ID
       * @param {GetAllUsersTypeEnum} [type] Filter based on user type.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllUsers(t, a, s, n, u, d, p, v) {
        return i.getAllUsers(t, a, s, n, u, d, p, v).then((P) => P(o, c));
      },
      /**
       *
       * @summary Get all users of user type
       * @param {string} userType The userType of the requested users
       * @param {number} [take] How many users the endpoint should return
       * @param {number} [skip] How many users should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllUsersOfUserType(t, a, s, n) {
        return i.getAllUsersOfUserType(t, a, s, n).then((u) => u(o, c));
      },
      /**
       *
       * @summary Get an individual user
       * @param {number} id userID
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getIndividualUser(t, a) {
        return i.getIndividualUser(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Get an organs members
       * @param {number} id The id of the user
       * @param {number} [take] How many members the endpoint should return
       * @param {number} [skip] How many members should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getOrganMembers(t, a, s, n) {
        return i.getOrganMembers(t, a, s, n).then((u) => u(o, c));
      },
      /**
       *
       * @summary Get all users that the user can authenticate as
       * @param {number} id The id of the user to get authentications of
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserAuthenticatable(t, a) {
        return i.getUserAuthenticatable(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Get all roles assigned to the user.
       * @param {number} id The id of the user to get the roles from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserRoles(t, a) {
        return i.getUserRoles(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Returns the user\'s containers
       * @param {number} id The id of the user
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersContainers(t, a, s, n) {
        return i.getUsersContainers(t, a, s, n).then((u) => u(o, c));
      },
      /**
       *
       * @summary Get all financial mutations of a user (from or to).
       * @param {number} id The id of the user to get the mutations from
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersFinancialMutations(t, a, s, n, u, d) {
        return i.getUsersFinancialMutations(t, a, s, n, u, d).then((p) => p(o, c));
      },
      /**
       *
       * @summary Returns the user\'s Points of Sale
       * @param {number} id The id of the user
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersPointsOfSale(t, a, s, n) {
        return i.getUsersPointsOfSale(t, a, s, n).then((u) => u(o, c));
      },
      /**
       *
       * @summary Get all deposits of a user that are still being processed by Stripe
       * @param {number} id The id of the user to get the deposits from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProcessingDeposits(t, a) {
        return i.getUsersProcessingDeposits(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Get an user\'s products
       * @param {number} id The id of the user
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProducts(t, a, s, n) {
        return i.getUsersProducts(t, a, s, n).then((u) => u(o, c));
      },
      /**
       *
       * @summary Get transactions from a user.
       * @param {number} id The id of the user that should be involved in all returned transactions
       * @param {number} [fromId] From-user for selected transactions
       * @param {number} [createdById] User that created selected transaction
       * @param {number} [toId] To-user for selected transactions transactions. Requires ContainerId
       * @param {number} [productId] Product ID for selected transactions
       * @param {number} [productRevision] Product Revision for selected transactions. Requires ProductID
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransactions(t, a, s, n, u, d, p, v, P, b, f) {
        return i.getUsersTransactions(t, a, s, n, u, d, p, v, P, b, f).then((R) => R(o, c));
      },
      /**
       *
       * @summary Get transaction report for the given user
       * @param {number} id The id of the user to get the transaction report from
       * @param {string} [fromDate] Start date for selected transactions (inclusive)
       * @param {string} [tillDate] End date for selected transactions (exclusive)
       * @param {number} [fromId] From-user for selected transactions
       * @param {number} [toId] To-user for selected transactions
       * @param {boolean} [exclusiveToId] If all sub-transactions should be to the toId user, default true
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransactionsReport(t, a, s, n, u, d, p) {
        return i.getUsersTransactionsReport(t, a, s, n, u, d, p).then((v) => v(o, c));
      },
      /**
       *
       * @summary Get transfers to or from an user.
       * @param {number} id The id of the user that should be involved in all returned transfers
       * @param {number} [take] How many transfers the endpoint should return
       * @param {number} [skip] How many transfers should be skipped (for pagination)
       * @param {number} [fromId] From-user for selected transfers
       * @param {number} [toId] To-user for selected transfers
       * @param {number} [id2] ID of selected transfers
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersTransfers(t, a, s, n, u, d, p) {
        return i.getUsersTransfers(t, a, s, n, u, d, p).then((v) => v(o, c));
      },
      /**
       *
       * @summary Update a user
       * @param {number} id The id of the user
       * @param {UpdateUserRequest} updateUserRequest The user which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUser(t, a, s) {
        return i.updateUser(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary POST an users update to new key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserKey(t, a) {
        return i.updateUserKey(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Put a user\'s local password
       * @param {number} id The id of the user
       * @param {UpdateLocalRequest} updateLocalRequest    The password update
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserLocalPassword(t, a, s) {
        return i.updateUserLocalPassword(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Put a users NFC code
       * @param {number} id The id of the user
       * @param {UpdateNfcRequest} updateNfcRequest    The NFC code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserNfc(t, a, s) {
        return i.updateUserNfc(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Put an users pin code
       * @param {number} id The id of the user
       * @param {UpdatePinRequest} updatePinRequest    The PIN code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserPin(t, a, s) {
        return i.updateUserPin(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Waive all given user\'s fines
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      waiveUserFines(t, a) {
        return i.waiveUserFines(t, a).then((s) => s(o, c));
      }
    };
  };
  l.UsersApiFactory = ks;
  class Qs extends A.BaseAPI {
    /**
     *
     * @summary Accept the Terms of Service if you have not accepted it yet
     * @param {AcceptTosRequest} acceptTosRequest \&quot;Tosrequest body\&quot;
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    acceptTos(c, o) {
      return (0, l.UsersApiFp)(this.configuration).acceptTos(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Authenticate as another user
     * @param {number} id The id of the user that should be authenticated as
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    authenticateAs(c, o) {
      return (0, l.UsersApiFp)(this.configuration).authenticateAs(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Create a new user
     * @param {CreateUserRequest} createUserRequest The user which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    createUser(c, o) {
      return (0, l.UsersApiFp)(this.configuration).createUser(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a single user
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    deleteUser(c, o) {
      return (0, l.UsersApiFp)(this.configuration).deleteUser(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a users key code
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    deleteUserKey(c, o) {
      return (0, l.UsersApiFp)(this.configuration).deleteUserKey(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a nfc code
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    deleteUserNfc(c, o) {
      return (0, l.UsersApiFp)(this.configuration).deleteUserNfc(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a list of all users
     * @param {number} [take] How many users the endpoint should return
     * @param {number} [skip] How many users should be skipped (for pagination)
     * @param {string} [search] Filter based on first name
     * @param {boolean} [active] Filter based if the user is active
     * @param {boolean} [ofAge] Filter based if the user is 18+
     * @param {number} [id] Filter based on user ID
     * @param {GetAllUsersTypeEnum} [type] Filter based on user type.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getAllUsers(c, o, i, t, a, s, n, u) {
      return (0, l.UsersApiFp)(this.configuration).getAllUsers(c, o, i, t, a, s, n, u).then((d) => d(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all users of user type
     * @param {string} userType The userType of the requested users
     * @param {number} [take] How many users the endpoint should return
     * @param {number} [skip] How many users should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getAllUsersOfUserType(c, o, i, t) {
      return (0, l.UsersApiFp)(this.configuration).getAllUsersOfUserType(c, o, i, t).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get an individual user
     * @param {number} id userID
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getIndividualUser(c, o) {
      return (0, l.UsersApiFp)(this.configuration).getIndividualUser(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get an organs members
     * @param {number} id The id of the user
     * @param {number} [take] How many members the endpoint should return
     * @param {number} [skip] How many members should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getOrganMembers(c, o, i, t) {
      return (0, l.UsersApiFp)(this.configuration).getOrganMembers(c, o, i, t).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all users that the user can authenticate as
     * @param {number} id The id of the user to get authentications of
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUserAuthenticatable(c, o) {
      return (0, l.UsersApiFp)(this.configuration).getUserAuthenticatable(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all roles assigned to the user.
     * @param {number} id The id of the user to get the roles from
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUserRoles(c, o) {
      return (0, l.UsersApiFp)(this.configuration).getUserRoles(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the user\'s containers
     * @param {number} id The id of the user
     * @param {number} [take] How many containers the endpoint should return
     * @param {number} [skip] How many containers should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersContainers(c, o, i, t) {
      return (0, l.UsersApiFp)(this.configuration).getUsersContainers(c, o, i, t).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all financial mutations of a user (from or to).
     * @param {number} id The id of the user to get the mutations from
     * @param {string} [fromDate] Start date for selected transactions (inclusive)
     * @param {string} [tillDate] End date for selected transactions (exclusive)
     * @param {number} [take] How many transactions the endpoint should return
     * @param {number} [skip] How many transactions should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersFinancialMutations(c, o, i, t, a, s) {
      return (0, l.UsersApiFp)(this.configuration).getUsersFinancialMutations(c, o, i, t, a, s).then((n) => n(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the user\'s Points of Sale
     * @param {number} id The id of the user
     * @param {number} [take] How many points of sale the endpoint should return
     * @param {number} [skip] How many points of sale should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersPointsOfSale(c, o, i, t) {
      return (0, l.UsersApiFp)(this.configuration).getUsersPointsOfSale(c, o, i, t).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get all deposits of a user that are still being processed by Stripe
     * @param {number} id The id of the user to get the deposits from
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersProcessingDeposits(c, o) {
      return (0, l.UsersApiFp)(this.configuration).getUsersProcessingDeposits(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get an user\'s products
     * @param {number} id The id of the user
     * @param {number} [take] How many products the endpoint should return
     * @param {number} [skip] How many products should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersProducts(c, o, i, t) {
      return (0, l.UsersApiFp)(this.configuration).getUsersProducts(c, o, i, t).then((a) => a(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get transactions from a user.
     * @param {number} id The id of the user that should be involved in all returned transactions
     * @param {number} [fromId] From-user for selected transactions
     * @param {number} [createdById] User that created selected transaction
     * @param {number} [toId] To-user for selected transactions transactions. Requires ContainerId
     * @param {number} [productId] Product ID for selected transactions
     * @param {number} [productRevision] Product Revision for selected transactions. Requires ProductID
     * @param {string} [fromDate] Start date for selected transactions (inclusive)
     * @param {string} [tillDate] End date for selected transactions (exclusive)
     * @param {number} [take] How many transactions the endpoint should return
     * @param {number} [skip] How many transactions should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersTransactions(c, o, i, t, a, s, n, u, d, p, v) {
      return (0, l.UsersApiFp)(this.configuration).getUsersTransactions(c, o, i, t, a, s, n, u, d, p, v).then((P) => P(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get transaction report for the given user
     * @param {number} id The id of the user to get the transaction report from
     * @param {string} [fromDate] Start date for selected transactions (inclusive)
     * @param {string} [tillDate] End date for selected transactions (exclusive)
     * @param {number} [fromId] From-user for selected transactions
     * @param {number} [toId] To-user for selected transactions
     * @param {boolean} [exclusiveToId] If all sub-transactions should be to the toId user, default true
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersTransactionsReport(c, o, i, t, a, s, n) {
      return (0, l.UsersApiFp)(this.configuration).getUsersTransactionsReport(c, o, i, t, a, s, n).then((u) => u(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get transfers to or from an user.
     * @param {number} id The id of the user that should be involved in all returned transfers
     * @param {number} [take] How many transfers the endpoint should return
     * @param {number} [skip] How many transfers should be skipped (for pagination)
     * @param {number} [fromId] From-user for selected transfers
     * @param {number} [toId] To-user for selected transfers
     * @param {number} [id2] ID of selected transfers
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    getUsersTransfers(c, o, i, t, a, s, n) {
      return (0, l.UsersApiFp)(this.configuration).getUsersTransfers(c, o, i, t, a, s, n).then((u) => u(this.axios, this.basePath));
    }
    /**
     *
     * @summary Update a user
     * @param {number} id The id of the user
     * @param {UpdateUserRequest} updateUserRequest The user which should be updated
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUser(c, o, i) {
      return (0, l.UsersApiFp)(this.configuration).updateUser(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary POST an users update to new key code
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUserKey(c, o) {
      return (0, l.UsersApiFp)(this.configuration).updateUserKey(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Put a user\'s local password
     * @param {number} id The id of the user
     * @param {UpdateLocalRequest} updateLocalRequest    The password update
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUserLocalPassword(c, o, i) {
      return (0, l.UsersApiFp)(this.configuration).updateUserLocalPassword(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Put a users NFC code
     * @param {number} id The id of the user
     * @param {UpdateNfcRequest} updateNfcRequest    The NFC code to update to
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUserNfc(c, o, i) {
      return (0, l.UsersApiFp)(this.configuration).updateUserNfc(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Put an users pin code
     * @param {number} id The id of the user
     * @param {UpdatePinRequest} updatePinRequest    The PIN code to update to
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    updateUserPin(c, o, i) {
      return (0, l.UsersApiFp)(this.configuration).updateUserPin(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Waive all given user\'s fines
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    waiveUserFines(c, o) {
      return (0, l.UsersApiFp)(this.configuration).waiveUserFines(c, o).then((i) => i(this.axios, this.basePath));
    }
  }
  l.UsersApi = Qs, l.GetAllUsersTypeEnum = {
    Member: "MEMBER",
    Organ: "ORGAN",
    Voucher: "VOUCHER",
    LocalUser: "LOCAL_USER",
    LocalAdmin: "LOCAL_ADMIN",
    Invoice: "INVOICE",
    AutomaticInvoice: "AUTOMATIC_INVOICE"
  };
  const Ys = function(r) {
    return {
      /**
       *
       * @summary Create a new VAT group
       * @param {VatGroupRequest} vatGroupRequest The VAT group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVatGroup: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createVatGroup", "vatGroupRequest", i);
        const a = "/vatgroups", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get a list of all VAT groups
       * @param {number} [vatGroupId] ID of the VAT group
       * @param {string} [name] Name of the VAT group
       * @param {number} [percentage] VAT percentage
       * @param {boolean} [deleted] Whether the VAT groups should be hidden if zero
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllVatGroups: (c, o, i, t, a, s, ...n) => h(this, [c, o, i, t, a, s, ...n], void 0, function* (u, d, p, v, P, b, f = {}) {
        const R = "/vatgroups", y = new URL(R, e.DUMMY_BASE_URL);
        let E;
        r && (E = r.baseOptions);
        const I = Object.assign(Object.assign({ method: "GET" }, E), f), C = {}, F = {};
        yield (0, e.setBearerAuthToObject)(C, r), u !== void 0 && (F.vatGroupId = u), d !== void 0 && (F.name = d), p !== void 0 && (F.percentage = p), v !== void 0 && (F.deleted = v), P !== void 0 && (F.take = P), b !== void 0 && (F.skip = b), (0, e.setSearchParams)(y, F);
        let L = E && E.headers ? E.headers : {};
        return I.headers = Object.assign(Object.assign(Object.assign({}, C), L), f.headers), {
          url: (0, e.toPathString)(y),
          options: I
        };
      }),
      /**
       *
       * @summary Returns the requested VAT group
       * @param {number} id The ID of the VAT group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleVatGroup: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getSingleVatGroup", "id", i);
        const a = "/vatgroups/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get the VAT collections needed for VAT declarations
       * @param {number} year Calendar year for VAT declarations
       * @param {string} period Period for VAT declarations
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVatDeclarationAmounts: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("getVatDeclarationAmounts", "year", t), (0, e.assertParamExists)("getVatDeclarationAmounts", "period", a);
        const n = "/vatgroups/declaration", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), t !== void 0 && (P.year = t), a !== void 0 && (P.period = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Create a new VAT group
       * @param {number} id The ID of the VAT group which should be updated
       * @param {UpdateVatGroupRequest} updateVatGroupRequest The VAT group information
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVatGroup: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateVatGroup", "id", t), (0, e.assertParamExists)("updateVatGroup", "updateVatGroupRequest", a);
        const n = "/vatgroups/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      })
    };
  };
  l.VatGroupsApiAxiosParamCreator = Ys;
  const $s = function(r) {
    const c = (0, l.VatGroupsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Create a new VAT group
       * @param {VatGroupRequest} vatGroupRequest The VAT group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVatGroup(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createVatGroup(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["VatGroupsApi.createVatGroup"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Get a list of all VAT groups
       * @param {number} [vatGroupId] ID of the VAT group
       * @param {string} [name] Name of the VAT group
       * @param {number} [percentage] VAT percentage
       * @param {boolean} [deleted] Whether the VAT groups should be hidden if zero
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllVatGroups(o, i, t, a, s, n, u) {
        return h(this, void 0, void 0, function* () {
          var d, p, v;
          const P = yield c.getAllVatGroups(o, i, t, a, s, n, u), b = (d = r == null ? void 0 : r.serverIndex) !== null && d !== void 0 ? d : 0, f = (v = (p = A.operationServerMap["VatGroupsApi.getAllVatGroups"]) === null || p === void 0 ? void 0 : p[b]) === null || v === void 0 ? void 0 : v.url;
          return (R, y) => (0, e.createRequestFunction)(P, O.default, A.BASE_PATH, r)(R, f || y);
        });
      },
      /**
       *
       * @summary Returns the requested VAT group
       * @param {number} id The ID of the VAT group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleVatGroup(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getSingleVatGroup(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["VatGroupsApi.getSingleVatGroup"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Get the VAT collections needed for VAT declarations
       * @param {number} year Calendar year for VAT declarations
       * @param {string} period Period for VAT declarations
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVatDeclarationAmounts(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getVatDeclarationAmounts(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["VatGroupsApi.getVatDeclarationAmounts"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Create a new VAT group
       * @param {number} id The ID of the VAT group which should be updated
       * @param {UpdateVatGroupRequest} updateVatGroupRequest The VAT group information
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVatGroup(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateVatGroup(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["VatGroupsApi.updateVatGroup"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      }
    };
  };
  l.VatGroupsApiFp = $s;
  const zs = function(r, c, o) {
    const i = (0, l.VatGroupsApiFp)(r);
    return {
      /**
       *
       * @summary Create a new VAT group
       * @param {VatGroupRequest} vatGroupRequest The VAT group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVatGroup(t, a) {
        return i.createVatGroup(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Get a list of all VAT groups
       * @param {number} [vatGroupId] ID of the VAT group
       * @param {string} [name] Name of the VAT group
       * @param {number} [percentage] VAT percentage
       * @param {boolean} [deleted] Whether the VAT groups should be hidden if zero
       * @param {number} [take] How many transactions the endpoint should return
       * @param {number} [skip] How many transactions should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllVatGroups(t, a, s, n, u, d, p) {
        return i.getAllVatGroups(t, a, s, n, u, d, p).then((v) => v(o, c));
      },
      /**
       *
       * @summary Returns the requested VAT group
       * @param {number} id The ID of the VAT group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleVatGroup(t, a) {
        return i.getSingleVatGroup(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Get the VAT collections needed for VAT declarations
       * @param {number} year Calendar year for VAT declarations
       * @param {string} period Period for VAT declarations
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVatDeclarationAmounts(t, a, s) {
        return i.getVatDeclarationAmounts(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Create a new VAT group
       * @param {number} id The ID of the VAT group which should be updated
       * @param {UpdateVatGroupRequest} updateVatGroupRequest The VAT group information
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVatGroup(t, a, s) {
        return i.updateVatGroup(t, a, s).then((n) => n(o, c));
      }
    };
  };
  l.VatGroupsApiFactory = zs;
  class Ks extends A.BaseAPI {
    /**
     *
     * @summary Create a new VAT group
     * @param {VatGroupRequest} vatGroupRequest The VAT group which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    createVatGroup(c, o) {
      return (0, l.VatGroupsApiFp)(this.configuration).createVatGroup(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a list of all VAT groups
     * @param {number} [vatGroupId] ID of the VAT group
     * @param {string} [name] Name of the VAT group
     * @param {number} [percentage] VAT percentage
     * @param {boolean} [deleted] Whether the VAT groups should be hidden if zero
     * @param {number} [take] How many transactions the endpoint should return
     * @param {number} [skip] How many transactions should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    getAllVatGroups(c, o, i, t, a, s, n) {
      return (0, l.VatGroupsApiFp)(this.configuration).getAllVatGroups(c, o, i, t, a, s, n).then((u) => u(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested VAT group
     * @param {number} id The ID of the VAT group which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    getSingleVatGroup(c, o) {
      return (0, l.VatGroupsApiFp)(this.configuration).getSingleVatGroup(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get the VAT collections needed for VAT declarations
     * @param {number} year Calendar year for VAT declarations
     * @param {string} period Period for VAT declarations
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    getVatDeclarationAmounts(c, o, i) {
      return (0, l.VatGroupsApiFp)(this.configuration).getVatDeclarationAmounts(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Create a new VAT group
     * @param {number} id The ID of the VAT group which should be updated
     * @param {UpdateVatGroupRequest} updateVatGroupRequest The VAT group information
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VatGroupsApi
     */
    updateVatGroup(c, o, i) {
      return (0, l.VatGroupsApiFp)(this.configuration).updateVatGroup(c, o, i).then((t) => t(this.axios, this.basePath));
    }
  }
  l.VatGroupsApi = Ks;
  const Ws = function(r) {
    return {
      /**
       *
       * @summary Creates a new voucher group
       * @param {VoucherGroupRequest} voucherGroupRequest The voucher group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVouchergroup: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("createVouchergroup", "voucherGroupRequest", i);
        const a = "/vouchergroups", s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), u.data = (0, e.serializeDataIfNeeded)(i, u, r), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns all existing voucher groups
       * @param {number} [take] How many voucher groups the endpoint should return
       * @param {number} [skip] How many voucher groups should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllVouchergroups: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        const n = "/vouchergroups", u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), t !== void 0 && (P.take = t), a !== void 0 && (P.skip = a), (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, e.toPathString)(u),
          options: p
        };
      }),
      /**
       *
       * @summary Returns the requested voucher group
       * @param {number} id The id of the voucher group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVouchergroupId: (c, ...o) => h(this, [c, ...o], void 0, function* (i, t = {}) {
        (0, e.assertParamExists)("getVouchergroupId", "id", i);
        const a = "/vouchergroups/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, e.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), t), d = {}, p = {};
        yield (0, e.setBearerAuthToObject)(d, r), (0, e.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), t.headers), {
          url: (0, e.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Updates the requested voucher group
       * @param {number} id The id of the voucher group which should be updated
       * @param {VoucherGroupRequest} voucherGroupRequest The updated voucher group
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVoucherGroup: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (t, a, s = {}) {
        (0, e.assertParamExists)("updateVoucherGroup", "id", t), (0, e.assertParamExists)("updateVoucherGroup", "voucherGroupRequest", a);
        const n = "/vouchergroups/{id}".replace("{id}", encodeURIComponent(String(t))), u = new URL(n, e.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), v = {}, P = {};
        yield (0, e.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, e.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, e.serializeDataIfNeeded)(a, p, r), {
          url: (0, e.toPathString)(u),
          options: p
        };
      })
    };
  };
  l.VouchergroupsApiAxiosParamCreator = Ws;
  const Js = function(r) {
    const c = (0, l.VouchergroupsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Creates a new voucher group
       * @param {VoucherGroupRequest} voucherGroupRequest The voucher group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVouchergroup(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.createVouchergroup(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["VouchergroupsApi.createVouchergroup"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Returns all existing voucher groups
       * @param {number} [take] How many voucher groups the endpoint should return
       * @param {number} [skip] How many voucher groups should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllVouchergroups(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllVouchergroups(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["VouchergroupsApi.getAllVouchergroups"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      },
      /**
       *
       * @summary Returns the requested voucher group
       * @param {number} id The id of the voucher group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVouchergroupId(o, i) {
        return h(this, void 0, void 0, function* () {
          var t, a, s;
          const n = yield c.getVouchergroupId(o, i), u = (t = r == null ? void 0 : r.serverIndex) !== null && t !== void 0 ? t : 0, d = (s = (a = A.operationServerMap["VouchergroupsApi.getVouchergroupId"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, e.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Updates the requested voucher group
       * @param {number} id The id of the voucher group which should be updated
       * @param {VoucherGroupRequest} voucherGroupRequest The updated voucher group
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVoucherGroup(o, i, t) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateVoucherGroup(o, i, t), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["VouchergroupsApi.updateVoucherGroup"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, e.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      }
    };
  };
  l.VouchergroupsApiFp = Js;
  const Xs = function(r, c, o) {
    const i = (0, l.VouchergroupsApiFp)(r);
    return {
      /**
       *
       * @summary Creates a new voucher group
       * @param {VoucherGroupRequest} voucherGroupRequest The voucher group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVouchergroup(t, a) {
        return i.createVouchergroup(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Returns all existing voucher groups
       * @param {number} [take] How many voucher groups the endpoint should return
       * @param {number} [skip] How many voucher groups should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllVouchergroups(t, a, s) {
        return i.getAllVouchergroups(t, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Returns the requested voucher group
       * @param {number} id The id of the voucher group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVouchergroupId(t, a) {
        return i.getVouchergroupId(t, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Updates the requested voucher group
       * @param {number} id The id of the voucher group which should be updated
       * @param {VoucherGroupRequest} voucherGroupRequest The updated voucher group
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVoucherGroup(t, a, s) {
        return i.updateVoucherGroup(t, a, s).then((n) => n(o, c));
      }
    };
  };
  l.VouchergroupsApiFactory = Xs;
  class Zs extends A.BaseAPI {
    /**
     *
     * @summary Creates a new voucher group
     * @param {VoucherGroupRequest} voucherGroupRequest The voucher group which should be created
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VouchergroupsApi
     */
    createVouchergroup(c, o) {
      return (0, l.VouchergroupsApiFp)(this.configuration).createVouchergroup(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all existing voucher groups
     * @param {number} [take] How many voucher groups the endpoint should return
     * @param {number} [skip] How many voucher groups should be skipped (for pagination)
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VouchergroupsApi
     */
    getAllVouchergroups(c, o, i) {
      return (0, l.VouchergroupsApiFp)(this.configuration).getAllVouchergroups(c, o, i).then((t) => t(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the requested voucher group
     * @param {number} id The id of the voucher group which should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VouchergroupsApi
     */
    getVouchergroupId(c, o) {
      return (0, l.VouchergroupsApiFp)(this.configuration).getVouchergroupId(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Updates the requested voucher group
     * @param {number} id The id of the voucher group which should be updated
     * @param {VoucherGroupRequest} voucherGroupRequest The updated voucher group
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof VouchergroupsApi
     */
    updateVoucherGroup(c, o, i) {
      return (0, l.VouchergroupsApiFp)(this.configuration).updateVoucherGroup(c, o, i).then((t) => t(this.axios, this.basePath));
    }
  }
  l.VouchergroupsApi = Zs;
})(bt);
var Fe = {};
Object.defineProperty(Fe, "__esModule", { value: !0 });
Fe.Configuration = void 0;
class An {
  constructor(h = {}) {
    this.apiKey = h.apiKey, this.username = h.username, this.password = h.password, this.accessToken = h.accessToken, this.basePath = h.basePath, this.serverIndex = h.serverIndex, this.baseOptions = h.baseOptions, this.formDataCtor = h.formDataCtor;
  }
  /**
   * Check if the given MIME is a JSON MIME.
   * JSON MIME examples:
   *   application/json
   *   application/json; charset=UTF8
   *   APPLICATION/JSON
   *   application/vnd.company+json
   * @param mime - MIME (Multipurpose Internet Mail Extensions)
   * @return True if the given MIME is JSON, false otherwise.
   */
  isJsonMime(h) {
    const O = new RegExp("^(application/json|[^;/ 	]+/[^;/ 	]+[+]json)[ 	]*(;.*)?$", "i");
    return h !== null && (O.test(h) || h.toLowerCase() === "application/json-patch+json");
  }
}
Fe.Configuration = An;
(function(l) {
  var h = de && de.__createBinding || (Object.create ? function(e, A, m, S) {
    S === void 0 && (S = m);
    var j = Object.getOwnPropertyDescriptor(A, m);
    (!j || ("get" in j ? !A.__esModule : j.writable || j.configurable)) && (j = { enumerable: !0, get: function() {
      return A[m];
    } }), Object.defineProperty(e, S, j);
  } : function(e, A, m, S) {
    S === void 0 && (S = m), e[S] = A[m];
  }), O = de && de.__exportStar || function(e, A) {
    for (var m in e) m !== "default" && !Object.prototype.hasOwnProperty.call(A, m) && h(A, e, m);
  };
  Object.defineProperty(l, "__esModule", { value: !0 }), O(bt, l), O(Fe, l);
})(k);
const K = Y.create();
K.interceptors.response.use((l) => (oa(l), l));
class gn {
  constructor(h) {
    $(this, "_authenticateApi");
    $(this, "_balanceApi");
    $(this, "_debtorsApi");
    $(this, "_usersApi");
    $(this, "_posApi");
    $(this, "_categoryApi");
    $(this, "_transactionApi");
    $(this, "_bannerApi");
    $(this, "_rootApi");
    $(this, "_voucherGroupApi");
    $(this, "_containerApi");
    $(this, "_filesApi");
    $(this, "_invoicesApi");
    $(this, "_payoutsApi");
    $(this, "_productsApi");
    $(this, "_transfersApi");
    $(this, "_vatGroupsApi");
    $(this, "_stripeApi");
    $(this, "_rbacApi");
    $(this, "_openBannerApi");
    const O = new k.Configuration({
      accessToken: () => Ye().token
    });
    this._authenticateApi = new k.AuthenticateApi(O, h, K), this._balanceApi = new k.BalanceApi(O, h, K), this._debtorsApi = new k.DebtorsApi(O, h, K), this._usersApi = new k.UsersApi(O, h, K), this._posApi = new k.PointofsaleApi(O, h, K), this._categoryApi = new k.ProductCategoriesApi(O, h, K), this._transactionApi = new k.TransactionsApi(O, h, K), this._bannerApi = new k.BannersApi(O, h, K), this._openBannerApi = new k.BannersApi(void 0, h, K), this._rootApi = new k.RootApi(), this._voucherGroupApi = new k.VouchergroupsApi(O, h, K), this._containerApi = new k.ContainersApi(O, h, K), this._filesApi = new k.FilesApi(O, h, K), this._invoicesApi = new k.InvoicesApi(O, h, K), this._payoutsApi = new k.PayoutRequestsApi(O, h, K), this._productsApi = new k.ProductsApi(O, h, K), this._transfersApi = new k.TransfersApi(O, h, K), this._vatGroupsApi = new k.VatGroupsApi(O, h, K), this._stripeApi = new k.StripeApi(O, h, K), this._rbacApi = new k.RbacApi(O, h, K);
  }
  get authenticate() {
    return this._authenticateApi;
  }
  get balance() {
    return this._balanceApi;
  }
  get debtor() {
    return this._debtorsApi;
  }
  get pos() {
    return this._posApi;
  }
  get category() {
    return this._categoryApi;
  }
  get transaction() {
    return this._transactionApi;
  }
  get banner() {
    return this._bannerApi;
  }
  get rootApi() {
    return this._rootApi;
  }
  get borrelkaart() {
    return this._voucherGroupApi;
  }
  get container() {
    return this._containerApi;
  }
  get files() {
    return this._filesApi;
  }
  get invoices() {
    return this._invoicesApi;
  }
  get payouts() {
    return this._payoutsApi;
  }
  get products() {
    return this._productsApi;
  }
  get transfers() {
    return this._transfersApi;
  }
  get vatGroups() {
    return this._vatGroupsApi;
  }
  get stripe() {
    return this._stripeApi;
  }
  get rbac() {
    return this._rbacApi;
  }
  get user() {
    return this._usersApi;
  }
  get openBanner() {
    return this._openBannerApi;
  }
}
function fn(l) {
  l.mask.addEventListener("click", function(h) {
    h.target === l.mask && l.close();
  });
}
export {
  gn as ApiService,
  fn as addListenerOnDialogueOverlay,
  la as clearTokenInStorage,
  ra as fetchAllPages,
  Ye as getTokenFromStorage,
  ua as isAuthenticated,
  da as isTokenExpired,
  ca as parseToken,
  bn as populateStoresFromToken,
  Pt as setTokenInStorage,
  oa as updateTokenIfNecessary,
  ha as useAuthStore,
  At as useUserStore
};
