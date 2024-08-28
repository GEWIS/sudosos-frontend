var da = Object.defineProperty;
var ua = (l, h, O) => h in l ? da(l, h, { enumerable: !0, configurable: !0, writable: !0, value: O }) : l[h] = O;
var W = (l, h, O) => ua(l, typeof h != "symbol" ? h + "" : h, O);
import { createPinia as ha, defineStore as ft } from "pinia";
async function it(l, h, O) {
  let t = l, A = [];
  for (; ; ) {
    const m = await O(h, t), { records: S } = m.data;
    if (A = A.concat(S), t += h, m.data._pagination.count <= t)
      break;
  }
  return A;
}
ha();
const gt = ft("user", {
  state: () => ({
    users: [],
    organs: [],
    current: {
      balance: null,
      rolesWithPermissions: [],
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
      this.users.length == 0 && (this.users = await it(
        0,
        500,
        (h, O) => l.user.getAllUsers(h, O)
      ));
    },
    async fetchAllOrgans(l) {
      return this.organs.length != 0 ? this.organs : it(
        0,
        Number.MAX_SAFE_INTEGER,
        (h, O) => l.user.getAllUsersOfUserType("ORGAN", h, O)
      ).then((h) => (this.organs = h, this.organs));
    },
    async fetchCurrentUserBalance(l, h) {
      this.current.balance = (await h.balance.getBalanceId(l)).data;
    },
    async fetchUserRolesWithPermissions(l, h) {
      this.current.rolesWithPermissions = (await h.user.getUserRoles(l)).data;
    },
    async fetchUsersFinancialMutations(l, h, O, t) {
      this.current.financialMutations = (await h.user.getUsersFinancialMutations(l, void 0, void 0, O, t)).data;
    },
    async fetchUserCreatedTransactions(l, h, O, t) {
      this.current.createdTransactions = (await h.transaction.getAllTransactions(void 0, l, void 0, void 0, void 0, void 0, void 0, void 0, O, t)).data;
    },
    setCurrentUser(l) {
      this.current.user = l;
    },
    setCurrentRolesWithPermissions(l) {
      this.current.rolesWithPermissions = l;
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
class je extends Error {
}
je.prototype.name = "InvalidTokenError";
function pa(l) {
  return decodeURIComponent(atob(l).replace(/(.)/g, (h, O) => {
    let t = O.charCodeAt(0).toString(16).toUpperCase();
    return t.length < 2 && (t = "0" + t), "%" + t;
  }));
}
function va(l) {
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
    return pa(h);
  } catch {
    return atob(h);
  }
}
function jt(l, h) {
  if (typeof l != "string")
    throw new je("Invalid token specified: must be a string");
  h || (h = {});
  const O = h.header === !0 ? 0 : 1, t = l.split(".")[O];
  if (typeof t != "string")
    throw new je(`Invalid token specified: missing part #${O + 1}`);
  let A;
  try {
    A = va(t);
  } catch (m) {
    throw new je(`Invalid token specified: invalid base64 for part #${O + 1} (${m.message})`);
  }
  try {
    return JSON.parse(A);
  } catch (m) {
    throw new je(`Invalid token specified: invalid json for part #${O + 1} (${m.message})`);
  }
}
function Aa(l) {
  if (l.headers.has("Set-Authorization")) {
    const h = l.headers.get("Set-Authorization");
    h && Ut(h);
  }
}
function Oa() {
  localStorage.clear();
}
function Pa(l) {
  const h = String(jt(l).exp);
  return { token: l, expires: h };
}
function Ut(l) {
  localStorage.setItem("jwt_token", JSON.stringify(Pa(l)));
}
function Je() {
  const l = localStorage.getItem("jwt_token");
  let h = {};
  return l !== null && (h = JSON.parse(l)), {
    ...h
  };
}
function ba(l) {
  if (l > 1e12) return !0;
  const h = l * 1e3;
  return (/* @__PURE__ */ new Date()).getTime() > h;
}
function ma() {
  const l = Je();
  return !l.token || !l.expires ? !1 : !ba(Number(l.expires));
}
async function Vn(l) {
  if (ma()) {
    const O = Sa();
    O.extractStateFromToken();
    const t = O.getUser;
    if (t) {
      const A = gt();
      return A.setCurrentUser(t), A.fetchCurrentUserBalance(t.id, l), await A.fetchUserRolesWithPermissions(t.id, l);
    }
  }
}
const Sa = ft({
  id: "auth",
  state: () => ({
    user: null,
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
    handleResponse(l) {
      const { user: h, token: O, rolesWithPermissions: t, organs: A, acceptedToS: m } = l;
      if (!(!h || !O || !t || !A || !m) && (this.user = h, this.token = O, Ut(this.token), this.organs = A, this.acceptedToS = m, this.acceptedToS === "ACCEPTED")) {
        const S = gt();
        S.setCurrentUser(h), S.setCurrentRolesWithPermissions(t);
      }
    },
    async gewisPinlogin(l, h, O) {
      const t = {
        gewisId: parseInt(l, 10),
        pin: h
      };
      await O.authenticate.gewisPinAuthentication(t).then((A) => {
        this.handleResponse(A.data);
      });
    },
    async ldapLogin(l, h, O) {
      const t = {
        accountName: l,
        password: h
      };
      await O.authenticate.ldapAuthentication(t).then((A) => {
        this.handleResponse(A.data);
      });
    },
    async gewisWebLogin(l, h, O) {
      const t = {
        nonce: l,
        token: h
      };
      await O.authenticate.gewisWebAuthentication(t).then((A) => {
        this.handleResponse(A.data);
      });
    },
    async externalPinLogin(l, h, O) {
      const t = {
        pin: h,
        userId: l
      };
      await O.authenticate.pinAuthentication(t).then((A) => {
        this.handleResponse(A.data);
      });
    },
    async eanLogin(l, h) {
      const O = {
        eanCode: l
      };
      await h.authenticate.eanAuthentication(O).then((t) => {
        this.handleResponse(t.data);
      });
    },
    async apiKeyLogin(l, h, O) {
      const t = {
        key: l,
        userId: h
      };
      await O.authenticate.keyAuthentication(t).then((A) => {
        this.handleResponse(A.data);
      });
    },
    async gewisLdapLogin(l, h, O) {
      const t = {
        accountName: l,
        password: h
      };
      await O.authenticate.gewisLDAPAuthentication(t).then((A) => {
        this.handleResponse(A.data);
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
      const t = await h.authenticate.refreshToken();
      this.handleResponse(t.data);
    },
    extractStateFromToken() {
      const l = Je();
      if (!l.token) return;
      const h = jt(l.token);
      this.user = h.user, this.token = l.token, this.organs = h.organs, this.acceptedToS = h.acceptedToS;
    },
    logout() {
      this.user = null, this.token = null, this.organs = [], this.acceptedToS = null, Oa();
    }
  }
});
var he = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function fa(l) {
  if (l.__esModule) return l;
  var h = l.default;
  if (typeof h == "function") {
    var O = function t() {
      return this instanceof t ? Reflect.construct(h, arguments, this.constructor) : h.apply(this, arguments);
    };
    O.prototype = h.prototype;
  } else O = {};
  return Object.defineProperty(O, "__esModule", { value: !0 }), Object.keys(l).forEach(function(t) {
    var A = Object.getOwnPropertyDescriptor(l, t);
    Object.defineProperty(O, t, A.get ? A : {
      enumerable: !0,
      get: function() {
        return l[t];
      }
    });
  }), O;
}
var Q = {}, Rt = {};
function _t(l, h) {
  return function() {
    return l.apply(h, arguments);
  };
}
const { toString: ga } = Object.prototype, { getPrototypeOf: Xe } = Object, Fe = /* @__PURE__ */ ((l) => (h) => {
  const O = ga.call(h);
  return l[O] || (l[O] = O.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), oe = (l) => (l = l.toLowerCase(), (h) => Fe(h) === l), Ce = (l) => (h) => typeof h === l, { isArray: be } = Array, Ue = Ce("undefined");
function ja(l) {
  return l !== null && !Ue(l) && l.constructor !== null && !Ue(l.constructor) && re(l.constructor.isBuffer) && l.constructor.isBuffer(l);
}
const Vt = oe("ArrayBuffer");
function Ua(l) {
  let h;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? h = ArrayBuffer.isView(l) : h = l && l.buffer && Vt(l.buffer), h;
}
const Ra = Ce("string"), re = Ce("function"), yt = Ce("number"), Ie = (l) => l !== null && typeof l == "object", _a = (l) => l === !0 || l === !1, ye = (l) => {
  if (Fe(l) !== "object")
    return !1;
  const h = Xe(l);
  return (h === null || h === Object.prototype || Object.getPrototypeOf(h) === null) && !(Symbol.toStringTag in l) && !(Symbol.iterator in l);
}, Va = oe("Date"), ya = oe("File"), Ea = oe("Blob"), Ta = oe("FileList"), Ba = (l) => Ie(l) && re(l.pipe), Fa = (l) => {
  let h;
  return l && (typeof FormData == "function" && l instanceof FormData || re(l.append) && ((h = Fe(l)) === "formdata" || // detect form-data instance
  h === "object" && re(l.toString) && l.toString() === "[object FormData]"));
}, Ca = oe("URLSearchParams"), [Ia, Ma, wa, xa] = ["ReadableStream", "Request", "Response", "Headers"].map(oe), La = (l) => l.trim ? l.trim() : l.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function Re(l, h, { allOwnKeys: O = !1 } = {}) {
  if (l === null || typeof l > "u")
    return;
  let t, A;
  if (typeof l != "object" && (l = [l]), be(l))
    for (t = 0, A = l.length; t < A; t++)
      h.call(null, l[t], t, l);
  else {
    const m = O ? Object.getOwnPropertyNames(l) : Object.keys(l), S = m.length;
    let j;
    for (t = 0; t < S; t++)
      j = m[t], h.call(null, l[j], j, l);
  }
}
function Et(l, h) {
  h = h.toLowerCase();
  const O = Object.keys(l);
  let t = O.length, A;
  for (; t-- > 0; )
    if (A = O[t], h === A.toLowerCase())
      return A;
  return null;
}
const ve = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, Tt = (l) => !Ue(l) && l !== ve;
function Ne() {
  const { caseless: l } = Tt(this) && this || {}, h = {}, O = (t, A) => {
    const m = l && Et(h, A) || A;
    ye(h[m]) && ye(t) ? h[m] = Ne(h[m], t) : ye(t) ? h[m] = Ne({}, t) : be(t) ? h[m] = t.slice() : h[m] = t;
  };
  for (let t = 0, A = arguments.length; t < A; t++)
    arguments[t] && Re(arguments[t], O);
  return h;
}
const qa = (l, h, O, { allOwnKeys: t } = {}) => (Re(h, (A, m) => {
  O && re(A) ? l[m] = _t(A, O) : l[m] = A;
}, { allOwnKeys: t }), l), Da = (l) => (l.charCodeAt(0) === 65279 && (l = l.slice(1)), l), Ha = (l, h, O, t) => {
  l.prototype = Object.create(h.prototype, t), l.prototype.constructor = l, Object.defineProperty(l, "super", {
    value: h.prototype
  }), O && Object.assign(l.prototype, O);
}, Na = (l, h, O, t) => {
  let A, m, S;
  const j = {};
  if (h = h || {}, l == null) return h;
  do {
    for (A = Object.getOwnPropertyNames(l), m = A.length; m-- > 0; )
      S = A[m], (!t || t(S, l, h)) && !j[S] && (h[S] = l[S], j[S] = !0);
    l = O !== !1 && Xe(l);
  } while (l && (!O || O(l, h)) && l !== Object.prototype);
  return h;
}, Ga = (l, h, O) => {
  l = String(l), (O === void 0 || O > l.length) && (O = l.length), O -= h.length;
  const t = l.indexOf(h, O);
  return t !== -1 && t === O;
}, ka = (l) => {
  if (!l) return null;
  if (be(l)) return l;
  let h = l.length;
  if (!yt(h)) return null;
  const O = new Array(h);
  for (; h-- > 0; )
    O[h] = l[h];
  return O;
}, Qa = /* @__PURE__ */ ((l) => (h) => l && h instanceof l)(typeof Uint8Array < "u" && Xe(Uint8Array)), Ya = (l, h) => {
  const t = (l && l[Symbol.iterator]).call(l);
  let A;
  for (; (A = t.next()) && !A.done; ) {
    const m = A.value;
    h.call(l, m[0], m[1]);
  }
}, $a = (l, h) => {
  let O;
  const t = [];
  for (; (O = l.exec(h)) !== null; )
    t.push(O);
  return t;
}, Wa = oe("HTMLFormElement"), za = (l) => l.toLowerCase().replace(
  /[-_\s]([a-z\d])(\w*)/g,
  function(O, t, A) {
    return t.toUpperCase() + A;
  }
), ot = (({ hasOwnProperty: l }) => (h, O) => l.call(h, O))(Object.prototype), Ka = oe("RegExp"), Bt = (l, h) => {
  const O = Object.getOwnPropertyDescriptors(l), t = {};
  Re(O, (A, m) => {
    let S;
    (S = h(A, m, l)) !== !1 && (t[m] = S || A);
  }), Object.defineProperties(l, t);
}, Ja = (l) => {
  Bt(l, (h, O) => {
    if (re(l) && ["arguments", "caller", "callee"].indexOf(O) !== -1)
      return !1;
    const t = l[O];
    if (re(t)) {
      if (h.enumerable = !1, "writable" in h) {
        h.writable = !1;
        return;
      }
      h.set || (h.set = () => {
        throw Error("Can not rewrite read-only method '" + O + "'");
      });
    }
  });
}, Xa = (l, h) => {
  const O = {}, t = (A) => {
    A.forEach((m) => {
      O[m] = !0;
    });
  };
  return be(l) ? t(l) : t(String(l).split(h)), O;
}, Za = () => {
}, er = (l, h) => l != null && Number.isFinite(l = +l) ? l : h, Le = "abcdefghijklmnopqrstuvwxyz", lt = "0123456789", Ft = {
  DIGIT: lt,
  ALPHA: Le,
  ALPHA_DIGIT: Le + Le.toUpperCase() + lt
}, tr = (l = 16, h = Ft.ALPHA_DIGIT) => {
  let O = "";
  const { length: t } = h;
  for (; l--; )
    O += h[Math.random() * t | 0];
  return O;
};
function sr(l) {
  return !!(l && re(l.append) && l[Symbol.toStringTag] === "FormData" && l[Symbol.iterator]);
}
const ar = (l) => {
  const h = new Array(10), O = (t, A) => {
    if (Ie(t)) {
      if (h.indexOf(t) >= 0)
        return;
      if (!("toJSON" in t)) {
        h[A] = t;
        const m = be(t) ? [] : {};
        return Re(t, (S, j) => {
          const y = O(S, A + 1);
          !Ue(y) && (m[j] = y);
        }), h[A] = void 0, m;
      }
    }
    return t;
  };
  return O(l, 0);
}, rr = oe("AsyncFunction"), nr = (l) => l && (Ie(l) || re(l)) && re(l.then) && re(l.catch), Ct = ((l, h) => l ? setImmediate : h ? ((O, t) => (ve.addEventListener("message", ({ source: A, data: m }) => {
  A === ve && m === O && t.length && t.shift()();
}, !1), (A) => {
  t.push(A), ve.postMessage(O, "*");
}))(`axios@${Math.random()}`, []) : (O) => setTimeout(O))(
  typeof setImmediate == "function",
  re(ve.postMessage)
), ir = typeof queueMicrotask < "u" ? queueMicrotask.bind(ve) : typeof process < "u" && process.nextTick || Ct, f = {
  isArray: be,
  isArrayBuffer: Vt,
  isBuffer: ja,
  isFormData: Fa,
  isArrayBufferView: Ua,
  isString: Ra,
  isNumber: yt,
  isBoolean: _a,
  isObject: Ie,
  isPlainObject: ye,
  isReadableStream: Ia,
  isRequest: Ma,
  isResponse: wa,
  isHeaders: xa,
  isUndefined: Ue,
  isDate: Va,
  isFile: ya,
  isBlob: Ea,
  isRegExp: Ka,
  isFunction: re,
  isStream: Ba,
  isURLSearchParams: Ca,
  isTypedArray: Qa,
  isFileList: Ta,
  forEach: Re,
  merge: Ne,
  extend: qa,
  trim: La,
  stripBOM: Da,
  inherits: Ha,
  toFlatObject: Na,
  kindOf: Fe,
  kindOfTest: oe,
  endsWith: Ga,
  toArray: ka,
  forEachEntry: Ya,
  matchAll: $a,
  isHTMLForm: Wa,
  hasOwnProperty: ot,
  hasOwnProp: ot,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors: Bt,
  freezeMethods: Ja,
  toObjectSet: Xa,
  toCamelCase: za,
  noop: Za,
  toFiniteNumber: er,
  findKey: Et,
  global: ve,
  isContextDefined: Tt,
  ALPHABET: Ft,
  generateString: tr,
  isSpecCompliantForm: sr,
  toJSONObject: ar,
  isAsyncFn: rr,
  isThenable: nr,
  setImmediate: Ct,
  asap: ir
};
function w(l, h, O, t, A) {
  Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = l, this.name = "AxiosError", h && (this.code = h), O && (this.config = O), t && (this.request = t), A && (this.response = A, this.status = A.status ? A.status : null);
}
f.inherits(w, Error, {
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
      config: f.toJSONObject(this.config),
      code: this.code,
      status: this.status
    };
  }
});
const It = w.prototype, Mt = {};
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
  Mt[l] = { value: l };
});
Object.defineProperties(w, Mt);
Object.defineProperty(It, "isAxiosError", { value: !0 });
w.from = (l, h, O, t, A, m) => {
  const S = Object.create(It);
  return f.toFlatObject(l, S, function(y) {
    return y !== Error.prototype;
  }, (j) => j !== "isAxiosError"), w.call(S, l.message, h, O, t, A), S.cause = l, S.name = l.name, m && Object.assign(S, m), S;
};
const or = null;
function Ge(l) {
  return f.isPlainObject(l) || f.isArray(l);
}
function wt(l) {
  return f.endsWith(l, "[]") ? l.slice(0, -2) : l;
}
function ct(l, h, O) {
  return l ? l.concat(h).map(function(A, m) {
    return A = wt(A), !O && m ? "[" + A + "]" : A;
  }).join(O ? "." : "") : h;
}
function lr(l) {
  return f.isArray(l) && !l.some(Ge);
}
const cr = f.toFlatObject(f, {}, null, function(h) {
  return /^is[A-Z]/.test(h);
});
function Me(l, h, O) {
  if (!f.isObject(l))
    throw new TypeError("target must be an object");
  h = h || new FormData(), O = f.toFlatObject(O, {
    metaTokens: !0,
    dots: !1,
    indexes: !1
  }, !1, function(L, B) {
    return !f.isUndefined(B[L]);
  });
  const t = O.metaTokens, A = O.visitor || _, m = O.dots, S = O.indexes, y = (O.Blob || typeof Blob < "u" && Blob) && f.isSpecCompliantForm(h);
  if (!f.isFunction(A))
    throw new TypeError("visitor must be a function");
  function R(F) {
    if (F === null) return "";
    if (f.isDate(F))
      return F.toISOString();
    if (!y && f.isBlob(F))
      throw new w("Blob is not supported. Use a Buffer instead.");
    return f.isArrayBuffer(F) || f.isTypedArray(F) ? y && typeof Blob == "function" ? new Blob([F]) : Buffer.from(F) : F;
  }
  function _(F, L, B) {
    let X = F;
    if (F && !B && typeof F == "object") {
      if (f.endsWith(L, "{}"))
        L = t ? L : L.slice(0, -2), F = JSON.stringify(F);
      else if (f.isArray(F) && lr(F) || (f.isFileList(F) || f.endsWith(L, "[]")) && (X = f.toArray(F)))
        return L = wt(L), X.forEach(function(D, J) {
          !(f.isUndefined(D) || D === null) && h.append(
            // eslint-disable-next-line no-nested-ternary
            S === !0 ? ct([L], J, m) : S === null ? L : L + "[]",
            R(D)
          );
        }), !1;
    }
    return Ge(F) ? !0 : (h.append(ct(B, L, m), R(F)), !1);
  }
  const T = [], N = Object.assign(cr, {
    defaultVisitor: _,
    convertValue: R,
    isVisitable: Ge
  });
  function G(F, L) {
    if (!f.isUndefined(F)) {
      if (T.indexOf(F) !== -1)
        throw Error("Circular reference detected in " + L.join("."));
      T.push(F), f.forEach(F, function(X, Z) {
        (!(f.isUndefined(X) || X === null) && A.call(
          h,
          X,
          f.isString(Z) ? Z.trim() : Z,
          L,
          N
        )) === !0 && G(X, L ? L.concat(Z) : [Z]);
      }), T.pop();
    }
  }
  if (!f.isObject(l))
    throw new TypeError("data must be an object");
  return G(l), h;
}
function dt(l) {
  const h = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(l).replace(/[!'()~]|%20|%00/g, function(t) {
    return h[t];
  });
}
function Ze(l, h) {
  this._pairs = [], l && Me(l, this, h);
}
const xt = Ze.prototype;
xt.append = function(h, O) {
  this._pairs.push([h, O]);
};
xt.toString = function(h) {
  const O = h ? function(t) {
    return h.call(this, t, dt);
  } : dt;
  return this._pairs.map(function(A) {
    return O(A[0]) + "=" + O(A[1]);
  }, "").join("&");
};
function dr(l) {
  return encodeURIComponent(l).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
}
function Lt(l, h, O) {
  if (!h)
    return l;
  const t = O && O.encode || dr, A = O && O.serialize;
  let m;
  if (A ? m = A(h, O) : m = f.isURLSearchParams(h) ? h.toString() : new Ze(h, O).toString(t), m) {
    const S = l.indexOf("#");
    S !== -1 && (l = l.slice(0, S)), l += (l.indexOf("?") === -1 ? "?" : "&") + m;
  }
  return l;
}
class ut {
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
  use(h, O, t) {
    return this.handlers.push({
      fulfilled: h,
      rejected: O,
      synchronous: t ? t.synchronous : !1,
      runWhen: t ? t.runWhen : null
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
    f.forEach(this.handlers, function(t) {
      t !== null && h(t);
    });
  }
}
const qt = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1
}, ur = typeof URLSearchParams < "u" ? URLSearchParams : Ze, hr = typeof FormData < "u" ? FormData : null, pr = typeof Blob < "u" ? Blob : null, vr = {
  isBrowser: !0,
  classes: {
    URLSearchParams: ur,
    FormData: hr,
    Blob: pr
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, et = typeof window < "u" && typeof document < "u", ke = typeof navigator == "object" && navigator || void 0, Ar = et && (!ke || ["ReactNative", "NativeScript", "NS"].indexOf(ke.product) < 0), Or = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", Pr = et && window.location.href || "http://localhost", br = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: et,
  hasStandardBrowserEnv: Ar,
  hasStandardBrowserWebWorkerEnv: Or,
  navigator: ke,
  origin: Pr
}, Symbol.toStringTag, { value: "Module" })), ne = {
  ...br,
  ...vr
};
function mr(l, h) {
  return Me(l, new ne.classes.URLSearchParams(), Object.assign({
    visitor: function(O, t, A, m) {
      return ne.isNode && f.isBuffer(O) ? (this.append(t, O.toString("base64")), !1) : m.defaultVisitor.apply(this, arguments);
    }
  }, h));
}
function Sr(l) {
  return f.matchAll(/\w+|\[(\w*)]/g, l).map((h) => h[0] === "[]" ? "" : h[1] || h[0]);
}
function fr(l) {
  const h = {}, O = Object.keys(l);
  let t;
  const A = O.length;
  let m;
  for (t = 0; t < A; t++)
    m = O[t], h[m] = l[m];
  return h;
}
function Dt(l) {
  function h(O, t, A, m) {
    let S = O[m++];
    if (S === "__proto__") return !0;
    const j = Number.isFinite(+S), y = m >= O.length;
    return S = !S && f.isArray(A) ? A.length : S, y ? (f.hasOwnProp(A, S) ? A[S] = [A[S], t] : A[S] = t, !j) : ((!A[S] || !f.isObject(A[S])) && (A[S] = []), h(O, t, A[S], m) && f.isArray(A[S]) && (A[S] = fr(A[S])), !j);
  }
  if (f.isFormData(l) && f.isFunction(l.entries)) {
    const O = {};
    return f.forEachEntry(l, (t, A) => {
      h(Sr(t), A, O, 0);
    }), O;
  }
  return null;
}
function gr(l, h, O) {
  if (f.isString(l))
    try {
      return (h || JSON.parse)(l), f.trim(l);
    } catch (t) {
      if (t.name !== "SyntaxError")
        throw t;
    }
  return (O || JSON.stringify)(l);
}
const _e = {
  transitional: qt,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [function(h, O) {
    const t = O.getContentType() || "", A = t.indexOf("application/json") > -1, m = f.isObject(h);
    if (m && f.isHTMLForm(h) && (h = new FormData(h)), f.isFormData(h))
      return A ? JSON.stringify(Dt(h)) : h;
    if (f.isArrayBuffer(h) || f.isBuffer(h) || f.isStream(h) || f.isFile(h) || f.isBlob(h) || f.isReadableStream(h))
      return h;
    if (f.isArrayBufferView(h))
      return h.buffer;
    if (f.isURLSearchParams(h))
      return O.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), h.toString();
    let j;
    if (m) {
      if (t.indexOf("application/x-www-form-urlencoded") > -1)
        return mr(h, this.formSerializer).toString();
      if ((j = f.isFileList(h)) || t.indexOf("multipart/form-data") > -1) {
        const y = this.env && this.env.FormData;
        return Me(
          j ? { "files[]": h } : h,
          y && new y(),
          this.formSerializer
        );
      }
    }
    return m || A ? (O.setContentType("application/json", !1), gr(h)) : h;
  }],
  transformResponse: [function(h) {
    const O = this.transitional || _e.transitional, t = O && O.forcedJSONParsing, A = this.responseType === "json";
    if (f.isResponse(h) || f.isReadableStream(h))
      return h;
    if (h && f.isString(h) && (t && !this.responseType || A)) {
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
    FormData: ne.classes.FormData,
    Blob: ne.classes.Blob
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
f.forEach(["delete", "get", "head", "post", "put", "patch"], (l) => {
  _e.headers[l] = {};
});
const jr = f.toObjectSet([
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
]), Ur = (l) => {
  const h = {};
  let O, t, A;
  return l && l.split(`
`).forEach(function(S) {
    A = S.indexOf(":"), O = S.substring(0, A).trim().toLowerCase(), t = S.substring(A + 1).trim(), !(!O || h[O] && jr[O]) && (O === "set-cookie" ? h[O] ? h[O].push(t) : h[O] = [t] : h[O] = h[O] ? h[O] + ", " + t : t);
  }), h;
}, ht = Symbol("internals");
function ge(l) {
  return l && String(l).trim().toLowerCase();
}
function Ee(l) {
  return l === !1 || l == null ? l : f.isArray(l) ? l.map(Ee) : String(l);
}
function Rr(l) {
  const h = /* @__PURE__ */ Object.create(null), O = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let t;
  for (; t = O.exec(l); )
    h[t[1]] = t[2];
  return h;
}
const _r = (l) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(l.trim());
function qe(l, h, O, t, A) {
  if (f.isFunction(t))
    return t.call(this, h, O);
  if (A && (h = O), !!f.isString(h)) {
    if (f.isString(t))
      return h.indexOf(t) !== -1;
    if (f.isRegExp(t))
      return t.test(h);
  }
}
function Vr(l) {
  return l.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (h, O, t) => O.toUpperCase() + t);
}
function yr(l, h) {
  const O = f.toCamelCase(" " + h);
  ["get", "set", "has"].forEach((t) => {
    Object.defineProperty(l, t + O, {
      value: function(A, m, S) {
        return this[t].call(this, h, A, m, S);
      },
      configurable: !0
    });
  });
}
let se = class {
  constructor(h) {
    h && this.set(h);
  }
  set(h, O, t) {
    const A = this;
    function m(j, y, R) {
      const _ = ge(y);
      if (!_)
        throw new Error("header name must be a non-empty string");
      const T = f.findKey(A, _);
      (!T || A[T] === void 0 || R === !0 || R === void 0 && A[T] !== !1) && (A[T || y] = Ee(j));
    }
    const S = (j, y) => f.forEach(j, (R, _) => m(R, _, y));
    if (f.isPlainObject(h) || h instanceof this.constructor)
      S(h, O);
    else if (f.isString(h) && (h = h.trim()) && !_r(h))
      S(Ur(h), O);
    else if (f.isHeaders(h))
      for (const [j, y] of h.entries())
        m(y, j, t);
    else
      h != null && m(O, h, t);
    return this;
  }
  get(h, O) {
    if (h = ge(h), h) {
      const t = f.findKey(this, h);
      if (t) {
        const A = this[t];
        if (!O)
          return A;
        if (O === !0)
          return Rr(A);
        if (f.isFunction(O))
          return O.call(this, A, t);
        if (f.isRegExp(O))
          return O.exec(A);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(h, O) {
    if (h = ge(h), h) {
      const t = f.findKey(this, h);
      return !!(t && this[t] !== void 0 && (!O || qe(this, this[t], t, O)));
    }
    return !1;
  }
  delete(h, O) {
    const t = this;
    let A = !1;
    function m(S) {
      if (S = ge(S), S) {
        const j = f.findKey(t, S);
        j && (!O || qe(t, t[j], j, O)) && (delete t[j], A = !0);
      }
    }
    return f.isArray(h) ? h.forEach(m) : m(h), A;
  }
  clear(h) {
    const O = Object.keys(this);
    let t = O.length, A = !1;
    for (; t--; ) {
      const m = O[t];
      (!h || qe(this, this[m], m, h, !0)) && (delete this[m], A = !0);
    }
    return A;
  }
  normalize(h) {
    const O = this, t = {};
    return f.forEach(this, (A, m) => {
      const S = f.findKey(t, m);
      if (S) {
        O[S] = Ee(A), delete O[m];
        return;
      }
      const j = h ? Vr(m) : String(m).trim();
      j !== m && delete O[m], O[j] = Ee(A), t[j] = !0;
    }), this;
  }
  concat(...h) {
    return this.constructor.concat(this, ...h);
  }
  toJSON(h) {
    const O = /* @__PURE__ */ Object.create(null);
    return f.forEach(this, (t, A) => {
      t != null && t !== !1 && (O[A] = h && f.isArray(t) ? t.join(", ") : t);
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
    const t = new this(h);
    return O.forEach((A) => t.set(A)), t;
  }
  static accessor(h) {
    const t = (this[ht] = this[ht] = {
      accessors: {}
    }).accessors, A = this.prototype;
    function m(S) {
      const j = ge(S);
      t[j] || (yr(A, S), t[j] = !0);
    }
    return f.isArray(h) ? h.forEach(m) : m(h), this;
  }
};
se.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
f.reduceDescriptors(se.prototype, ({ value: l }, h) => {
  let O = h[0].toUpperCase() + h.slice(1);
  return {
    get: () => l,
    set(t) {
      this[O] = t;
    }
  };
});
f.freezeMethods(se);
function De(l, h) {
  const O = this || _e, t = h || O, A = se.from(t.headers);
  let m = t.data;
  return f.forEach(l, function(j) {
    m = j.call(O, m, A.normalize(), h ? h.status : void 0);
  }), A.normalize(), m;
}
function Ht(l) {
  return !!(l && l.__CANCEL__);
}
function me(l, h, O) {
  w.call(this, l ?? "canceled", w.ERR_CANCELED, h, O), this.name = "CanceledError";
}
f.inherits(me, w, {
  __CANCEL__: !0
});
function Nt(l, h, O) {
  const t = O.config.validateStatus;
  !O.status || !t || t(O.status) ? l(O) : h(new w(
    "Request failed with status code " + O.status,
    [w.ERR_BAD_REQUEST, w.ERR_BAD_RESPONSE][Math.floor(O.status / 100) - 4],
    O.config,
    O.request,
    O
  ));
}
function Er(l) {
  const h = /^([-+\w]{1,25})(:?\/\/|:)/.exec(l);
  return h && h[1] || "";
}
function Tr(l, h) {
  l = l || 10;
  const O = new Array(l), t = new Array(l);
  let A = 0, m = 0, S;
  return h = h !== void 0 ? h : 1e3, function(y) {
    const R = Date.now(), _ = t[m];
    S || (S = R), O[A] = y, t[A] = R;
    let T = m, N = 0;
    for (; T !== A; )
      N += O[T++], T = T % l;
    if (A = (A + 1) % l, A === m && (m = (m + 1) % l), R - S < h)
      return;
    const G = _ && R - _;
    return G ? Math.round(N * 1e3 / G) : void 0;
  };
}
function Br(l, h) {
  let O = 0, t = 1e3 / h, A, m;
  const S = (R, _ = Date.now()) => {
    O = _, A = null, m && (clearTimeout(m), m = null), l.apply(null, R);
  };
  return [(...R) => {
    const _ = Date.now(), T = _ - O;
    T >= t ? S(R, _) : (A = R, m || (m = setTimeout(() => {
      m = null, S(A);
    }, t - T)));
  }, () => A && S(A)];
}
const Te = (l, h, O = 3) => {
  let t = 0;
  const A = Tr(50, 250);
  return Br((m) => {
    const S = m.loaded, j = m.lengthComputable ? m.total : void 0, y = S - t, R = A(y), _ = S <= j;
    t = S;
    const T = {
      loaded: S,
      total: j,
      progress: j ? S / j : void 0,
      bytes: y,
      rate: R || void 0,
      estimated: R && j && _ ? (j - S) / R : void 0,
      event: m,
      lengthComputable: j != null,
      [h ? "download" : "upload"]: !0
    };
    l(T);
  }, O);
}, pt = (l, h) => {
  const O = l != null;
  return [(t) => h[0]({
    lengthComputable: O,
    total: l,
    loaded: t
  }), h[1]];
}, vt = (l) => (...h) => f.asap(() => l(...h)), Fr = ne.hasStandardBrowserEnv ? (
  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  function() {
    const h = ne.navigator && /(msie|trident)/i.test(ne.navigator.userAgent), O = document.createElement("a");
    let t;
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
    return t = A(window.location.href), function(S) {
      const j = f.isString(S) ? A(S) : S;
      return j.protocol === t.protocol && j.host === t.host;
    };
  }()
) : (
  // Non standard browser envs (web workers, react-native) lack needed support.
  /* @__PURE__ */ function() {
    return function() {
      return !0;
    };
  }()
), Cr = ne.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(l, h, O, t, A, m) {
      const S = [l + "=" + encodeURIComponent(h)];
      f.isNumber(O) && S.push("expires=" + new Date(O).toGMTString()), f.isString(t) && S.push("path=" + t), f.isString(A) && S.push("domain=" + A), m === !0 && S.push("secure"), document.cookie = S.join("; ");
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
function Ir(l) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(l);
}
function Mr(l, h) {
  return h ? l.replace(/\/?\/$/, "") + "/" + h.replace(/^\/+/, "") : l;
}
function Gt(l, h) {
  return l && !Ir(h) ? Mr(l, h) : h;
}
const At = (l) => l instanceof se ? { ...l } : l;
function Oe(l, h) {
  h = h || {};
  const O = {};
  function t(R, _, T) {
    return f.isPlainObject(R) && f.isPlainObject(_) ? f.merge.call({ caseless: T }, R, _) : f.isPlainObject(_) ? f.merge({}, _) : f.isArray(_) ? _.slice() : _;
  }
  function A(R, _, T) {
    if (f.isUndefined(_)) {
      if (!f.isUndefined(R))
        return t(void 0, R, T);
    } else return t(R, _, T);
  }
  function m(R, _) {
    if (!f.isUndefined(_))
      return t(void 0, _);
  }
  function S(R, _) {
    if (f.isUndefined(_)) {
      if (!f.isUndefined(R))
        return t(void 0, R);
    } else return t(void 0, _);
  }
  function j(R, _, T) {
    if (T in h)
      return t(R, _);
    if (T in l)
      return t(void 0, R);
  }
  const y = {
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
    headers: (R, _) => A(At(R), At(_), !0)
  };
  return f.forEach(Object.keys(Object.assign({}, l, h)), function(_) {
    const T = y[_] || A, N = T(l[_], h[_], _);
    f.isUndefined(N) && T !== j || (O[_] = N);
  }), O;
}
const kt = (l) => {
  const h = Oe({}, l);
  let { data: O, withXSRFToken: t, xsrfHeaderName: A, xsrfCookieName: m, headers: S, auth: j } = h;
  h.headers = S = se.from(S), h.url = Lt(Gt(h.baseURL, h.url), l.params, l.paramsSerializer), j && S.set(
    "Authorization",
    "Basic " + btoa((j.username || "") + ":" + (j.password ? unescape(encodeURIComponent(j.password)) : ""))
  );
  let y;
  if (f.isFormData(O)) {
    if (ne.hasStandardBrowserEnv || ne.hasStandardBrowserWebWorkerEnv)
      S.setContentType(void 0);
    else if ((y = S.getContentType()) !== !1) {
      const [R, ..._] = y ? y.split(";").map((T) => T.trim()).filter(Boolean) : [];
      S.setContentType([R || "multipart/form-data", ..._].join("; "));
    }
  }
  if (ne.hasStandardBrowserEnv && (t && f.isFunction(t) && (t = t(h)), t || t !== !1 && Fr(h.url))) {
    const R = A && m && Cr.read(m);
    R && S.set(A, R);
  }
  return h;
}, wr = typeof XMLHttpRequest < "u", xr = wr && function(l) {
  return new Promise(function(O, t) {
    const A = kt(l);
    let m = A.data;
    const S = se.from(A.headers).normalize();
    let { responseType: j, onUploadProgress: y, onDownloadProgress: R } = A, _, T, N, G, F;
    function L() {
      G && G(), F && F(), A.cancelToken && A.cancelToken.unsubscribe(_), A.signal && A.signal.removeEventListener("abort", _);
    }
    let B = new XMLHttpRequest();
    B.open(A.method.toUpperCase(), A.url, !0), B.timeout = A.timeout;
    function X() {
      if (!B)
        return;
      const D = se.from(
        "getAllResponseHeaders" in B && B.getAllResponseHeaders()
      ), ie = {
        data: !j || j === "text" || j === "json" ? B.responseText : B.response,
        status: B.status,
        statusText: B.statusText,
        headers: D,
        config: l,
        request: B
      };
      Nt(function(te) {
        O(te), L();
      }, function(te) {
        t(te), L();
      }, ie), B = null;
    }
    "onloadend" in B ? B.onloadend = X : B.onreadystatechange = function() {
      !B || B.readyState !== 4 || B.status === 0 && !(B.responseURL && B.responseURL.indexOf("file:") === 0) || setTimeout(X);
    }, B.onabort = function() {
      B && (t(new w("Request aborted", w.ECONNABORTED, l, B)), B = null);
    }, B.onerror = function() {
      t(new w("Network Error", w.ERR_NETWORK, l, B)), B = null;
    }, B.ontimeout = function() {
      let J = A.timeout ? "timeout of " + A.timeout + "ms exceeded" : "timeout exceeded";
      const ie = A.transitional || qt;
      A.timeoutErrorMessage && (J = A.timeoutErrorMessage), t(new w(
        J,
        ie.clarifyTimeoutError ? w.ETIMEDOUT : w.ECONNABORTED,
        l,
        B
      )), B = null;
    }, m === void 0 && S.setContentType(null), "setRequestHeader" in B && f.forEach(S.toJSON(), function(J, ie) {
      B.setRequestHeader(ie, J);
    }), f.isUndefined(A.withCredentials) || (B.withCredentials = !!A.withCredentials), j && j !== "json" && (B.responseType = A.responseType), R && ([N, F] = Te(R, !0), B.addEventListener("progress", N)), y && B.upload && ([T, G] = Te(y), B.upload.addEventListener("progress", T), B.upload.addEventListener("loadend", G)), (A.cancelToken || A.signal) && (_ = (D) => {
      B && (t(!D || D.type ? new me(null, l, B) : D), B.abort(), B = null);
    }, A.cancelToken && A.cancelToken.subscribe(_), A.signal && (A.signal.aborted ? _() : A.signal.addEventListener("abort", _)));
    const Z = Er(A.url);
    if (Z && ne.protocols.indexOf(Z) === -1) {
      t(new w("Unsupported protocol " + Z + ":", w.ERR_BAD_REQUEST, l));
      return;
    }
    B.send(m || null);
  });
}, Lr = (l, h) => {
  let O = new AbortController(), t;
  const A = function(y) {
    if (!t) {
      t = !0, S();
      const R = y instanceof Error ? y : this.reason;
      O.abort(R instanceof w ? R : new me(R instanceof Error ? R.message : R));
    }
  };
  let m = h && setTimeout(() => {
    A(new w(`timeout ${h} of ms exceeded`, w.ETIMEDOUT));
  }, h);
  const S = () => {
    l && (m && clearTimeout(m), m = null, l.forEach((y) => {
      y && (y.removeEventListener ? y.removeEventListener("abort", A) : y.unsubscribe(A));
    }), l = null);
  };
  l.forEach((y) => y && y.addEventListener && y.addEventListener("abort", A));
  const { signal: j } = O;
  return j.unsubscribe = S, [j, () => {
    m && clearTimeout(m), m = null;
  }];
}, qr = function* (l, h) {
  let O = l.byteLength;
  if (!h || O < h) {
    yield l;
    return;
  }
  let t = 0, A;
  for (; t < O; )
    A = t + h, yield l.slice(t, A), t = A;
}, Dr = async function* (l, h, O) {
  for await (const t of l)
    yield* qr(ArrayBuffer.isView(t) ? t : await O(String(t)), h);
}, Ot = (l, h, O, t, A) => {
  const m = Dr(l, h, A);
  let S = 0, j, y = (R) => {
    j || (j = !0, t && t(R));
  };
  return new ReadableStream({
    async pull(R) {
      try {
        const { done: _, value: T } = await m.next();
        if (_) {
          y(), R.close();
          return;
        }
        let N = T.byteLength;
        if (O) {
          let G = S += N;
          O(G);
        }
        R.enqueue(new Uint8Array(T));
      } catch (_) {
        throw y(_), _;
      }
    },
    cancel(R) {
      return y(R), m.return();
    }
  }, {
    highWaterMark: 2
  });
}, we = typeof fetch == "function" && typeof Request == "function" && typeof Response == "function", Qt = we && typeof ReadableStream == "function", Qe = we && (typeof TextEncoder == "function" ? /* @__PURE__ */ ((l) => (h) => l.encode(h))(new TextEncoder()) : async (l) => new Uint8Array(await new Response(l).arrayBuffer())), Yt = (l, ...h) => {
  try {
    return !!l(...h);
  } catch {
    return !1;
  }
}, Hr = Qt && Yt(() => {
  let l = !1;
  const h = new Request(ne.origin, {
    body: new ReadableStream(),
    method: "POST",
    get duplex() {
      return l = !0, "half";
    }
  }).headers.has("Content-Type");
  return l && !h;
}), Pt = 64 * 1024, Ye = Qt && Yt(() => f.isReadableStream(new Response("").body)), Be = {
  stream: Ye && ((l) => l.body)
};
we && ((l) => {
  ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((h) => {
    !Be[h] && (Be[h] = f.isFunction(l[h]) ? (O) => O[h]() : (O, t) => {
      throw new w(`Response type '${h}' is not supported`, w.ERR_NOT_SUPPORT, t);
    });
  });
})(new Response());
const Nr = async (l) => {
  if (l == null)
    return 0;
  if (f.isBlob(l))
    return l.size;
  if (f.isSpecCompliantForm(l))
    return (await new Request(l).arrayBuffer()).byteLength;
  if (f.isArrayBufferView(l) || f.isArrayBuffer(l))
    return l.byteLength;
  if (f.isURLSearchParams(l) && (l = l + ""), f.isString(l))
    return (await Qe(l)).byteLength;
}, Gr = async (l, h) => {
  const O = f.toFiniteNumber(l.getContentLength());
  return O ?? Nr(h);
}, kr = we && (async (l) => {
  let {
    url: h,
    method: O,
    data: t,
    signal: A,
    cancelToken: m,
    timeout: S,
    onDownloadProgress: j,
    onUploadProgress: y,
    responseType: R,
    headers: _,
    withCredentials: T = "same-origin",
    fetchOptions: N
  } = kt(l);
  R = R ? (R + "").toLowerCase() : "text";
  let [G, F] = A || m || S ? Lr([A, m], S) : [], L, B;
  const X = () => {
    !L && setTimeout(() => {
      G && G.unsubscribe();
    }), L = !0;
  };
  let Z;
  try {
    if (y && Hr && O !== "get" && O !== "head" && (Z = await Gr(_, t)) !== 0) {
      let te = new Request(h, {
        method: "POST",
        body: t,
        duplex: "half"
      }), ce;
      if (f.isFormData(t) && (ce = te.headers.get("content-type")) && _.setContentType(ce), te.body) {
        const [fe, Pe] = pt(
          Z,
          Te(vt(y))
        );
        t = Ot(te.body, Pt, fe, Pe, Qe);
      }
    }
    f.isString(T) || (T = T ? "include" : "omit");
    const D = "credentials" in Request.prototype;
    B = new Request(h, {
      ...N,
      signal: G,
      method: O.toUpperCase(),
      headers: _.normalize().toJSON(),
      body: t,
      duplex: "half",
      credentials: D ? T : void 0
    });
    let J = await fetch(B);
    const ie = Ye && (R === "stream" || R === "response");
    if (Ye && (j || ie)) {
      const te = {};
      ["status", "statusText", "headers"].forEach((Ve) => {
        te[Ve] = J[Ve];
      });
      const ce = f.toFiniteNumber(J.headers.get("content-length")), [fe, Pe] = j && pt(
        ce,
        Te(vt(j), !0)
      ) || [];
      J = new Response(
        Ot(J.body, Pt, fe, () => {
          Pe && Pe(), ie && X();
        }, Qe),
        te
      );
    }
    R = R || "text";
    let Se = await Be[f.findKey(Be, R) || "text"](J, l);
    return !ie && X(), F && F(), await new Promise((te, ce) => {
      Nt(te, ce, {
        data: Se,
        headers: se.from(J.headers),
        status: J.status,
        statusText: J.statusText,
        config: l,
        request: B
      });
    });
  } catch (D) {
    throw X(), D && D.name === "TypeError" && /fetch/i.test(D.message) ? Object.assign(
      new w("Network Error", w.ERR_NETWORK, l, B),
      {
        cause: D.cause || D
      }
    ) : w.from(D, D && D.code, l, B);
  }
}), $e = {
  http: or,
  xhr: xr,
  fetch: kr
};
f.forEach($e, (l, h) => {
  if (l) {
    try {
      Object.defineProperty(l, "name", { value: h });
    } catch {
    }
    Object.defineProperty(l, "adapterName", { value: h });
  }
});
const bt = (l) => `- ${l}`, Qr = (l) => f.isFunction(l) || l === null || l === !1, $t = {
  getAdapter: (l) => {
    l = f.isArray(l) ? l : [l];
    const { length: h } = l;
    let O, t;
    const A = {};
    for (let m = 0; m < h; m++) {
      O = l[m];
      let S;
      if (t = O, !Qr(O) && (t = $e[(S = String(O)).toLowerCase()], t === void 0))
        throw new w(`Unknown adapter '${S}'`);
      if (t)
        break;
      A[S || "#" + m] = t;
    }
    if (!t) {
      const m = Object.entries(A).map(
        ([j, y]) => `adapter ${j} ` + (y === !1 ? "is not supported by the environment" : "is not available in the build")
      );
      let S = h ? m.length > 1 ? `since :
` + m.map(bt).join(`
`) : " " + bt(m[0]) : "as no adapter specified";
      throw new w(
        "There is no suitable adapter to dispatch the request " + S,
        "ERR_NOT_SUPPORT"
      );
    }
    return t;
  },
  adapters: $e
};
function He(l) {
  if (l.cancelToken && l.cancelToken.throwIfRequested(), l.signal && l.signal.aborted)
    throw new me(null, l);
}
function mt(l) {
  return He(l), l.headers = se.from(l.headers), l.data = De.call(
    l,
    l.transformRequest
  ), ["post", "put", "patch"].indexOf(l.method) !== -1 && l.headers.setContentType("application/x-www-form-urlencoded", !1), $t.getAdapter(l.adapter || _e.adapter)(l).then(function(t) {
    return He(l), t.data = De.call(
      l,
      l.transformResponse,
      t
    ), t.headers = se.from(t.headers), t;
  }, function(t) {
    return Ht(t) || (He(l), t && t.response && (t.response.data = De.call(
      l,
      l.transformResponse,
      t.response
    ), t.response.headers = se.from(t.response.headers))), Promise.reject(t);
  });
}
const Wt = "1.7.5", tt = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((l, h) => {
  tt[l] = function(t) {
    return typeof t === l || "a" + (h < 1 ? "n " : " ") + l;
  };
});
const St = {};
tt.transitional = function(h, O, t) {
  function A(m, S) {
    return "[Axios v" + Wt + "] Transitional option '" + m + "'" + S + (t ? ". " + t : "");
  }
  return (m, S, j) => {
    if (h === !1)
      throw new w(
        A(S, " has been removed" + (O ? " in " + O : "")),
        w.ERR_DEPRECATED
      );
    return O && !St[S] && (St[S] = !0, console.warn(
      A(
        S,
        " has been deprecated since v" + O + " and will be removed in the near future"
      )
    )), h ? h(m, S, j) : !0;
  };
};
function Yr(l, h, O) {
  if (typeof l != "object")
    throw new w("options must be an object", w.ERR_BAD_OPTION_VALUE);
  const t = Object.keys(l);
  let A = t.length;
  for (; A-- > 0; ) {
    const m = t[A], S = h[m];
    if (S) {
      const j = l[m], y = j === void 0 || S(j, m, l);
      if (y !== !0)
        throw new w("option " + m + " must be " + y, w.ERR_BAD_OPTION_VALUE);
      continue;
    }
    if (O !== !0)
      throw new w("Unknown option " + m, w.ERR_BAD_OPTION);
  }
}
const We = {
  assertOptions: Yr,
  validators: tt
}, ue = We.validators;
let Ae = class {
  constructor(h) {
    this.defaults = h, this.interceptors = {
      request: new ut(),
      response: new ut()
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
    } catch (t) {
      if (t instanceof Error) {
        let A;
        Error.captureStackTrace ? Error.captureStackTrace(A = {}) : A = new Error();
        const m = A.stack ? A.stack.replace(/^.+\n/, "") : "";
        try {
          t.stack ? m && !String(t.stack).endsWith(m.replace(/^.+\n.+\n/, "")) && (t.stack += `
` + m) : t.stack = m;
        } catch {
        }
      }
      throw t;
    }
  }
  _request(h, O) {
    typeof h == "string" ? (O = O || {}, O.url = h) : O = h || {}, O = Oe(this.defaults, O);
    const { transitional: t, paramsSerializer: A, headers: m } = O;
    t !== void 0 && We.assertOptions(t, {
      silentJSONParsing: ue.transitional(ue.boolean),
      forcedJSONParsing: ue.transitional(ue.boolean),
      clarifyTimeoutError: ue.transitional(ue.boolean)
    }, !1), A != null && (f.isFunction(A) ? O.paramsSerializer = {
      serialize: A
    } : We.assertOptions(A, {
      encode: ue.function,
      serialize: ue.function
    }, !0)), O.method = (O.method || this.defaults.method || "get").toLowerCase();
    let S = m && f.merge(
      m.common,
      m[O.method]
    );
    m && f.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      (F) => {
        delete m[F];
      }
    ), O.headers = se.concat(S, m);
    const j = [];
    let y = !0;
    this.interceptors.request.forEach(function(L) {
      typeof L.runWhen == "function" && L.runWhen(O) === !1 || (y = y && L.synchronous, j.unshift(L.fulfilled, L.rejected));
    });
    const R = [];
    this.interceptors.response.forEach(function(L) {
      R.push(L.fulfilled, L.rejected);
    });
    let _, T = 0, N;
    if (!y) {
      const F = [mt.bind(this), void 0];
      for (F.unshift.apply(F, j), F.push.apply(F, R), N = F.length, _ = Promise.resolve(O); T < N; )
        _ = _.then(F[T++], F[T++]);
      return _;
    }
    N = j.length;
    let G = O;
    for (T = 0; T < N; ) {
      const F = j[T++], L = j[T++];
      try {
        G = F(G);
      } catch (B) {
        L.call(this, B);
        break;
      }
    }
    try {
      _ = mt.call(this, G);
    } catch (F) {
      return Promise.reject(F);
    }
    for (T = 0, N = R.length; T < N; )
      _ = _.then(R[T++], R[T++]);
    return _;
  }
  getUri(h) {
    h = Oe(this.defaults, h);
    const O = Gt(h.baseURL, h.url);
    return Lt(O, h.params, h.paramsSerializer);
  }
};
f.forEach(["delete", "get", "head", "options"], function(h) {
  Ae.prototype[h] = function(O, t) {
    return this.request(Oe(t || {}, {
      method: h,
      url: O,
      data: (t || {}).data
    }));
  };
});
f.forEach(["post", "put", "patch"], function(h) {
  function O(t) {
    return function(m, S, j) {
      return this.request(Oe(j || {}, {
        method: h,
        headers: t ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url: m,
        data: S
      }));
    };
  }
  Ae.prototype[h] = O(), Ae.prototype[h + "Form"] = O(!0);
});
let $r = class zt {
  constructor(h) {
    if (typeof h != "function")
      throw new TypeError("executor must be a function.");
    let O;
    this.promise = new Promise(function(m) {
      O = m;
    });
    const t = this;
    this.promise.then((A) => {
      if (!t._listeners) return;
      let m = t._listeners.length;
      for (; m-- > 0; )
        t._listeners[m](A);
      t._listeners = null;
    }), this.promise.then = (A) => {
      let m;
      const S = new Promise((j) => {
        t.subscribe(j), m = j;
      }).then(A);
      return S.cancel = function() {
        t.unsubscribe(m);
      }, S;
    }, h(function(m, S, j) {
      t.reason || (t.reason = new me(m, S, j), O(t.reason));
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
      token: new zt(function(A) {
        h = A;
      }),
      cancel: h
    };
  }
};
function Wr(l) {
  return function(O) {
    return l.apply(null, O);
  };
}
function zr(l) {
  return f.isObject(l) && l.isAxiosError === !0;
}
const ze = {
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
Object.entries(ze).forEach(([l, h]) => {
  ze[h] = l;
});
function Kt(l) {
  const h = new Ae(l), O = _t(Ae.prototype.request, h);
  return f.extend(O, Ae.prototype, h, { allOwnKeys: !0 }), f.extend(O, h, null, { allOwnKeys: !0 }), O.create = function(A) {
    return Kt(Oe(l, A));
  }, O;
}
const $ = Kt(_e);
$.Axios = Ae;
$.CanceledError = me;
$.CancelToken = $r;
$.isCancel = Ht;
$.VERSION = Wt;
$.toFormData = Me;
$.AxiosError = w;
$.Cancel = $.CanceledError;
$.all = function(h) {
  return Promise.all(h);
};
$.spread = Wr;
$.isAxiosError = zr;
$.mergeConfig = Oe;
$.AxiosHeaders = se;
$.formToJSON = (l) => Dt(f.isHTMLForm(l) ? new FormData(l) : l);
$.getAdapter = $t.getAdapter;
$.HttpStatusCode = ze;
$.default = $;
const {
  Axios: Kr,
  AxiosError: Jr,
  CanceledError: Xr,
  isCancel: Zr,
  CancelToken: en,
  VERSION: tn,
  all: sn,
  Cancel: an,
  isAxiosError: rn,
  spread: nn,
  toFormData: on,
  AxiosHeaders: ln,
  HttpStatusCode: cn,
  formToJSON: dn,
  getAdapter: un,
  mergeConfig: hn
} = $, pn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Axios: Kr,
  AxiosError: Jr,
  AxiosHeaders: ln,
  Cancel: an,
  CancelToken: en,
  CanceledError: Xr,
  HttpStatusCode: cn,
  VERSION: tn,
  all: sn,
  default: $,
  formToJSON: dn,
  getAdapter: un,
  isAxiosError: rn,
  isCancel: Zr,
  mergeConfig: hn,
  spread: nn,
  toFormData: on
}, Symbol.toStringTag, { value: "Module" })), Jt = /* @__PURE__ */ fa(pn);
var Y = {}, st = {};
(function(l) {
  Object.defineProperty(l, "__esModule", { value: !0 }), l.operationServerMap = l.RequiredError = l.BaseAPI = l.COLLECTION_FORMATS = l.BASE_PATH = void 0;
  const h = Jt;
  l.BASE_PATH = "http://undefinedundefined".replace(/\/+$/, ""), l.COLLECTION_FORMATS = {
    csv: ",",
    ssv: " ",
    tsv: "	",
    pipes: "|"
  };
  class O {
    constructor(m, S = l.BASE_PATH, j = h.default) {
      var y;
      this.basePath = S, this.axios = j, m && (this.configuration = m, this.basePath = (y = m.basePath) !== null && y !== void 0 ? y : S);
    }
  }
  l.BaseAPI = O;
  class t extends Error {
    constructor(m, S) {
      super(S), this.field = m, this.name = "RequiredError";
    }
  }
  l.RequiredError = t, l.operationServerMap = {};
})(st);
var at = he && he.__awaiter || function(l, h, O, t) {
  function A(m) {
    return m instanceof O ? m : new O(function(S) {
      S(m);
    });
  }
  return new (O || (O = Promise))(function(m, S) {
    function j(_) {
      try {
        R(t.next(_));
      } catch (T) {
        S(T);
      }
    }
    function y(_) {
      try {
        R(t.throw(_));
      } catch (T) {
        S(T);
      }
    }
    function R(_) {
      _.done ? m(_.value) : A(_.value).then(j, y);
    }
    R((t = t.apply(l, h || [])).next());
  });
};
Object.defineProperty(Y, "__esModule", { value: !0 });
Y.createRequestFunction = Y.toPathString = Y.serializeDataIfNeeded = Y.setSearchParams = Y.setOAuthToObject = Y.setBearerAuthToObject = Y.setBasicAuthToObject = Y.setApiKeyToObject = Y.assertParamExists = Y.DUMMY_BASE_URL = void 0;
const vn = st;
Y.DUMMY_BASE_URL = "https://example.com";
const An = function(l, h, O) {
  if (O == null)
    throw new vn.RequiredError(h, `Required parameter ${h} was null or undefined when calling ${l}.`);
};
Y.assertParamExists = An;
const On = function(l, h, O) {
  return at(this, void 0, void 0, function* () {
    if (O && O.apiKey) {
      const t = typeof O.apiKey == "function" ? yield O.apiKey(h) : yield O.apiKey;
      l[h] = t;
    }
  });
};
Y.setApiKeyToObject = On;
const Pn = function(l, h) {
  h && (h.username || h.password) && (l.auth = { username: h.username, password: h.password });
};
Y.setBasicAuthToObject = Pn;
const bn = function(l, h) {
  return at(this, void 0, void 0, function* () {
    if (h && h.accessToken) {
      const O = typeof h.accessToken == "function" ? yield h.accessToken() : yield h.accessToken;
      l.Authorization = "Bearer " + O;
    }
  });
};
Y.setBearerAuthToObject = bn;
const mn = function(l, h, O, t) {
  return at(this, void 0, void 0, function* () {
    if (t && t.accessToken) {
      const A = typeof t.accessToken == "function" ? yield t.accessToken(h, O) : yield t.accessToken;
      l.Authorization = "Bearer " + A;
    }
  });
};
Y.setOAuthToObject = mn;
function Ke(l, h, O = "") {
  h != null && (typeof h == "object" ? Array.isArray(h) ? h.forEach((t) => Ke(l, t, O)) : Object.keys(h).forEach((t) => Ke(l, h[t], `${O}${O !== "" ? "." : ""}${t}`)) : l.has(O) ? l.append(O, h) : l.set(O, h));
}
const Sn = function(l, ...h) {
  const O = new URLSearchParams(l.search);
  Ke(O, h), l.search = O.toString();
};
Y.setSearchParams = Sn;
const fn = function(l, h, O) {
  const t = typeof l != "string";
  return (t && O && O.isJsonMime ? O.isJsonMime(h.headers["Content-Type"]) : t) ? JSON.stringify(l !== void 0 ? l : {}) : l || "";
};
Y.serializeDataIfNeeded = fn;
const gn = function(l) {
  return l.pathname + l.search + l.hash;
};
Y.toPathString = gn;
const jn = function(l, h, O, t) {
  return (A = h, m = O) => {
    var S;
    const j = Object.assign(Object.assign({}, l.options), { url: (A.defaults.baseURL ? "" : (S = t == null ? void 0 : t.basePath) !== null && S !== void 0 ? S : m) + l.url });
    return A.request(j);
  };
};
Y.createRequestFunction = jn;
(function(l) {
  var h = he && he.__awaiter || function(r, c, o, i) {
    function e(a) {
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
        p.done ? a(p.value) : e(p.value).then(n, u);
      }
      d((i = i.apply(r, c || [])).next());
    });
  };
  Object.defineProperty(l, "__esModule", { value: !0 }), l.ProductCategoriesApiAxiosParamCreator = l.PointofsaleApi = l.PointofsaleApiFactory = l.PointofsaleApiFp = l.PointofsaleApiAxiosParamCreator = l.PayoutRequestsApi = l.PayoutRequestsApiFactory = l.PayoutRequestsApiFp = l.PayoutRequestsApiAxiosParamCreator = l.GetAllInvoicesCurrentStateEnum = l.InvoicesApi = l.InvoicesApiFactory = l.InvoicesApiFp = l.InvoicesApiAxiosParamCreator = l.FilesApi = l.FilesApiFactory = l.FilesApiFp = l.FilesApiAxiosParamCreator = l.EventsApi = l.EventsApiFactory = l.EventsApiFp = l.EventsApiAxiosParamCreator = l.DebtorsApi = l.DebtorsApiFactory = l.DebtorsApiFp = l.DebtorsApiAxiosParamCreator = l.ContainersApi = l.ContainersApiFactory = l.ContainersApiFp = l.ContainersApiAxiosParamCreator = l.BannersApi = l.BannersApiFactory = l.BannersApiFp = l.BannersApiAxiosParamCreator = l.GetAllBalanceOrderDirectionEnum = l.GetAllBalanceUserTypesEnum = l.BalanceApi = l.BalanceApiFactory = l.BalanceApiFp = l.BalanceApiAxiosParamCreator = l.AuthenticateApi = l.AuthenticateApiFactory = l.AuthenticateApiFp = l.AuthenticateApiAxiosParamCreator = l.UpdateInvoiceRequestStateEnum = l.PayoutRequestStatusRequestStateEnum = l.PayoutRequestResponseStatusEnum = l.InvoiceStatusResponseStateEnum = l.FinancialMutationResponseTypeEnum = l.BasePayoutRequestResponseStatusEnum = void 0, l.WriteoffsApi = l.WriteoffsApiFactory = l.WriteoffsApiFp = l.WriteoffsApiAxiosParamCreator = l.VouchergroupsApi = l.VouchergroupsApiFactory = l.VouchergroupsApiFp = l.VouchergroupsApiAxiosParamCreator = l.VatGroupsApi = l.VatGroupsApiFactory = l.VatGroupsApiFp = l.VatGroupsApiAxiosParamCreator = l.GetAllUsersTypeEnum = l.UsersApi = l.UsersApiFactory = l.UsersApiFp = l.UsersApiAxiosParamCreator = l.TransfersApi = l.TransfersApiFactory = l.TransfersApiFp = l.TransfersApiAxiosParamCreator = l.TransactionsApi = l.TransactionsApiFactory = l.TransactionsApiFp = l.TransactionsApiAxiosParamCreator = l.TestOperationsOfTheTestControllerApi = l.TestOperationsOfTheTestControllerApiFactory = l.TestOperationsOfTheTestControllerApiFp = l.TestOperationsOfTheTestControllerApiAxiosParamCreator = l.StripeApi = l.StripeApiFactory = l.StripeApiFp = l.StripeApiAxiosParamCreator = l.RootApi = l.RootApiFactory = l.RootApiFp = l.RootApiAxiosParamCreator = l.RbacApi = l.RbacApiFactory = l.RbacApiFp = l.RbacApiAxiosParamCreator = l.ProductsApi = l.ProductsApiFactory = l.ProductsApiFp = l.ProductsApiAxiosParamCreator = l.ProductCategoriesApi = l.ProductCategoriesApiFactory = l.ProductCategoriesApiFp = void 0;
  const O = Jt, t = Y, A = st;
  l.BasePayoutRequestResponseStatusEnum = {
    Created: "CREATED",
    Approved: "APPROVED",
    Denied: "DENIED",
    Cancelled: "CANCELLED"
  }, l.FinancialMutationResponseTypeEnum = {
    Transfer: "transfer",
    Transaction: "transaction"
  }, l.InvoiceStatusResponseStateEnum = {
    Created: "CREATED",
    Sent: "SENT",
    Paid: "PAID",
    Deleted: "DELETED"
  }, l.PayoutRequestResponseStatusEnum = {
    Created: "CREATED",
    Approved: "APPROVED",
    Denied: "DENIED",
    Cancelled: "CANCELLED"
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
       * @summary Get a JWT token for the given POS
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      authenticatePointOfSale: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("authenticatePointOfSale", "id", i);
        const a = "/authentication/pointofsale/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary EAN login and hand out token
       * @param {AuthenticationEanRequest} authenticationEanRequest The EAN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      eanAuthentication: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("eanAuthentication", "authenticationEanRequest", i);
        const a = "/authentication/ean", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get the GEWISWeb public token used by SudoSOS
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getGEWISWebPublic: (...c) => h(this, [...c], void 0, function* (o = {}) {
        const i = "/authentication/gewisweb", e = new URL(i, t.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const s = Object.assign(Object.assign({ method: "GET" }, a), o), n = {}, u = {};
        (0, t.setSearchParams)(e, u);
        let d = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, n), d), o.headers), {
          url: (0, t.toPathString)(e),
          options: s
        };
      }),
      /**
       *
       * @summary LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisLDAPAuthentication: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("gewisLDAPAuthentication", "authenticationLDAPRequest", i);
        const a = "/authentication/GEWIS/LDAP", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      gewisPinAuthentication: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("gewisPinAuthentication", "gEWISAuthenticationPinRequest", i);
        const a = "/authentication/GEWIS/pin", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      gewisWebAuthentication: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("gewisWebAuthentication", "gewiswebAuthenticationRequest", i);
        const a = "/authentication/gewisweb", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      keyAuthentication: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("keyAuthentication", "authenticationKeyRequest", i);
        const a = "/authentication/key", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      ldapAuthentication: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("ldapAuthentication", "authenticationLDAPRequest", i);
        const a = "/authentication/LDAP", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      localAuthentication: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("localAuthentication", "authenticationLocalRequest", i);
        const a = "/authentication/local", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      mockAuthentication: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("mockAuthentication", "authenticationMockRequest", i);
        const a = "/authentication/mock", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      nfcAuthentication: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("nfcAuthentication", "authenticationNfcRequest", i);
        const a = "/authentication/nfc", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      pinAuthentication: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("pinAuthentication", "authenticationPinRequest", i);
        const a = "/authentication/pin", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
        const i = "/authentication/refreshToken", e = new URL(i, t.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const s = Object.assign(Object.assign({ method: "GET" }, a), o), n = {}, u = {};
        yield (0, t.setBearerAuthToObject)(n, r), (0, t.setSearchParams)(e, u);
        let d = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, n), d), o.headers), {
          url: (0, t.toPathString)(e),
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
      resetLocal: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("resetLocal", "resetLocalRequest", i);
        const a = "/authentication/local/reset", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      resetLocalWithToken: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("resetLocalWithToken", "authenticationResetTokenRequest", i);
        const a = "/authentication/local", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "PUT" }, n), e), d = {}, p = {};
        d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
       * @summary Get a JWT token for the given POS
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      authenticatePointOfSale(o, i) {
        return h(this, void 0, void 0, function* () {
          var e, a, s;
          const n = yield c.authenticatePointOfSale(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["AuthenticateApi.authenticatePointOfSale"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary EAN login and hand out token
       * @param {AuthenticationEanRequest} authenticationEanRequest The EAN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      eanAuthentication(o, i) {
        return h(this, void 0, void 0, function* () {
          var e, a, s;
          const n = yield c.eanAuthentication(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["AuthenticateApi.eanAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Get the GEWISWeb public token used by SudoSOS
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getGEWISWebPublic(o) {
        return h(this, void 0, void 0, function* () {
          var i, e, a;
          const s = yield c.getGEWISWebPublic(o), n = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (a = (e = A.operationServerMap["AuthenticateApi.getGEWISWebPublic"]) === null || e === void 0 ? void 0 : e[n]) === null || a === void 0 ? void 0 : a.url;
          return (d, p) => (0, t.createRequestFunction)(s, O.default, A.BASE_PATH, r)(d, u || p);
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
          var e, a, s;
          const n = yield c.gewisLDAPAuthentication(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["AuthenticateApi.gewisLDAPAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.gewisPinAuthentication(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["AuthenticateApi.gewisPinAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.gewisWebAuthentication(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["AuthenticateApi.gewisWebAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.keyAuthentication(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["AuthenticateApi.keyAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.ldapAuthentication(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["AuthenticateApi.ldapAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.localAuthentication(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["AuthenticateApi.localAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.mockAuthentication(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["AuthenticateApi.mockAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.nfcAuthentication(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["AuthenticateApi.nfcAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.pinAuthentication(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["AuthenticateApi.pinAuthentication"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var i, e, a;
          const s = yield c.refreshToken(o), n = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (a = (e = A.operationServerMap["AuthenticateApi.refreshToken"]) === null || e === void 0 ? void 0 : e[n]) === null || a === void 0 ? void 0 : a.url;
          return (d, p) => (0, t.createRequestFunction)(s, O.default, A.BASE_PATH, r)(d, u || p);
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
          var e, a, s;
          const n = yield c.resetLocal(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["AuthenticateApi.resetLocal"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.resetLocalWithToken(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["AuthenticateApi.resetLocalWithToken"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
       * @summary Get a JWT token for the given POS
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      authenticatePointOfSale(e, a) {
        return i.authenticatePointOfSale(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary EAN login and hand out token
       * @param {AuthenticationEanRequest} authenticationEanRequest The EAN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      eanAuthentication(e, a) {
        return i.eanAuthentication(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Get the GEWISWeb public token used by SudoSOS
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getGEWISWebPublic(e) {
        return i.getGEWISWebPublic(e).then((a) => a(o, c));
      },
      /**
       *
       * @summary LDAP login and hand out token    If user has never signed in before this also creates an GEWIS account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisLDAPAuthentication(e, a) {
        return i.gewisLDAPAuthentication(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary PIN login and hand out token.
       * @param {GEWISAuthenticationPinRequest} gEWISAuthenticationPinRequest The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisPinAuthentication(e, a) {
        return i.gewisPinAuthentication(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary GEWIS login verification based on gewisweb JWT tokens. This method verifies the validity of the gewisweb JWT token, and returns a SudoSOS token if the GEWIS token is valid.
       * @param {GewiswebAuthenticationRequest} gewiswebAuthenticationRequest The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      gewisWebAuthentication(e, a) {
        return i.gewisWebAuthentication(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Key login and hand out token.
       * @param {AuthenticationKeyRequest} authenticationKeyRequest The key login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      keyAuthentication(e, a) {
        return i.keyAuthentication(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary LDAP login and hand out token If user has never signed in before this also creates an account.
       * @param {AuthenticationLDAPRequest} authenticationLDAPRequest The LDAP login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ldapAuthentication(e, a) {
        return i.ldapAuthentication(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Local login and hand out token
       * @param {AuthenticationLocalRequest} authenticationLocalRequest The local login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      localAuthentication(e, a) {
        return i.localAuthentication(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Mock login and hand out token.
       * @param {AuthenticationMockRequest} authenticationMockRequest The mock login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      mockAuthentication(e, a) {
        return i.mockAuthentication(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary NFC login and hand out token
       * @param {AuthenticationNfcRequest} authenticationNfcRequest The NFC login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      nfcAuthentication(e, a) {
        return i.nfcAuthentication(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary PIN login and hand out token
       * @param {AuthenticationPinRequest} authenticationPinRequest The PIN login.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      pinAuthentication(e, a) {
        return i.pinAuthentication(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Get a new JWT token, lesser if the existing token is also lesser
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      refreshToken(e) {
        return i.refreshToken(e).then((a) => a(o, c));
      },
      /**
       *
       * @summary Creates a reset token for the local authentication
       * @param {ResetLocalRequest} resetLocalRequest The reset info.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocal(e, a) {
        return i.resetLocal(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Reset local authentication using the provided token
       * @param {AuthenticationResetTokenRequest} authenticationResetTokenRequest The reset token.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      resetLocalWithToken(e, a) {
        return i.resetLocalWithToken(e, a).then((s) => s(o, c));
      }
    };
  };
  l.AuthenticateApiFactory = j;
  class y extends A.BaseAPI {
    /**
     *
     * @summary Get a JWT token for the given POS
     * @param {number} id The id of the user
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    authenticatePointOfSale(c, o) {
      return (0, l.AuthenticateApiFp)(this.configuration).authenticatePointOfSale(c, o).then((i) => i(this.axios, this.basePath));
    }
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
     * @summary Get the GEWISWeb public token used by SudoSOS
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthenticateApi
     */
    getGEWISWebPublic(c) {
      return (0, l.AuthenticateApiFp)(this.configuration).getGEWISWebPublic(c).then((o) => o(this.axios, this.basePath));
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
  l.AuthenticateApi = y;
  const R = function(r) {
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
      getAllBalance: (c, o, i, e, a, s, n, u, d, p, v, P, ...b) => h(this, [c, o, i, e, a, s, n, u, d, p, v, P, ...b], void 0, function* (g, U, V, E, M, I, C, q, x, ee, k, z, de = {}) {
        const pe = "/balances/all", H = new URL(pe, t.DUMMY_BASE_URL);
        let le;
        r && (le = r.baseOptions);
        const rt = Object.assign(Object.assign({ method: "GET" }, le), de), nt = {}, ae = {};
        yield (0, t.setBearerAuthToObject)(nt, r), g !== void 0 && (ae.date = g), U !== void 0 && (ae.minBalance = U), V !== void 0 && (ae.maxBalance = V), E !== void 0 && (ae.hasFine = E), M !== void 0 && (ae.minFine = M), I !== void 0 && (ae.maxFine = I), C && (ae.userTypes = C), q !== void 0 && (ae.orderBy = q), x !== void 0 && (ae.orderDirection = x), ee !== void 0 && (ae.allowDeleted = ee), k !== void 0 && (ae.take = k), z !== void 0 && (ae.skip = z), (0, t.setSearchParams)(H, ae);
        let ca = le && le.headers ? le.headers : {};
        return rt.headers = Object.assign(Object.assign(Object.assign({}, nt), ca), de.headers), {
          url: (0, t.toPathString)(H),
          options: rt
        };
      }),
      /**
       *
       * @summary Retrieves the requested balance
       * @param {number} id The id of the user for which the saldo is requested
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalanceId: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("getBalanceId", "id", i);
        const a = "/balances/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
        const i = "/balances", e = new URL(i, t.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const s = Object.assign(Object.assign({ method: "GET" }, a), o), n = {}, u = {};
        yield (0, t.setBearerAuthToObject)(n, r), (0, t.setSearchParams)(e, u);
        let d = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, n), d), o.headers), {
          url: (0, t.toPathString)(e),
          options: s
        };
      })
    };
  };
  l.BalanceApiAxiosParamCreator = R;
  const _ = function(r) {
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
      getAllBalance(o, i, e, a, s, n, u, d, p, v, P, b, g) {
        return h(this, void 0, void 0, function* () {
          var U, V, E;
          const M = yield c.getAllBalance(o, i, e, a, s, n, u, d, p, v, P, b, g), I = (U = r == null ? void 0 : r.serverIndex) !== null && U !== void 0 ? U : 0, C = (E = (V = A.operationServerMap["BalanceApi.getAllBalance"]) === null || V === void 0 ? void 0 : V[I]) === null || E === void 0 ? void 0 : E.url;
          return (q, x) => (0, t.createRequestFunction)(M, O.default, A.BASE_PATH, r)(q, C || x);
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
          var e, a, s;
          const n = yield c.getBalanceId(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["BalanceApi.getBalanceId"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var i, e, a;
          const s = yield c.getBalances(o), n = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (a = (e = A.operationServerMap["BalanceApi.getBalances"]) === null || e === void 0 ? void 0 : e[n]) === null || a === void 0 ? void 0 : a.url;
          return (d, p) => (0, t.createRequestFunction)(s, O.default, A.BASE_PATH, r)(d, u || p);
        });
      }
    };
  };
  l.BalanceApiFp = _;
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
      getAllBalance(e, a, s, n, u, d, p, v, P, b, g, U, V) {
        return i.getAllBalance(e, a, s, n, u, d, p, v, P, b, g, U, V).then((E) => E(o, c));
      },
      /**
       *
       * @summary Retrieves the requested balance
       * @param {number} id The id of the user for which the saldo is requested
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalanceId(e, a) {
        return i.getBalanceId(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Get balance of the current user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBalances(e) {
        return i.getBalances(e).then((a) => a(o, c));
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
    getAllBalance(c, o, i, e, a, s, n, u, d, p, v, P, b) {
      return (0, l.BalanceApiFp)(this.configuration).getAllBalance(c, o, i, e, a, s, n, u, d, p, v, P, b).then((g) => g(this.axios, this.basePath));
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
  const G = function(r) {
    return {
      /**
       *
       * @summary Deletes the requested banner
       * @param {number} id The id of the banner which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      _delete: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("_delete", "id", i);
        const a = "/banners/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      create: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("create", "bannerRequest", i);
        const a = "/banners", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      getActive: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        const n = "/banners/active", u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), e !== void 0 && (P.take = e), a !== void 0 && (P.skip = a), (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, t.toPathString)(u),
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
      getAllBanners: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        const n = "/banners", u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), e !== void 0 && (P.take = e), a !== void 0 && (P.skip = a), (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, t.toPathString)(u),
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
      getAllOpenBanners: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        const n = "/open/banners", u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        e !== void 0 && (P.take = e), a !== void 0 && (P.skip = a), (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, t.toPathString)(u),
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
      getBanner: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("getBanner", "id", i);
        const a = "/banners/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      update: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        (0, t.assertParamExists)("update", "id", e), (0, t.assertParamExists)("update", "bannerRequest", a);
        const n = "/banners/{id}".replace("{id}", encodeURIComponent(String(e))), u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, t.serializeDataIfNeeded)(a, p, r), {
          url: (0, t.toPathString)(u),
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
      updateImage: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        (0, t.assertParamExists)("updateImage", "id", e);
        const n = "/banners/{id}/image".replace("{id}", encodeURIComponent(String(e))), u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "POST" }, d), s), v = {}, P = {}, b = new (r && r.formDataCtor || FormData)();
        yield (0, t.setBearerAuthToObject)(v, r), a !== void 0 && b.append("file", a), v["Content-Type"] = "multipart/form-data", (0, t.setSearchParams)(u, P);
        let g = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), g), s.headers), p.data = b, {
          url: (0, t.toPathString)(u),
          options: p
        };
      })
    };
  };
  l.BannersApiAxiosParamCreator = G;
  const F = function(r) {
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
          var e, a, s;
          const n = yield c._delete(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["BannersApi._delete"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.create(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["BannersApi.create"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      getActive(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getActive(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["BannersApi.getActive"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
      getAllBanners(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllBanners(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["BannersApi.getAllBanners"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
      getAllOpenBanners(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllOpenBanners(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["BannersApi.getAllOpenBanners"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
          var e, a, s;
          const n = yield c.getBanner(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["BannersApi.getBanner"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      update(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.update(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["BannersApi.update"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
      updateImage(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateImage(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["BannersApi.updateImage"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      }
    };
  };
  l.BannersApiFp = F;
  const L = function(r, c, o) {
    const i = (0, l.BannersApiFp)(r);
    return {
      /**
       *
       * @summary Deletes the requested banner
       * @param {number} id The id of the banner which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      _delete(e, a) {
        return i._delete(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Saves a banner to the database
       * @param {BannerRequest} bannerRequest The banner which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      create(e, a) {
        return i.create(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Returns all active banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getActive(e, a, s) {
        return i.getActive(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllBanners(e, a, s) {
        return i.getAllBanners(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Returns all existing banners
       * @param {number} [take] How many banners the endpoint should return
       * @param {number} [skip] How many banners should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllOpenBanners(e, a, s) {
        return i.getAllOpenBanners(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Returns the requested banner
       * @param {number} id The id of the banner which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getBanner(e, a) {
        return i.getBanner(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Updates the requested banner
       * @param {number} id The id of the banner which should be updated
       * @param {BannerRequest} bannerRequest The updated banner
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      update(e, a, s) {
        return i.update(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Uploads a banner image to the given banner
       * @param {number} id The id of the banner
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateImage(e, a, s) {
        return i.updateImage(e, a, s).then((n) => n(o, c));
      }
    };
  };
  l.BannersApiFactory = L;
  class B extends A.BaseAPI {
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
      return (0, l.BannersApiFp)(this.configuration).getActive(c, o, i).then((e) => e(this.axios, this.basePath));
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
      return (0, l.BannersApiFp)(this.configuration).getAllBanners(c, o, i).then((e) => e(this.axios, this.basePath));
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
      return (0, l.BannersApiFp)(this.configuration).getAllOpenBanners(c, o, i).then((e) => e(this.axios, this.basePath));
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
      return (0, l.BannersApiFp)(this.configuration).update(c, o, i).then((e) => e(this.axios, this.basePath));
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
      return (0, l.BannersApiFp)(this.configuration).updateImage(c, o, i).then((e) => e(this.axios, this.basePath));
    }
  }
  l.BannersApi = B;
  const X = function(r) {
    return {
      /**
       *
       * @summary Create a new container.
       * @param {CreateContainerRequest} createContainerRequest    The container which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createContainer: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("createContainer", "createContainerRequest", i);
        const a = "/containers", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      deleteContainer: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("deleteContainer", "id", i);
        const a = "/containers/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      getAllContainers: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        const n = "/containers", u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), e !== void 0 && (P.take = e), a !== void 0 && (P.skip = a), (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, t.toPathString)(u),
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
      getProductsContainer: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("getProductsContainer", "id", i);
        const a = "/containers/{id}/products".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      getPublicContainers: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        const n = "/containers/public", u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), e !== void 0 && (P.take = e), a !== void 0 && (P.skip = a), (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, t.toPathString)(u),
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
      getSingleContainer: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("getSingleContainer", "id", i);
        const a = "/containers/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      updateContainer: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        (0, t.assertParamExists)("updateContainer", "id", e), (0, t.assertParamExists)("updateContainer", "updateContainerRequest", a);
        const n = "/containers/{id}".replace("{id}", encodeURIComponent(String(e))), u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, t.serializeDataIfNeeded)(a, p, r), {
          url: (0, t.toPathString)(u),
          options: p
        };
      })
    };
  };
  l.ContainersApiAxiosParamCreator = X;
  const Z = function(r) {
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
          var e, a, s;
          const n = yield c.createContainer(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["ContainersApi.createContainer"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.deleteContainer(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["ContainersApi.deleteContainer"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      getAllContainers(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllContainers(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["ContainersApi.getAllContainers"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
          var e, a, s;
          const n = yield c.getProductsContainer(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["ContainersApi.getProductsContainer"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      getPublicContainers(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getPublicContainers(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["ContainersApi.getPublicContainers"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
          var e, a, s;
          const n = yield c.getSingleContainer(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["ContainersApi.getSingleContainer"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      updateContainer(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateContainer(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["ContainersApi.updateContainer"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      }
    };
  };
  l.ContainersApiFp = Z;
  const D = function(r, c, o) {
    const i = (0, l.ContainersApiFp)(r);
    return {
      /**
       *
       * @summary Create a new container.
       * @param {CreateContainerRequest} createContainerRequest    The container which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createContainer(e, a) {
        return i.createContainer(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary (Soft) delete the given container. Cannot be undone.
       * @param {number} id The id of the container which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteContainer(e, a) {
        return i.deleteContainer(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Returns all existing containers
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllContainers(e, a, s) {
        return i.getAllContainers(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Returns all the products in the container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getProductsContainer(e, a) {
        return i.getProductsContainer(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Returns all public container
       * @param {number} [take] How many containers the endpoint should return
       * @param {number} [skip] How many containers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getPublicContainers(e, a, s) {
        return i.getPublicContainers(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Returns the requested container
       * @param {number} id The id of the container which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleContainer(e, a) {
        return i.getSingleContainer(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Update an existing container.
       * @param {number} id The id of the container which should be updated
       * @param {UpdateContainerRequest} updateContainerRequest    The container which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateContainer(e, a, s) {
        return i.updateContainer(e, a, s).then((n) => n(o, c));
      }
    };
  };
  l.ContainersApiFactory = D;
  class J extends A.BaseAPI {
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
      return (0, l.ContainersApiFp)(this.configuration).getAllContainers(c, o, i).then((e) => e(this.axios, this.basePath));
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
      return (0, l.ContainersApiFp)(this.configuration).getPublicContainers(c, o, i).then((e) => e(this.axios, this.basePath));
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
      return (0, l.ContainersApiFp)(this.configuration).updateContainer(c, o, i).then((e) => e(this.axios, this.basePath));
    }
  }
  l.ContainersApi = J;
  const ie = function(r) {
    return {
      /**
       *
       * @summary Return all users that had at most -5 euros balance both now and on the reference date.    For all these users, also return their fine based on the reference date.
       * @param {Array<string>} referenceDates Dates to base the fines on. Every returned user has at    least five euros debt on every reference date. The height of the fine is based on the first date in the array.
       * @param {Array<number>} [userTypes] List of all user types fines should be calculated for 1 (MEMBER), 2 (ORGAN), 3 (VOUCHER), 4 (LOCAL_USER), 5 (LOCAL_ADMIN), 6 (INVOICE), 7 (AUTOMATIC_INVOICE).
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      calculateFines: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        (0, t.assertParamExists)("calculateFines", "referenceDates", e);
        const n = "/fines/eligible", u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), a && (P.userTypes = a), e && (P.referenceDates = e), (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, t.toPathString)(u),
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
      deleteFine: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("deleteFine", "id", i);
        const a = "/fines/single/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      getFineReport: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        const n = "/fines/report", u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), e !== void 0 && (P.fromDate = e), a !== void 0 && (P.toDate = a), (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, t.toPathString)(u),
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
      getFineReportPdf: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        const n = "/fines/report/pdf", u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), e !== void 0 && (P.fromDate = e), a !== void 0 && (P.toDate = a), (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, t.toPathString)(u),
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
      handoutFines: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("handoutFines", "handoutFinesRequest", i);
        const a = "/fines/handout", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      notifyAboutFutureFines: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("notifyAboutFutureFines", "handoutFinesRequest", i);
        const a = "/fines/notify", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      returnAllFineHandoutEvents: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        const n = "/fines", u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), e !== void 0 && (P.take = e), a !== void 0 && (P.skip = a), (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, t.toPathString)(u),
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
      returnSingleFineHandoutEvent: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("returnSingleFineHandoutEvent", "id", i);
        const a = "/fines/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
          options: u
        };
      })
    };
  };
  l.DebtorsApiAxiosParamCreator = ie;
  const Se = function(r) {
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
      calculateFines(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.calculateFines(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["DebtorsApi.calculateFines"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
          var e, a, s;
          const n = yield c.deleteFine(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["DebtorsApi.deleteFine"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      getFineReport(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getFineReport(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["DebtorsApi.getFineReport"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
      getFineReportPdf(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getFineReportPdf(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["DebtorsApi.getFineReportPdf"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
          var e, a, s;
          const n = yield c.handoutFines(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["DebtorsApi.handoutFines"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.notifyAboutFutureFines(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["DebtorsApi.notifyAboutFutureFines"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      returnAllFineHandoutEvents(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.returnAllFineHandoutEvents(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["DebtorsApi.returnAllFineHandoutEvents"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
          var e, a, s;
          const n = yield c.returnSingleFineHandoutEvent(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["DebtorsApi.returnSingleFineHandoutEvent"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      }
    };
  };
  l.DebtorsApiFp = Se;
  const te = function(r, c, o) {
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
      calculateFines(e, a, s) {
        return i.calculateFines(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Delete a fine
       * @param {number} id The id of the fine which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFine(e, a) {
        return i.deleteFine(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Get a report of all fines
       * @param {string} [fromDate] The start date of the report, inclusive
       * @param {string} [toDate] The end date of the report, exclusive
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFineReport(e, a, s) {
        return i.getFineReport(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Get a report of all fines in pdf format
       * @param {string} [fromDate] The start date of the report, inclusive
       * @param {string} [toDate] The end date of the report, exclusive
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFineReportPdf(e, a, s) {
        return i.getFineReportPdf(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Handout fines to all given users. Fines will be handed out \"now\" to prevent rewriting history.
       * @param {HandoutFinesRequest} handoutFinesRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      handoutFines(e, a) {
        return i.handoutFines(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Send an email to all given users about their possible future fine.
       * @param {HandoutFinesRequest} handoutFinesRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      notifyAboutFutureFines(e, a) {
        return i.notifyAboutFutureFines(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Get all fine handout events
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      returnAllFineHandoutEvents(e, a, s) {
        return i.returnAllFineHandoutEvents(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Get all fine handout events
       * @param {number} id The id of the fine handout event which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      returnSingleFineHandoutEvent(e, a) {
        return i.returnSingleFineHandoutEvent(e, a).then((s) => s(o, c));
      }
    };
  };
  l.DebtorsApiFactory = te;
  class ce extends A.BaseAPI {
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
      return (0, l.DebtorsApiFp)(this.configuration).calculateFines(c, o, i).then((e) => e(this.axios, this.basePath));
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
      return (0, l.DebtorsApiFp)(this.configuration).getFineReport(c, o, i).then((e) => e(this.axios, this.basePath));
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
      return (0, l.DebtorsApiFp)(this.configuration).getFineReportPdf(c, o, i).then((e) => e(this.axios, this.basePath));
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
      return (0, l.DebtorsApiFp)(this.configuration).returnAllFineHandoutEvents(c, o, i).then((e) => e(this.axios, this.basePath));
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
  l.DebtorsApi = ce;
  const fe = function(r) {
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
      assignEventShift: (c, o, i, e, ...a) => h(this, [c, o, i, e, ...a], void 0, function* (s, n, u, d, p = {}) {
        (0, t.assertParamExists)("assignEventShift", "eventId", s), (0, t.assertParamExists)("assignEventShift", "shiftId", n), (0, t.assertParamExists)("assignEventShift", "userId", u), (0, t.assertParamExists)("assignEventShift", "eventAnswerAssignmentRequest", d);
        const v = "/events/{eventId}/shift/{shiftId}/user/{userId}/assign".replace("{eventId}", encodeURIComponent(String(s))).replace("{shiftId}", encodeURIComponent(String(n))).replace("{userId}", encodeURIComponent(String(u))), P = new URL(v, t.DUMMY_BASE_URL);
        let b;
        r && (b = r.baseOptions);
        const g = Object.assign(Object.assign({ method: "PUT" }, b), p), U = {}, V = {};
        yield (0, t.setBearerAuthToObject)(U, r), U["Content-Type"] = "application/json", (0, t.setSearchParams)(P, V);
        let E = b && b.headers ? b.headers : {};
        return g.headers = Object.assign(Object.assign(Object.assign({}, U), E), p.headers), g.data = (0, t.serializeDataIfNeeded)(d, g, r), {
          url: (0, t.toPathString)(P),
          options: g
        };
      }),
      /**
       *
       * @summary Create an event with its corresponding answers objects
       * @param {CreateEventRequest} createEventRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEvent: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("createEvent", "createEventRequest", i);
        const a = "/events", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      createEventShift: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("createEventShift", "createShiftRequest", i);
        const a = "/eventshifts", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      deleteEvent: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("deleteEvent", "id", i);
        const a = "/events/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      deleteEventShift: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("deleteEventShift", "id", i);
        const a = "/eventshifts/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      getAllEventShifts: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        const n = "/eventshifts", u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), e !== void 0 && (P.take = e), a !== void 0 && (P.skip = a), (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, t.toPathString)(u),
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
      getAllEvents: (c, o, i, e, a, s, n, ...u) => h(this, [c, o, i, e, a, s, n, ...u], void 0, function* (d, p, v, P, b, g, U, V = {}) {
        const E = "/events", M = new URL(E, t.DUMMY_BASE_URL);
        let I;
        r && (I = r.baseOptions);
        const C = Object.assign(Object.assign({ method: "GET" }, I), V), q = {}, x = {};
        yield (0, t.setBearerAuthToObject)(q, r), d !== void 0 && (x.name = d), p !== void 0 && (x.createdById = p), v !== void 0 && (x.beforeDate = v), P !== void 0 && (x.afterDate = P), b !== void 0 && (x.type = b), g !== void 0 && (x.take = g), U !== void 0 && (x.skip = U), (0, t.setSearchParams)(M, x);
        let ee = I && I.headers ? I.headers : {};
        return C.headers = Object.assign(Object.assign(Object.assign({}, q), ee), V.headers), {
          url: (0, t.toPathString)(M),
          options: C
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
      getEventShiftCount: (c, o, i, e, ...a) => h(this, [c, o, i, e, ...a], void 0, function* (s, n, u, d, p = {}) {
        (0, t.assertParamExists)("getEventShiftCount", "id", s);
        const v = "/eventshifts/{id}/counts".replace("{id}", encodeURIComponent(String(s))), P = new URL(v, t.DUMMY_BASE_URL);
        let b;
        r && (b = r.baseOptions);
        const g = Object.assign(Object.assign({ method: "GET" }, b), p), U = {}, V = {};
        yield (0, t.setBearerAuthToObject)(U, r), n !== void 0 && (V.eventType = n), u !== void 0 && (V.afterDate = u), d !== void 0 && (V.beforeDate = d), (0, t.setSearchParams)(P, V);
        let E = b && b.headers ? b.headers : {};
        return g.headers = Object.assign(Object.assign(Object.assign({}, U), E), p.headers), {
          url: (0, t.toPathString)(P),
          options: g
        };
      }),
      /**
       *
       * @summary Get a single event with its answers and shifts
       * @param {number} id The id of the event which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleEvent: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("getSingleEvent", "id", i);
        const a = "/events/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      updateEvent: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        (0, t.assertParamExists)("updateEvent", "id", e), (0, t.assertParamExists)("updateEvent", "updateEventRequest", a);
        const n = "/events/{id}".replace("{id}", encodeURIComponent(String(e))), u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, t.serializeDataIfNeeded)(a, p, r), {
          url: (0, t.toPathString)(u),
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
      updateEventShift: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        (0, t.assertParamExists)("updateEventShift", "id", e), (0, t.assertParamExists)("updateEventShift", "updateShiftRequest", a);
        const n = "/eventshifts/{id}".replace("{id}", encodeURIComponent(String(e))), u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, t.serializeDataIfNeeded)(a, p, r), {
          url: (0, t.toPathString)(u),
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
      updateEventShiftAvailability: (c, o, i, e, ...a) => h(this, [c, o, i, e, ...a], void 0, function* (s, n, u, d, p = {}) {
        (0, t.assertParamExists)("updateEventShiftAvailability", "eventId", s), (0, t.assertParamExists)("updateEventShiftAvailability", "shiftId", n), (0, t.assertParamExists)("updateEventShiftAvailability", "userId", u), (0, t.assertParamExists)("updateEventShiftAvailability", "eventAnswerAvailabilityRequest", d);
        const v = "/events/{eventId}/shift/{shiftId}/user/{userId}/availability".replace("{eventId}", encodeURIComponent(String(s))).replace("{shiftId}", encodeURIComponent(String(n))).replace("{userId}", encodeURIComponent(String(u))), P = new URL(v, t.DUMMY_BASE_URL);
        let b;
        r && (b = r.baseOptions);
        const g = Object.assign(Object.assign({ method: "POST" }, b), p), U = {}, V = {};
        yield (0, t.setBearerAuthToObject)(U, r), U["Content-Type"] = "application/json", (0, t.setSearchParams)(P, V);
        let E = b && b.headers ? b.headers : {};
        return g.headers = Object.assign(Object.assign(Object.assign({}, U), E), p.headers), g.data = (0, t.serializeDataIfNeeded)(d, g, r), {
          url: (0, t.toPathString)(P),
          options: g
        };
      })
    };
  };
  l.EventsApiAxiosParamCreator = fe;
  const Pe = function(r) {
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
      assignEventShift(o, i, e, a, s) {
        return h(this, void 0, void 0, function* () {
          var n, u, d;
          const p = yield c.assignEventShift(o, i, e, a, s), v = (n = r == null ? void 0 : r.serverIndex) !== null && n !== void 0 ? n : 0, P = (d = (u = A.operationServerMap["EventsApi.assignEventShift"]) === null || u === void 0 ? void 0 : u[v]) === null || d === void 0 ? void 0 : d.url;
          return (b, g) => (0, t.createRequestFunction)(p, O.default, A.BASE_PATH, r)(b, P || g);
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
          var e, a, s;
          const n = yield c.createEvent(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["EventsApi.createEvent"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.createEventShift(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["EventsApi.createEventShift"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.deleteEvent(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["EventsApi.deleteEvent"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.deleteEventShift(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["EventsApi.deleteEventShift"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      getAllEventShifts(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllEventShifts(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["EventsApi.getAllEventShifts"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
      getAllEvents(o, i, e, a, s, n, u, d) {
        return h(this, void 0, void 0, function* () {
          var p, v, P;
          const b = yield c.getAllEvents(o, i, e, a, s, n, u, d), g = (p = r == null ? void 0 : r.serverIndex) !== null && p !== void 0 ? p : 0, U = (P = (v = A.operationServerMap["EventsApi.getAllEvents"]) === null || v === void 0 ? void 0 : v[g]) === null || P === void 0 ? void 0 : P.url;
          return (V, E) => (0, t.createRequestFunction)(b, O.default, A.BASE_PATH, r)(V, U || E);
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
      getEventShiftCount(o, i, e, a, s) {
        return h(this, void 0, void 0, function* () {
          var n, u, d;
          const p = yield c.getEventShiftCount(o, i, e, a, s), v = (n = r == null ? void 0 : r.serverIndex) !== null && n !== void 0 ? n : 0, P = (d = (u = A.operationServerMap["EventsApi.getEventShiftCount"]) === null || u === void 0 ? void 0 : u[v]) === null || d === void 0 ? void 0 : d.url;
          return (b, g) => (0, t.createRequestFunction)(p, O.default, A.BASE_PATH, r)(b, P || g);
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
          var e, a, s;
          const n = yield c.getSingleEvent(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["EventsApi.getSingleEvent"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      updateEvent(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateEvent(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["EventsApi.updateEvent"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
      updateEventShift(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateEventShift(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["EventsApi.updateEventShift"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
      updateEventShiftAvailability(o, i, e, a, s) {
        return h(this, void 0, void 0, function* () {
          var n, u, d;
          const p = yield c.updateEventShiftAvailability(o, i, e, a, s), v = (n = r == null ? void 0 : r.serverIndex) !== null && n !== void 0 ? n : 0, P = (d = (u = A.operationServerMap["EventsApi.updateEventShiftAvailability"]) === null || u === void 0 ? void 0 : u[v]) === null || d === void 0 ? void 0 : d.url;
          return (b, g) => (0, t.createRequestFunction)(p, O.default, A.BASE_PATH, r)(b, P || g);
        });
      }
    };
  };
  l.EventsApiFp = Pe;
  const Ve = function(r, c, o) {
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
      assignEventShift(e, a, s, n, u) {
        return i.assignEventShift(e, a, s, n, u).then((d) => d(o, c));
      },
      /**
       *
       * @summary Create an event with its corresponding answers objects
       * @param {CreateEventRequest} createEventRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEvent(e, a) {
        return i.createEvent(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Create an event shift
       * @param {CreateShiftRequest} createShiftRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createEventShift(e, a) {
        return i.createEventShift(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Delete an event with its answers
       * @param {number} id The id of the event which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteEvent(e, a) {
        return i.deleteEvent(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Delete an event shift with its answers
       * @param {number} id The id of the event which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteEventShift(e, a) {
        return i.deleteEventShift(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Get all event shifts
       * @param {number} [take] How many entries the endpoint should return
       * @param {number} [skip] How many entries should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllEventShifts(e, a, s) {
        return i.getAllEventShifts(e, a, s).then((n) => n(o, c));
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
      getAllEvents(e, a, s, n, u, d, p, v) {
        return i.getAllEvents(e, a, s, n, u, d, p, v).then((P) => P(o, c));
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
      getEventShiftCount(e, a, s, n, u) {
        return i.getEventShiftCount(e, a, s, n, u).then((d) => d(o, c));
      },
      /**
       *
       * @summary Get a single event with its answers and shifts
       * @param {number} id The id of the event which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleEvent(e, a) {
        return i.getSingleEvent(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Update an event with its corresponding answers objects
       * @param {number} id The id of the event which should be returned
       * @param {UpdateEventRequest} updateEventRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateEvent(e, a, s) {
        return i.updateEvent(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Update an event shift
       * @param {number} id The id of the event which should be returned
       * @param {UpdateShiftRequest} updateShiftRequest
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateEventShift(e, a, s) {
        return i.updateEventShift(e, a, s).then((n) => n(o, c));
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
      updateEventShiftAvailability(e, a, s, n, u) {
        return i.updateEventShiftAvailability(e, a, s, n, u).then((d) => d(o, c));
      }
    };
  };
  l.EventsApiFactory = Ve;
  class Xt extends A.BaseAPI {
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
    assignEventShift(c, o, i, e, a) {
      return (0, l.EventsApiFp)(this.configuration).assignEventShift(c, o, i, e, a).then((s) => s(this.axios, this.basePath));
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
      return (0, l.EventsApiFp)(this.configuration).getAllEventShifts(c, o, i).then((e) => e(this.axios, this.basePath));
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
    getAllEvents(c, o, i, e, a, s, n, u) {
      return (0, l.EventsApiFp)(this.configuration).getAllEvents(c, o, i, e, a, s, n, u).then((d) => d(this.axios, this.basePath));
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
    getEventShiftCount(c, o, i, e, a) {
      return (0, l.EventsApiFp)(this.configuration).getEventShiftCount(c, o, i, e, a).then((s) => s(this.axios, this.basePath));
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
      return (0, l.EventsApiFp)(this.configuration).updateEvent(c, o, i).then((e) => e(this.axios, this.basePath));
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
      return (0, l.EventsApiFp)(this.configuration).updateEventShift(c, o, i).then((e) => e(this.axios, this.basePath));
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
    updateEventShiftAvailability(c, o, i, e, a) {
      return (0, l.EventsApiFp)(this.configuration).updateEventShiftAvailability(c, o, i, e, a).then((s) => s(this.axios, this.basePath));
    }
  }
  l.EventsApi = Xt;
  const Zt = function(r) {
    return {
      /**
       *
       * @summary Upload a file with the given name.
       * @param {string} name The name of the file
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createFile: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        (0, t.assertParamExists)("createFile", "name", e);
        const n = "/files", u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "POST" }, d), s), v = {}, P = {}, b = new (r && r.formDataCtor || FormData)();
        yield (0, t.setBearerAuthToObject)(v, r), e !== void 0 && b.append("name", e), a !== void 0 && b.append("file", a), v["Content-Type"] = "multipart/form-data", (0, t.setSearchParams)(u, P);
        let g = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), g), s.headers), p.data = b, {
          url: (0, t.toPathString)(u),
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
      deleteFile: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("deleteFile", "id", i);
        const a = "/files/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      getFile: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("getFile", "id", i);
        const a = "/files/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
          options: u
        };
      })
    };
  };
  l.FilesApiAxiosParamCreator = Zt;
  const es = function(r) {
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
      createFile(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.createFile(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["FilesApi.createFile"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
          var e, a, s;
          const n = yield c.deleteFile(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["FilesApi.deleteFile"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.getFile(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["FilesApi.getFile"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      }
    };
  };
  l.FilesApiFp = es;
  const ts = function(r, c, o) {
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
      createFile(e, a, s) {
        return i.createFile(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Delete the file with the given id.
       * @param {number} id The id of the file which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteFile(e, a) {
        return i.deleteFile(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Download a file with the given id.
       * @param {number} id The id of the file which should be downloaded
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getFile(e, a) {
        return i.getFile(e, a).then((s) => s(o, c));
      }
    };
  };
  l.FilesApiFactory = ts;
  class ss extends A.BaseAPI {
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
      return (0, l.FilesApiFp)(this.configuration).createFile(c, o, i).then((e) => e(this.axios, this.basePath));
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
  l.FilesApi = ss;
  const as = function(r) {
    return {
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {CreateInvoiceRequest} createInvoiceRequest The invoice which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createInvoice: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("createInvoice", "createInvoiceRequest", i);
        const a = "/invoices", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      deleteInvoice: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("deleteInvoice", "id", i);
        const a = "/invoices/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      deleteInvoiceUser: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("deleteInvoiceUser", "id", i);
        const a = "/invoices/users/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      getAllInvoices: (c, o, i, e, a, s, n, u, ...d) => h(this, [c, o, i, e, a, s, n, u, ...d], void 0, function* (p, v, P, b, g, U, V, E, M = {}) {
        const I = "/invoices", C = new URL(I, t.DUMMY_BASE_URL);
        let q;
        r && (q = r.baseOptions);
        const x = Object.assign(Object.assign({ method: "GET" }, q), M), ee = {}, k = {};
        yield (0, t.setBearerAuthToObject)(ee, r), p !== void 0 && (k.toId = p), v !== void 0 && (k.invoiceId = v), P && (k.currentState = P), b !== void 0 && (k.returnEntries = b), g !== void 0 && (k.fromDate = g), U !== void 0 && (k.tillDate = U), V !== void 0 && (k.take = V), E !== void 0 && (k.skip = E), (0, t.setSearchParams)(C, k);
        let z = q && q.headers ? q.headers : {};
        return x.headers = Object.assign(Object.assign(Object.assign({}, ee), z), M.headers), {
          url: (0, t.toPathString)(C),
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
      getInvoicePdf: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("getInvoicePdf", "id", i);
        const a = "/invoices/{id}/pdf".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      getSingleInvoice: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        (0, t.assertParamExists)("getSingleInvoice", "id", e);
        const n = "/invoices/{id}".replace("{id}", encodeURIComponent(String(e))), u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), a !== void 0 && (P.returnEntries = a), (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, t.toPathString)(u),
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
      getSingleInvoiceUser: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("getSingleInvoiceUser", "id", i);
        const a = "/invoices/users/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      putInvoiceUser: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        (0, t.assertParamExists)("putInvoiceUser", "id", e), (0, t.assertParamExists)("putInvoiceUser", "updateInvoiceUserRequest", a);
        const n = "/invoices/users/{id}".replace("{id}", encodeURIComponent(String(e))), u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PUT" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, t.serializeDataIfNeeded)(a, p, r), {
          url: (0, t.toPathString)(u),
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
      updateInvoice: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        (0, t.assertParamExists)("updateInvoice", "id", e), (0, t.assertParamExists)("updateInvoice", "updateInvoiceRequest", a);
        const n = "/invoices/{id}".replace("{id}", encodeURIComponent(String(e))), u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, t.serializeDataIfNeeded)(a, p, r), {
          url: (0, t.toPathString)(u),
          options: p
        };
      })
    };
  };
  l.InvoicesApiAxiosParamCreator = as;
  const rs = function(r) {
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
          var e, a, s;
          const n = yield c.createInvoice(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["InvoicesApi.createInvoice"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.deleteInvoice(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["InvoicesApi.deleteInvoice"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.deleteInvoiceUser(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["InvoicesApi.deleteInvoiceUser"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      getAllInvoices(o, i, e, a, s, n, u, d, p) {
        return h(this, void 0, void 0, function* () {
          var v, P, b;
          const g = yield c.getAllInvoices(o, i, e, a, s, n, u, d, p), U = (v = r == null ? void 0 : r.serverIndex) !== null && v !== void 0 ? v : 0, V = (b = (P = A.operationServerMap["InvoicesApi.getAllInvoices"]) === null || P === void 0 ? void 0 : P[U]) === null || b === void 0 ? void 0 : b.url;
          return (E, M) => (0, t.createRequestFunction)(g, O.default, A.BASE_PATH, r)(E, V || M);
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
          var e, a, s;
          const n = yield c.getInvoicePdf(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["InvoicesApi.getInvoicePdf"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      getSingleInvoice(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getSingleInvoice(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["InvoicesApi.getSingleInvoice"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
          var e, a, s;
          const n = yield c.getSingleInvoiceUser(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["InvoicesApi.getSingleInvoiceUser"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      putInvoiceUser(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.putInvoiceUser(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["InvoicesApi.putInvoiceUser"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
      updateInvoice(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateInvoice(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["InvoicesApi.updateInvoice"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      }
    };
  };
  l.InvoicesApiFp = rs;
  const ns = function(r, c, o) {
    const i = (0, l.InvoicesApiFp)(r);
    return {
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {CreateInvoiceRequest} createInvoiceRequest The invoice which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createInvoice(e, a) {
        return i.createInvoice(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Deletes an invoice.
       * @param {number} id The id of the invoice which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteInvoice(e, a) {
        return i.deleteInvoice(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Delete invoice user defaults.
       * @param {number} id The id of the invoice user to delete.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteInvoiceUser(e, a) {
        return i.deleteInvoiceUser(e, a).then((s) => s(o, c));
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
      getAllInvoices(e, a, s, n, u, d, p, v, P) {
        return i.getAllInvoices(e, a, s, n, u, d, p, v, P).then((b) => b(o, c));
      },
      /**
       *
       * @summary Get an invoice pdf.
       * @param {number} id The id of the invoice to return
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getInvoicePdf(e, a) {
        return i.getInvoicePdf(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Returns a single invoice in the system.
       * @param {number} id The id of the requested invoice
       * @param {boolean} [returnEntries] Boolean if invoice entries should be returned, defaults to true.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleInvoice(e, a, s) {
        return i.getSingleInvoice(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Get invoice user defaults.
       * @param {number} id The id of the invoice user to return.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleInvoiceUser(e, a) {
        return i.getSingleInvoiceUser(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Update or create invoice user defaults.
       * @param {number} id The id of the user to update
       * @param {UpdateInvoiceUserRequest} updateInvoiceUserRequest The invoice user which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      putInvoiceUser(e, a, s) {
        return i.putInvoiceUser(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Adds an invoice to the system.
       * @param {number} id The id of the invoice which should be updated
       * @param {UpdateInvoiceRequest} updateInvoiceRequest The invoice update to process
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateInvoice(e, a, s) {
        return i.updateInvoice(e, a, s).then((n) => n(o, c));
      }
    };
  };
  l.InvoicesApiFactory = ns;
  class is extends A.BaseAPI {
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
    getAllInvoices(c, o, i, e, a, s, n, u, d) {
      return (0, l.InvoicesApiFp)(this.configuration).getAllInvoices(c, o, i, e, a, s, n, u, d).then((p) => p(this.axios, this.basePath));
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
      return (0, l.InvoicesApiFp)(this.configuration).getSingleInvoice(c, o, i).then((e) => e(this.axios, this.basePath));
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
      return (0, l.InvoicesApiFp)(this.configuration).putInvoiceUser(c, o, i).then((e) => e(this.axios, this.basePath));
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
      return (0, l.InvoicesApiFp)(this.configuration).updateInvoice(c, o, i).then((e) => e(this.axios, this.basePath));
    }
  }
  l.InvoicesApi = is, l.GetAllInvoicesCurrentStateEnum = {};
  const os = function(r) {
    return {
      /**
       *
       * @summary Create a new payout request
       * @param {PayoutRequestRequest} payoutRequestRequest New payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPayoutRequest: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("createPayoutRequest", "payoutRequestRequest", i);
        const a = "/payoutrequests", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      getAllPayoutRequests: (c, o, i, e, a, s, n, ...u) => h(this, [c, o, i, e, a, s, n, ...u], void 0, function* (d, p, v, P, b, g, U, V = {}) {
        const E = "/payoutrequests", M = new URL(E, t.DUMMY_BASE_URL);
        let I;
        r && (I = r.baseOptions);
        const C = Object.assign(Object.assign({ method: "GET" }, I), V), q = {}, x = {};
        if (yield (0, t.setBearerAuthToObject)(q, r), d !== void 0)
          for (const [k, z] of Object.entries(d))
            x[k] = z;
        if (p !== void 0)
          for (const [k, z] of Object.entries(p))
            x[k] = z;
        v !== void 0 && (x.fromDate = v), P !== void 0 && (x.tillDate = P), b !== void 0 && (x.status = b), g !== void 0 && (x.take = g), U !== void 0 && (x.skip = U), (0, t.setSearchParams)(M, x);
        let ee = I && I.headers ? I.headers : {};
        return C.headers = Object.assign(Object.assign(Object.assign({}, q), ee), V.headers), {
          url: (0, t.toPathString)(M),
          options: C
        };
      }),
      /**
       *
       * @summary Get a payout request pdf
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getPayoutRequestPdf: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("getPayoutRequestPdf", "id", i);
        const a = "/payoutrequests/{id}/pdf".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      getSinglePayoutRequest: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("getSinglePayoutRequest", "id", i);
        const a = "/payoutrequests/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      setPayoutRequestStatus: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        (0, t.assertParamExists)("setPayoutRequestStatus", "id", e), (0, t.assertParamExists)("setPayoutRequestStatus", "payoutRequestStatusRequest", a);
        const n = "/payoutrequests/{id}/status".replace("{id}", encodeURIComponent(String(e))), u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "POST" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, t.serializeDataIfNeeded)(a, p, r), {
          url: (0, t.toPathString)(u),
          options: p
        };
      })
    };
  };
  l.PayoutRequestsApiAxiosParamCreator = os;
  const ls = function(r) {
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
          var e, a, s;
          const n = yield c.createPayoutRequest(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["PayoutRequestsApi.createPayoutRequest"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      getAllPayoutRequests(o, i, e, a, s, n, u, d) {
        return h(this, void 0, void 0, function* () {
          var p, v, P;
          const b = yield c.getAllPayoutRequests(o, i, e, a, s, n, u, d), g = (p = r == null ? void 0 : r.serverIndex) !== null && p !== void 0 ? p : 0, U = (P = (v = A.operationServerMap["PayoutRequestsApi.getAllPayoutRequests"]) === null || v === void 0 ? void 0 : v[g]) === null || P === void 0 ? void 0 : P.url;
          return (V, E) => (0, t.createRequestFunction)(b, O.default, A.BASE_PATH, r)(V, U || E);
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
          var e, a, s;
          const n = yield c.getPayoutRequestPdf(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["PayoutRequestsApi.getPayoutRequestPdf"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.getSinglePayoutRequest(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["PayoutRequestsApi.getSinglePayoutRequest"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      setPayoutRequestStatus(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.setPayoutRequestStatus(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["PayoutRequestsApi.setPayoutRequestStatus"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      }
    };
  };
  l.PayoutRequestsApiFp = ls;
  const cs = function(r, c, o) {
    const i = (0, l.PayoutRequestsApiFp)(r);
    return {
      /**
       *
       * @summary Create a new payout request
       * @param {PayoutRequestRequest} payoutRequestRequest New payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPayoutRequest(e, a) {
        return i.createPayoutRequest(e, a).then((s) => s(o, c));
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
      getAllPayoutRequests(e, a, s, n, u, d, p, v) {
        return i.getAllPayoutRequests(e, a, s, n, u, d, p, v).then((P) => P(o, c));
      },
      /**
       *
       * @summary Get a payout request pdf
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getPayoutRequestPdf(e, a) {
        return i.getPayoutRequestPdf(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Get a single payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePayoutRequest(e, a) {
        return i.getSinglePayoutRequest(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Create a new status for a payout request
       * @param {number} id The ID of the payout request object that should be returned
       * @param {PayoutRequestStatusRequest} payoutRequestStatusRequest New state of payout request
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      setPayoutRequestStatus(e, a, s) {
        return i.setPayoutRequestStatus(e, a, s).then((n) => n(o, c));
      }
    };
  };
  l.PayoutRequestsApiFactory = cs;
  class ds extends A.BaseAPI {
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
    getAllPayoutRequests(c, o, i, e, a, s, n, u) {
      return (0, l.PayoutRequestsApiFp)(this.configuration).getAllPayoutRequests(c, o, i, e, a, s, n, u).then((d) => d(this.axios, this.basePath));
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
      return (0, l.PayoutRequestsApiFp)(this.configuration).setPayoutRequestStatus(c, o, i).then((e) => e(this.axios, this.basePath));
    }
  }
  l.PayoutRequestsApi = ds;
  const us = function(r) {
    return {
      /**
       *
       * @summary Create a new Point of Sale.
       * @param {CreatePointOfSaleRequest} createPointOfSaleRequest The point of sale which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPointOfSale: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("createPointOfSale", "createPointOfSaleRequest", i);
        const a = "/pointsofsale", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      deletePointOfSale: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("deletePointOfSale", "id", i);
        const a = "/pointsofsale/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      getAllPointOfSaleContainers: (c, o, i, ...e) => h(this, [c, o, i, ...e], void 0, function* (a, s, n, u = {}) {
        (0, t.assertParamExists)("getAllPointOfSaleContainers", "id", a);
        const d = "/pointsofsale/{id}/containers".replace("{id}", encodeURIComponent(String(a))), p = new URL(d, t.DUMMY_BASE_URL);
        let v;
        r && (v = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, v), u), b = {}, g = {};
        yield (0, t.setBearerAuthToObject)(b, r), s !== void 0 && (g.take = s), n !== void 0 && (g.skip = n), (0, t.setSearchParams)(p, g);
        let U = v && v.headers ? v.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), U), u.headers), {
          url: (0, t.toPathString)(p),
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
      getAllPointOfSaleProducts: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("getAllPointOfSaleProducts", "id", i);
        const a = "/pointsofsale/{id}/products".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      getAllPointsOfSale: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        const n = "/pointsofsale", u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), e !== void 0 && (P.take = e), a !== void 0 && (P.skip = a), (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, t.toPathString)(u),
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
      getPointOfSaleAssociates: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("getPointOfSaleAssociates", "id", i);
        const a = "/pointsofsale/{id}/associates".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      getSinglePointOfSale: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("getSinglePointOfSale", "id", i);
        const a = "/pointsofsale/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      getTransactions: (c, o, i, ...e) => h(this, [c, o, i, ...e], void 0, function* (a, s, n, u = {}) {
        (0, t.assertParamExists)("getTransactions", "id", a);
        const d = "/pointsofsale/{id}/transactions".replace("{id}", encodeURIComponent(String(a))), p = new URL(d, t.DUMMY_BASE_URL);
        let v;
        r && (v = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, v), u), b = {}, g = {};
        yield (0, t.setBearerAuthToObject)(b, r), s !== void 0 && (g.take = s), n !== void 0 && (g.skip = n), (0, t.setSearchParams)(p, g);
        let U = v && v.headers ? v.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), U), u.headers), {
          url: (0, t.toPathString)(p),
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
      updatePointOfSale: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        (0, t.assertParamExists)("updatePointOfSale", "id", e), (0, t.assertParamExists)("updatePointOfSale", "updatePointOfSaleRequest", a);
        const n = "/pointsofsale/{id}".replace("{id}", encodeURIComponent(String(e))), u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, t.serializeDataIfNeeded)(a, p, r), {
          url: (0, t.toPathString)(u),
          options: p
        };
      })
    };
  };
  l.PointofsaleApiAxiosParamCreator = us;
  const hs = function(r) {
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
          var e, a, s;
          const n = yield c.createPointOfSale(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["PointofsaleApi.createPointOfSale"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.deletePointOfSale(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["PointofsaleApi.deletePointOfSale"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      getAllPointOfSaleContainers(o, i, e, a) {
        return h(this, void 0, void 0, function* () {
          var s, n, u;
          const d = yield c.getAllPointOfSaleContainers(o, i, e, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, v = (u = (n = A.operationServerMap["PointofsaleApi.getAllPointOfSaleContainers"]) === null || n === void 0 ? void 0 : n[p]) === null || u === void 0 ? void 0 : u.url;
          return (P, b) => (0, t.createRequestFunction)(d, O.default, A.BASE_PATH, r)(P, v || b);
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
          var e, a, s;
          const n = yield c.getAllPointOfSaleProducts(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["PointofsaleApi.getAllPointOfSaleProducts"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      getAllPointsOfSale(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllPointsOfSale(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["PointofsaleApi.getAllPointsOfSale"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
          var e, a, s;
          const n = yield c.getPointOfSaleAssociates(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["PointofsaleApi.getPointOfSaleAssociates"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.getSinglePointOfSale(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["PointofsaleApi.getSinglePointOfSale"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      getTransactions(o, i, e, a) {
        return h(this, void 0, void 0, function* () {
          var s, n, u;
          const d = yield c.getTransactions(o, i, e, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, v = (u = (n = A.operationServerMap["PointofsaleApi.getTransactions"]) === null || n === void 0 ? void 0 : n[p]) === null || u === void 0 ? void 0 : u.url;
          return (P, b) => (0, t.createRequestFunction)(d, O.default, A.BASE_PATH, r)(P, v || b);
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
      updatePointOfSale(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updatePointOfSale(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["PointofsaleApi.updatePointOfSale"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      }
    };
  };
  l.PointofsaleApiFp = hs;
  const ps = function(r, c, o) {
    const i = (0, l.PointofsaleApiFp)(r);
    return {
      /**
       *
       * @summary Create a new Point of Sale.
       * @param {CreatePointOfSaleRequest} createPointOfSaleRequest The point of sale which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createPointOfSale(e, a) {
        return i.createPointOfSale(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary (Soft) delete the given point of sale. Cannot be undone.
       * @param {number} id The id of the point of sale which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deletePointOfSale(e, a) {
        return i.deletePointOfSale(e, a).then((s) => s(o, c));
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
      getAllPointOfSaleContainers(e, a, s, n) {
        return i.getAllPointOfSaleContainers(e, a, s, n).then((u) => u(o, c));
      },
      /**
       *
       * @summary Returns the products of the requested Point of Sale, empty list if POS does not exist
       * @param {number} id The id of the point of sale
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointOfSaleProducts(e, a) {
        return i.getAllPointOfSaleProducts(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Returns all existing Point of Sales
       * @param {number} [take] How many points of sale the endpoint should return
       * @param {number} [skip] How many points of sale should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllPointsOfSale(e, a, s) {
        return i.getAllPointsOfSale(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Returns a Point of Sale\'s associate users
       * @param {number} id The id of the Point of Sale of which to get the associate users.
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getPointOfSaleAssociates(e, a) {
        return i.getPointOfSaleAssociates(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Returns the requested Point of Sale
       * @param {number} id The id of the Point of Sale which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSinglePointOfSale(e, a) {
        return i.getSinglePointOfSale(e, a).then((s) => s(o, c));
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
      getTransactions(e, a, s, n) {
        return i.getTransactions(e, a, s, n).then((u) => u(o, c));
      },
      /**
       *
       * @summary Update an existing Point of Sale.
       * @param {number} id The id of the Point of Sale which should be updated
       * @param {UpdatePointOfSaleRequest} updatePointOfSaleRequest    The Point of Sale which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updatePointOfSale(e, a, s) {
        return i.updatePointOfSale(e, a, s).then((n) => n(o, c));
      }
    };
  };
  l.PointofsaleApiFactory = ps;
  class vs extends A.BaseAPI {
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
    getAllPointOfSaleContainers(c, o, i, e) {
      return (0, l.PointofsaleApiFp)(this.configuration).getAllPointOfSaleContainers(c, o, i, e).then((a) => a(this.axios, this.basePath));
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
      return (0, l.PointofsaleApiFp)(this.configuration).getAllPointsOfSale(c, o, i).then((e) => e(this.axios, this.basePath));
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
    getTransactions(c, o, i, e) {
      return (0, l.PointofsaleApiFp)(this.configuration).getTransactions(c, o, i, e).then((a) => a(this.axios, this.basePath));
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
      return (0, l.PointofsaleApiFp)(this.configuration).updatePointOfSale(c, o, i).then((e) => e(this.axios, this.basePath));
    }
  }
  l.PointofsaleApi = vs;
  const As = function(r) {
    return {
      /**
       *
       * @summary Post a new productCategory.
       * @param {ProductCategoryRequest} productCategoryRequest The productCategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProductCategory: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("createProductCategory", "productCategoryRequest", i);
        const a = "/productcategories", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      getAllProductCategories: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        const n = "/productcategories", u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), e !== void 0 && (P.take = e), a !== void 0 && (P.skip = a), (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, t.toPathString)(u),
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
      getSingleProductCategory: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("getSingleProductCategory", "id", i);
        const a = "/productcategories/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      updateProductCategory: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        (0, t.assertParamExists)("updateProductCategory", "id", e), (0, t.assertParamExists)("updateProductCategory", "productCategoryRequest", a);
        const n = "/productcategories/{id}".replace("{id}", encodeURIComponent(String(e))), u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, t.serializeDataIfNeeded)(a, p, r), {
          url: (0, t.toPathString)(u),
          options: p
        };
      })
    };
  };
  l.ProductCategoriesApiAxiosParamCreator = As;
  const Os = function(r) {
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
          var e, a, s;
          const n = yield c.createProductCategory(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["ProductCategoriesApi.createProductCategory"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      getAllProductCategories(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllProductCategories(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["ProductCategoriesApi.getAllProductCategories"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
          var e, a, s;
          const n = yield c.getSingleProductCategory(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["ProductCategoriesApi.getSingleProductCategory"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      updateProductCategory(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateProductCategory(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["ProductCategoriesApi.updateProductCategory"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      }
    };
  };
  l.ProductCategoriesApiFp = Os;
  const Ps = function(r, c, o) {
    const i = (0, l.ProductCategoriesApiFp)(r);
    return {
      /**
       *
       * @summary Post a new productCategory.
       * @param {ProductCategoryRequest} productCategoryRequest The productCategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProductCategory(e, a) {
        return i.createProductCategory(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Returns all existing productcategories
       * @param {number} [take] How many product categories the endpoint should return
       * @param {number} [skip] How many product categories should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProductCategories(e, a, s) {
        return i.getAllProductCategories(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Returns the requested productcategory
       * @param {number} id The id of the productcategory which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProductCategory(e, a) {
        return i.getSingleProductCategory(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Update an existing productcategory.
       * @param {number} id The id of the productcategory which should be returned
       * @param {ProductCategoryRequest} productCategoryRequest The productcategory which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductCategory(e, a, s) {
        return i.updateProductCategory(e, a, s).then((n) => n(o, c));
      }
    };
  };
  l.ProductCategoriesApiFactory = Ps;
  class bs extends A.BaseAPI {
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
      return (0, l.ProductCategoriesApiFp)(this.configuration).getAllProductCategories(c, o, i).then((e) => e(this.axios, this.basePath));
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
      return (0, l.ProductCategoriesApiFp)(this.configuration).updateProductCategory(c, o, i).then((e) => e(this.axios, this.basePath));
    }
  }
  l.ProductCategoriesApi = bs;
  const ms = function(r) {
    return {
      /**
       *
       * @summary Create a new product.
       * @param {CreateProductRequest} createProductRequest The product which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProduct: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("createProduct", "createProductRequest", i);
        const a = "/products", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      deleteProduct: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("deleteProduct", "id", i);
        const a = "/products/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      getAllProducts: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        const n = "/products", u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), e !== void 0 && (P.take = e), a !== void 0 && (P.skip = a), (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, t.toPathString)(u),
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
      getSingleProduct: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("getSingleProduct", "id", i);
        const a = "/products/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      updateProduct: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        (0, t.assertParamExists)("updateProduct", "id", e), (0, t.assertParamExists)("updateProduct", "updateProductRequest", a);
        const n = "/products/{id}".replace("{id}", encodeURIComponent(String(e))), u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, t.serializeDataIfNeeded)(a, p, r), {
          url: (0, t.toPathString)(u),
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
      updateProductImage: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        (0, t.assertParamExists)("updateProductImage", "id", e);
        const n = "/products/{id}/image".replace("{id}", encodeURIComponent(String(e))), u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "POST" }, d), s), v = {}, P = {}, b = new (r && r.formDataCtor || FormData)();
        yield (0, t.setBearerAuthToObject)(v, r), a !== void 0 && b.append("file", a), v["Content-Type"] = "multipart/form-data", (0, t.setSearchParams)(u, P);
        let g = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), g), s.headers), p.data = b, {
          url: (0, t.toPathString)(u),
          options: p
        };
      })
    };
  };
  l.ProductsApiAxiosParamCreator = ms;
  const Ss = function(r) {
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
          var e, a, s;
          const n = yield c.createProduct(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["ProductsApi.createProduct"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.deleteProduct(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["ProductsApi.deleteProduct"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      getAllProducts(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllProducts(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["ProductsApi.getAllProducts"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
          var e, a, s;
          const n = yield c.getSingleProduct(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["ProductsApi.getSingleProduct"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      updateProduct(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateProduct(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["ProductsApi.updateProduct"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
      updateProductImage(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateProductImage(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["ProductsApi.updateProductImage"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      }
    };
  };
  l.ProductsApiFp = Ss;
  const fs = function(r, c, o) {
    const i = (0, l.ProductsApiFp)(r);
    return {
      /**
       *
       * @summary Create a new product.
       * @param {CreateProductRequest} createProductRequest The product which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createProduct(e, a) {
        return i.createProduct(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary (Soft) delete the given product. Cannot be undone.
       * @param {number} id The id of the product which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteProduct(e, a) {
        return i.deleteProduct(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Returns all existing products
       * @param {number} [take] How many products the endpoint should return
       * @param {number} [skip] How many products should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllProducts(e, a, s) {
        return i.getAllProducts(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Returns the requested product
       * @param {number} id The id of the product which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleProduct(e, a) {
        return i.getSingleProduct(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Update an existing product.
       * @param {number} id The id of the product which should be updated
       * @param {UpdateProductRequest} updateProductRequest The product which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProduct(e, a, s) {
        return i.updateProduct(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Upload a new image for a product
       * @param {number} id The id of the product which should be returned
       * @param {File} [file] file
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateProductImage(e, a, s) {
        return i.updateProductImage(e, a, s).then((n) => n(o, c));
      }
    };
  };
  l.ProductsApiFactory = fs;
  class gs extends A.BaseAPI {
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
      return (0, l.ProductsApiFp)(this.configuration).getAllProducts(c, o, i).then((e) => e(this.axios, this.basePath));
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
      return (0, l.ProductsApiFp)(this.configuration).updateProduct(c, o, i).then((e) => e(this.axios, this.basePath));
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
      return (0, l.ProductsApiFp)(this.configuration).updateProductImage(c, o, i).then((e) => e(this.axios, this.basePath));
    }
  }
  l.ProductsApi = gs;
  const js = function(r) {
    return {
      /**
       *
       * @summary Add new permissions to an existing role
       * @param {number} id The ID of the role which should get the new permissions
       * @param {Array<CreatePermissionParams>} createPermissionParams The permissions that need to be added
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      addPermissions: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        (0, t.assertParamExists)("addPermissions", "id", e), (0, t.assertParamExists)("addPermissions", "createPermissionParams", a);
        const n = "/rbac/roles/{id}/permissions".replace("{id}", encodeURIComponent(String(e))), u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "POST" }, d), s), v = {}, P = {};
        v["Content-Type"] = "application/json", (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, t.serializeDataIfNeeded)(a, p, r), {
          url: (0, t.toPathString)(u),
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
      createRole: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("createRole", "updateRoleRequest", i);
        const a = "/rbac/roles", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      deletePermission: (c, o, i, e, ...a) => h(this, [c, o, i, e, ...a], void 0, function* (s, n, u, d, p = {}) {
        (0, t.assertParamExists)("deletePermission", "id", s), (0, t.assertParamExists)("deletePermission", "entity", n), (0, t.assertParamExists)("deletePermission", "action", u), (0, t.assertParamExists)("deletePermission", "relation", d);
        const v = "/rbac/roles/{id}/permissions/{entity}/{action}/{relation}".replace("{id}", encodeURIComponent(String(s))).replace("{entity}", encodeURIComponent(String(n))).replace("{action}", encodeURIComponent(String(u))).replace("{relation}", encodeURIComponent(String(d))), P = new URL(v, t.DUMMY_BASE_URL);
        let b;
        r && (b = r.baseOptions);
        const g = Object.assign(Object.assign({ method: "DELETE" }, b), p), U = {}, V = {};
        (0, t.setSearchParams)(P, V);
        let E = b && b.headers ? b.headers : {};
        return g.headers = Object.assign(Object.assign(Object.assign({}, U), E), p.headers), {
          url: (0, t.toPathString)(P),
          options: g
        };
      }),
      /**
       *
       * @summary Delete an existing role
       * @param {number} id The ID of the role which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteRole: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("deleteRole", "id", i);
        const a = "/rbac/roles/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
        const i = "/rbac/roles", e = new URL(i, t.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const s = Object.assign(Object.assign({ method: "GET" }, a), o), n = {}, u = {};
        yield (0, t.setBearerAuthToObject)(n, r), (0, t.setSearchParams)(e, u);
        let d = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, n), d), o.headers), {
          url: (0, t.toPathString)(e),
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
      getSingleRole: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("getSingleRole", "id", i);
        const a = "/rbac/roles/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      updateRole: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        (0, t.assertParamExists)("updateRole", "id", e), (0, t.assertParamExists)("updateRole", "updateRoleRequest", a);
        const n = "/rbac/roles/{id}".replace("{id}", encodeURIComponent(String(e))), u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, t.serializeDataIfNeeded)(a, p, r), {
          url: (0, t.toPathString)(u),
          options: p
        };
      })
    };
  };
  l.RbacApiAxiosParamCreator = js;
  const Us = function(r) {
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
      addPermissions(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.addPermissions(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["RbacApi.addPermissions"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
          var e, a, s;
          const n = yield c.createRole(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["RbacApi.createRole"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      deletePermission(o, i, e, a, s) {
        return h(this, void 0, void 0, function* () {
          var n, u, d;
          const p = yield c.deletePermission(o, i, e, a, s), v = (n = r == null ? void 0 : r.serverIndex) !== null && n !== void 0 ? n : 0, P = (d = (u = A.operationServerMap["RbacApi.deletePermission"]) === null || u === void 0 ? void 0 : u[v]) === null || d === void 0 ? void 0 : d.url;
          return (b, g) => (0, t.createRequestFunction)(p, O.default, A.BASE_PATH, r)(b, P || g);
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
          var e, a, s;
          const n = yield c.deleteRole(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["RbacApi.deleteRole"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var i, e, a;
          const s = yield c.getAllRoles(o), n = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (a = (e = A.operationServerMap["RbacApi.getAllRoles"]) === null || e === void 0 ? void 0 : e[n]) === null || a === void 0 ? void 0 : a.url;
          return (d, p) => (0, t.createRequestFunction)(s, O.default, A.BASE_PATH, r)(d, u || p);
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
          var e, a, s;
          const n = yield c.getSingleRole(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["RbacApi.getSingleRole"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      updateRole(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateRole(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["RbacApi.updateRole"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      }
    };
  };
  l.RbacApiFp = Us;
  const Rs = function(r, c, o) {
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
      addPermissions(e, a, s) {
        return i.addPermissions(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Create a new role
       * @param {UpdateRoleRequest} updateRoleRequest The role which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createRole(e, a) {
        return i.createRole(e, a).then((s) => s(o, c));
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
      deletePermission(e, a, s, n, u) {
        return i.deletePermission(e, a, s, n, u).then((d) => d(o, c));
      },
      /**
       *
       * @summary Delete an existing role
       * @param {number} id The ID of the role which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteRole(e, a) {
        return i.deleteRole(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Get all existing roles
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllRoles(e) {
        return i.getAllRoles(e).then((a) => a(o, c));
      },
      /**
       *
       * @summary Get a single existing role with its permissions
       * @param {number} id The ID of the role that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleRole(e, a) {
        return i.getSingleRole(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Update an existing role
       * @param {number} id The ID of the role which should be updated
       * @param {UpdateRoleRequest} updateRoleRequest The role which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateRole(e, a, s) {
        return i.updateRole(e, a, s).then((n) => n(o, c));
      }
    };
  };
  l.RbacApiFactory = Rs;
  class _s extends A.BaseAPI {
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
      return (0, l.RbacApiFp)(this.configuration).addPermissions(c, o, i).then((e) => e(this.axios, this.basePath));
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
    deletePermission(c, o, i, e, a) {
      return (0, l.RbacApiFp)(this.configuration).deletePermission(c, o, i, e, a).then((s) => s(this.axios, this.basePath));
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
      return (0, l.RbacApiFp)(this.configuration).updateRole(c, o, i).then((e) => e(this.axios, this.basePath));
    }
  }
  l.RbacApi = _s;
  const Vs = function(r) {
    return {
      /**
       *
       * @summary Ping the backend to check whether everything is working correctly
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ping: (...c) => h(this, [...c], void 0, function* (o = {}) {
        const i = "/ping", e = new URL(i, t.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const s = Object.assign(Object.assign({ method: "GET" }, a), o), n = {}, u = {};
        (0, t.setSearchParams)(e, u);
        let d = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, n), d), o.headers), {
          url: (0, t.toPathString)(e),
          options: s
        };
      })
    };
  };
  l.RootApiAxiosParamCreator = Vs;
  const ys = function(r) {
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
          var i, e, a;
          const s = yield c.ping(o), n = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (a = (e = A.operationServerMap["RootApi.ping"]) === null || e === void 0 ? void 0 : e[n]) === null || a === void 0 ? void 0 : a.url;
          return (d, p) => (0, t.createRequestFunction)(s, O.default, A.BASE_PATH, r)(d, u || p);
        });
      }
    };
  };
  l.RootApiFp = ys;
  const Es = function(r, c, o) {
    const i = (0, l.RootApiFp)(r);
    return {
      /**
       *
       * @summary Ping the backend to check whether everything is working correctly
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      ping(e) {
        return i.ping(e).then((a) => a(o, c));
      }
    };
  };
  l.RootApiFactory = Es;
  class Ts extends A.BaseAPI {
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
  l.RootApi = Ts;
  const Bs = function(r) {
    return {
      /**
       *
       * @summary Start the stripe deposit flow
       * @param {StripeRequest} stripeRequest The deposit that should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deposit: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("deposit", "stripeRequest", i);
        const a = "/stripe/deposit", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Get the Stripe public key
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getStripePublicKey: (...c) => h(this, [...c], void 0, function* (o = {}) {
        const i = "/stripe/public", e = new URL(i, t.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const s = Object.assign(Object.assign({ method: "GET" }, a), o), n = {}, u = {};
        (0, t.setSearchParams)(e, u);
        let d = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, n), d), o.headers), {
          url: (0, t.toPathString)(e),
          options: s
        };
      })
    };
  };
  l.StripeApiAxiosParamCreator = Bs;
  const Fs = function(r) {
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
          var e, a, s;
          const n = yield c.deposit(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["StripeApi.deposit"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Get the Stripe public key
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getStripePublicKey(o) {
        return h(this, void 0, void 0, function* () {
          var i, e, a;
          const s = yield c.getStripePublicKey(o), n = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (a = (e = A.operationServerMap["StripeApi.getStripePublicKey"]) === null || e === void 0 ? void 0 : e[n]) === null || a === void 0 ? void 0 : a.url;
          return (d, p) => (0, t.createRequestFunction)(s, O.default, A.BASE_PATH, r)(d, u || p);
        });
      }
    };
  };
  l.StripeApiFp = Fs;
  const Cs = function(r, c, o) {
    const i = (0, l.StripeApiFp)(r);
    return {
      /**
       *
       * @summary Start the stripe deposit flow
       * @param {StripeRequest} stripeRequest The deposit that should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deposit(e, a) {
        return i.deposit(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Get the Stripe public key
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getStripePublicKey(e) {
        return i.getStripePublicKey(e).then((a) => a(o, c));
      }
    };
  };
  l.StripeApiFactory = Cs;
  class Is extends A.BaseAPI {
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
    /**
     *
     * @summary Get the Stripe public key
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof StripeApi
     */
    getStripePublicKey(c) {
      return (0, l.StripeApiFp)(this.configuration).getStripePublicKey(c).then((o) => o(this.axios, this.basePath));
    }
  }
  l.StripeApi = Is;
  const Ms = function(r) {
    return {
      /**
       *
       * @summary Get a beautiful Hello World email to your inbox
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      helloworld: (...c) => h(this, [...c], void 0, function* (o = {}) {
        const i = "/test/helloworld", e = new URL(i, t.DUMMY_BASE_URL);
        let a;
        r && (a = r.baseOptions);
        const s = Object.assign(Object.assign({ method: "POST" }, a), o), n = {}, u = {};
        yield (0, t.setBearerAuthToObject)(n, r), (0, t.setSearchParams)(e, u);
        let d = a && a.headers ? a.headers : {};
        return s.headers = Object.assign(Object.assign(Object.assign({}, n), d), o.headers), {
          url: (0, t.toPathString)(e),
          options: s
        };
      })
    };
  };
  l.TestOperationsOfTheTestControllerApiAxiosParamCreator = Ms;
  const ws = function(r) {
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
          var i, e, a;
          const s = yield c.helloworld(o), n = (i = r == null ? void 0 : r.serverIndex) !== null && i !== void 0 ? i : 0, u = (a = (e = A.operationServerMap["TestOperationsOfTheTestControllerApi.helloworld"]) === null || e === void 0 ? void 0 : e[n]) === null || a === void 0 ? void 0 : a.url;
          return (d, p) => (0, t.createRequestFunction)(s, O.default, A.BASE_PATH, r)(d, u || p);
        });
      }
    };
  };
  l.TestOperationsOfTheTestControllerApiFp = ws;
  const xs = function(r, c, o) {
    const i = (0, l.TestOperationsOfTheTestControllerApiFp)(r);
    return {
      /**
       *
       * @summary Get a beautiful Hello World email to your inbox
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      helloworld(e) {
        return i.helloworld(e).then((a) => a(o, c));
      }
    };
  };
  l.TestOperationsOfTheTestControllerApiFactory = xs;
  class Ls extends A.BaseAPI {
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
  l.TestOperationsOfTheTestControllerApi = Ls;
  const qs = function(r) {
    return {
      /**
       *
       * @summary Creates a new transaction
       * @param {TransactionRequest} transactionRequest The transaction which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransaction: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("createTransaction", "transactionRequest", i);
        const a = "/transactions", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      deleteTransaction: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("deleteTransaction", "id", i);
        const a = "/transactions/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      getAllTransactions: (c, o, i, e, a, s, n, u, d, p, ...v) => h(this, [c, o, i, e, a, s, n, u, d, p, ...v], void 0, function* (P, b, g, U, V, E, M, I, C, q, x = {}) {
        const ee = "/transactions", k = new URL(ee, t.DUMMY_BASE_URL);
        let z;
        r && (z = r.baseOptions);
        const de = Object.assign(Object.assign({ method: "GET" }, z), x), pe = {}, H = {};
        yield (0, t.setBearerAuthToObject)(pe, r), P !== void 0 && (H.fromId = P), b !== void 0 && (H.createdById = b), g !== void 0 && (H.toId = g), U !== void 0 && (H.pointOfSaleId = U), V !== void 0 && (H.productId = V), E !== void 0 && (H.productRevision = E), M !== void 0 && (H.fromDate = M), I !== void 0 && (H.tillDate = I), C !== void 0 && (H.take = C), q !== void 0 && (H.skip = q), (0, t.setSearchParams)(k, H);
        let le = z && z.headers ? z.headers : {};
        return de.headers = Object.assign(Object.assign(Object.assign({}, pe), le), x.headers), {
          url: (0, t.toPathString)(k),
          options: de
        };
      }),
      /**
       *
       * @summary Get a single transaction
       * @param {number} id The id of the transaction which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransaction: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("getSingleTransaction", "id", i);
        const a = "/transactions/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      updateTransaction: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        (0, t.assertParamExists)("updateTransaction", "id", e), (0, t.assertParamExists)("updateTransaction", "transactionRequest", a);
        const n = "/transactions/{id}".replace("{id}", encodeURIComponent(String(e))), u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, t.serializeDataIfNeeded)(a, p, r), {
          url: (0, t.toPathString)(u),
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
      validateTransaction: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("validateTransaction", "transactionRequest", i);
        const a = "/transactions/validate", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
          options: u
        };
      })
    };
  };
  l.TransactionsApiAxiosParamCreator = qs;
  const Ds = function(r) {
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
          var e, a, s;
          const n = yield c.createTransaction(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["TransactionsApi.createTransaction"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.deleteTransaction(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["TransactionsApi.deleteTransaction"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      getAllTransactions(o, i, e, a, s, n, u, d, p, v, P) {
        return h(this, void 0, void 0, function* () {
          var b, g, U;
          const V = yield c.getAllTransactions(o, i, e, a, s, n, u, d, p, v, P), E = (b = r == null ? void 0 : r.serverIndex) !== null && b !== void 0 ? b : 0, M = (U = (g = A.operationServerMap["TransactionsApi.getAllTransactions"]) === null || g === void 0 ? void 0 : g[E]) === null || U === void 0 ? void 0 : U.url;
          return (I, C) => (0, t.createRequestFunction)(V, O.default, A.BASE_PATH, r)(I, M || C);
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
          var e, a, s;
          const n = yield c.getSingleTransaction(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["TransactionsApi.getSingleTransaction"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      updateTransaction(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateTransaction(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["TransactionsApi.updateTransaction"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
          var e, a, s;
          const n = yield c.validateTransaction(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["TransactionsApi.validateTransaction"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      }
    };
  };
  l.TransactionsApiFp = Ds;
  const Hs = function(r, c, o) {
    const i = (0, l.TransactionsApiFp)(r);
    return {
      /**
       *
       * @summary Creates a new transaction
       * @param {TransactionRequest} transactionRequest The transaction which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransaction(e, a) {
        return i.createTransaction(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Deletes a transaction
       * @param {number} id The id of the transaction which should be deleted
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteTransaction(e, a) {
        return i.deleteTransaction(e, a).then((s) => s(o, c));
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
      getAllTransactions(e, a, s, n, u, d, p, v, P, b, g) {
        return i.getAllTransactions(e, a, s, n, u, d, p, v, P, b, g).then((U) => U(o, c));
      },
      /**
       *
       * @summary Get a single transaction
       * @param {number} id The id of the transaction which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransaction(e, a) {
        return i.getSingleTransaction(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Updates the requested transaction
       * @param {number} id The id of the transaction which should be updated
       * @param {TransactionRequest} transactionRequest The updated transaction
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateTransaction(e, a, s) {
        return i.updateTransaction(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Function to validate the transaction immediatly after it is created
       * @param {TransactionRequest} transactionRequest The transaction which should be validated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      validateTransaction(e, a) {
        return i.validateTransaction(e, a).then((s) => s(o, c));
      }
    };
  };
  l.TransactionsApiFactory = Hs;
  class Ns extends A.BaseAPI {
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
    getAllTransactions(c, o, i, e, a, s, n, u, d, p, v) {
      return (0, l.TransactionsApiFp)(this.configuration).getAllTransactions(c, o, i, e, a, s, n, u, d, p, v).then((P) => P(this.axios, this.basePath));
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
      return (0, l.TransactionsApiFp)(this.configuration).updateTransaction(c, o, i).then((e) => e(this.axios, this.basePath));
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
  l.TransactionsApi = Ns;
  const Gs = function(r) {
    return {
      /**
       *
       * @summary Post a new transfer.
       * @param {TransferRequest} transferRequest The transfer which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransfer: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("createTransfer", "transferRequest", i);
        const a = "/transfers", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      getAllTransfers: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        const n = "/transfers", u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), e !== void 0 && (P.take = e), a !== void 0 && (P.skip = a), (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, t.toPathString)(u),
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
      getSingleTransfer: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("getSingleTransfer", "id", i);
        const a = "/transfers/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
          options: u
        };
      })
    };
  };
  l.TransfersApiAxiosParamCreator = Gs;
  const ks = function(r) {
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
          var e, a, s;
          const n = yield c.createTransfer(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["TransfersApi.createTransfer"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      getAllTransfers(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllTransfers(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["TransfersApi.getAllTransfers"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
          var e, a, s;
          const n = yield c.getSingleTransfer(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["TransfersApi.getSingleTransfer"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      }
    };
  };
  l.TransfersApiFp = ks;
  const Qs = function(r, c, o) {
    const i = (0, l.TransfersApiFp)(r);
    return {
      /**
       *
       * @summary Post a new transfer.
       * @param {TransferRequest} transferRequest The transfer which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createTransfer(e, a) {
        return i.createTransfer(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Returns all existing transfers
       * @param {number} [take] How many transfers the endpoint should return
       * @param {number} [skip] How many transfers should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllTransfers(e, a, s) {
        return i.getAllTransfers(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Returns the requested transfer
       * @param {number} id The id of the transfer which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleTransfer(e, a) {
        return i.getSingleTransfer(e, a).then((s) => s(o, c));
      }
    };
  };
  l.TransfersApiFactory = Qs;
  class Ys extends A.BaseAPI {
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
      return (0, l.TransfersApiFp)(this.configuration).getAllTransfers(c, o, i).then((e) => e(this.axios, this.basePath));
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
  l.TransfersApi = Ys;
  const $s = function(r) {
    return {
      /**
       *
       * @summary Accept the Terms of Service if you have not accepted it yet
       * @param {AcceptTosRequest} acceptTosRequest \&quot;Tosrequest body\&quot;
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      acceptTos: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("acceptTos", "acceptTosRequest", i);
        const a = "/users/acceptTos", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      authenticateAs: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("authenticateAs", "id", i);
        const a = "/users/{id}/authenticate".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      createUser: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("createUser", "createUserRequest", i);
        const a = "/users", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      deleteUser: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("deleteUser", "id", i);
        const a = "/users/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      deleteUserKey: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("deleteUserKey", "id", i);
        const a = "/users/{id}/authenticator/key".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      deleteUserNfc: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("deleteUserNfc", "id", i);
        const a = "/users/{id}/authenticator/nfc".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "DELETE" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      getAllUsers: (c, o, i, e, a, s, n, ...u) => h(this, [c, o, i, e, a, s, n, ...u], void 0, function* (d, p, v, P, b, g, U, V = {}) {
        const E = "/users", M = new URL(E, t.DUMMY_BASE_URL);
        let I;
        r && (I = r.baseOptions);
        const C = Object.assign(Object.assign({ method: "GET" }, I), V), q = {}, x = {};
        yield (0, t.setBearerAuthToObject)(q, r), d !== void 0 && (x.take = d), p !== void 0 && (x.skip = p), v !== void 0 && (x.search = v), P !== void 0 && (x.active = P), b !== void 0 && (x.ofAge = b), g !== void 0 && (x.id = g), U !== void 0 && (x.type = U), (0, t.setSearchParams)(M, x);
        let ee = I && I.headers ? I.headers : {};
        return C.headers = Object.assign(Object.assign(Object.assign({}, q), ee), V.headers), {
          url: (0, t.toPathString)(M),
          options: C
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
      getAllUsersOfUserType: (c, o, i, ...e) => h(this, [c, o, i, ...e], void 0, function* (a, s, n, u = {}) {
        (0, t.assertParamExists)("getAllUsersOfUserType", "userType", a);
        const d = "/users/usertype/{userType}".replace("{userType}", encodeURIComponent(String(a))), p = new URL(d, t.DUMMY_BASE_URL);
        let v;
        r && (v = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, v), u), b = {}, g = {};
        yield (0, t.setBearerAuthToObject)(b, r), s !== void 0 && (g.take = s), n !== void 0 && (g.skip = n), (0, t.setSearchParams)(p, g);
        let U = v && v.headers ? v.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), U), u.headers), {
          url: (0, t.toPathString)(p),
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
      getIndividualUser: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("getIndividualUser", "id", i);
        const a = "/users/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      getOrganMembers: (c, o, i, ...e) => h(this, [c, o, i, ...e], void 0, function* (a, s, n, u = {}) {
        (0, t.assertParamExists)("getOrganMembers", "id", a);
        const d = "/users/{id}/members".replace("{id}", encodeURIComponent(String(a))), p = new URL(d, t.DUMMY_BASE_URL);
        let v;
        r && (v = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, v), u), b = {}, g = {};
        yield (0, t.setBearerAuthToObject)(b, r), s !== void 0 && (g.take = s), n !== void 0 && (g.skip = n), (0, t.setSearchParams)(p, g);
        let U = v && v.headers ? v.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), U), u.headers), {
          url: (0, t.toPathString)(p),
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
      getUserAuthenticatable: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("getUserAuthenticatable", "id", i);
        const a = "/users/{id}/authenticate".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      getUserRoles: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("getUserRoles", "id", i);
        const a = "/users/{id}/roles".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      getUsersContainers: (c, o, i, ...e) => h(this, [c, o, i, ...e], void 0, function* (a, s, n, u = {}) {
        (0, t.assertParamExists)("getUsersContainers", "id", a);
        const d = "/users/{id}/containers".replace("{id}", encodeURIComponent(String(a))), p = new URL(d, t.DUMMY_BASE_URL);
        let v;
        r && (v = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, v), u), b = {}, g = {};
        yield (0, t.setBearerAuthToObject)(b, r), s !== void 0 && (g.take = s), n !== void 0 && (g.skip = n), (0, t.setSearchParams)(p, g);
        let U = v && v.headers ? v.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), U), u.headers), {
          url: (0, t.toPathString)(p),
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
      getUsersFinancialMutations: (c, o, i, e, a, ...s) => h(this, [c, o, i, e, a, ...s], void 0, function* (n, u, d, p, v, P = {}) {
        (0, t.assertParamExists)("getUsersFinancialMutations", "id", n);
        const b = "/users/{id}/financialmutations".replace("{id}", encodeURIComponent(String(n))), g = new URL(b, t.DUMMY_BASE_URL);
        let U;
        r && (U = r.baseOptions);
        const V = Object.assign(Object.assign({ method: "GET" }, U), P), E = {}, M = {};
        yield (0, t.setBearerAuthToObject)(E, r), u !== void 0 && (M.fromDate = u), d !== void 0 && (M.tillDate = d), p !== void 0 && (M.take = p), v !== void 0 && (M.skip = v), (0, t.setSearchParams)(g, M);
        let I = U && U.headers ? U.headers : {};
        return V.headers = Object.assign(Object.assign(Object.assign({}, E), I), P.headers), {
          url: (0, t.toPathString)(g),
          options: V
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
      getUsersPointsOfSale: (c, o, i, ...e) => h(this, [c, o, i, ...e], void 0, function* (a, s, n, u = {}) {
        (0, t.assertParamExists)("getUsersPointsOfSale", "id", a);
        const d = "/users/{id}/pointsofsale".replace("{id}", encodeURIComponent(String(a))), p = new URL(d, t.DUMMY_BASE_URL);
        let v;
        r && (v = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, v), u), b = {}, g = {};
        yield (0, t.setBearerAuthToObject)(b, r), s !== void 0 && (g.take = s), n !== void 0 && (g.skip = n), (0, t.setSearchParams)(p, g);
        let U = v && v.headers ? v.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), U), u.headers), {
          url: (0, t.toPathString)(p),
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
      getUsersProcessingDeposits: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("getUsersProcessingDeposits", "id", i);
        const a = "/users/{id}/deposits".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      getUsersProducts: (c, o, i, ...e) => h(this, [c, o, i, ...e], void 0, function* (a, s, n, u = {}) {
        (0, t.assertParamExists)("getUsersProducts", "id", a);
        const d = "/users/{id}/products".replace("{id}", encodeURIComponent(String(a))), p = new URL(d, t.DUMMY_BASE_URL);
        let v;
        r && (v = r.baseOptions);
        const P = Object.assign(Object.assign({ method: "GET" }, v), u), b = {}, g = {};
        yield (0, t.setBearerAuthToObject)(b, r), s !== void 0 && (g.take = s), n !== void 0 && (g.skip = n), (0, t.setSearchParams)(p, g);
        let U = v && v.headers ? v.headers : {};
        return P.headers = Object.assign(Object.assign(Object.assign({}, b), U), u.headers), {
          url: (0, t.toPathString)(p),
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
      getUsersTransactions: (c, o, i, e, a, s, n, u, d, p, ...v) => h(this, [c, o, i, e, a, s, n, u, d, p, ...v], void 0, function* (P, b, g, U, V, E, M, I, C, q, x = {}) {
        (0, t.assertParamExists)("getUsersTransactions", "id", P);
        const ee = "/users/{id}/transactions".replace("{id}", encodeURIComponent(String(P))), k = new URL(ee, t.DUMMY_BASE_URL);
        let z;
        r && (z = r.baseOptions);
        const de = Object.assign(Object.assign({ method: "GET" }, z), x), pe = {}, H = {};
        yield (0, t.setBearerAuthToObject)(pe, r), b !== void 0 && (H.fromId = b), g !== void 0 && (H.createdById = g), U !== void 0 && (H.toId = U), V !== void 0 && (H.productId = V), E !== void 0 && (H.productRevision = E), M !== void 0 && (H.fromDate = M), I !== void 0 && (H.tillDate = I), C !== void 0 && (H.take = C), q !== void 0 && (H.skip = q), (0, t.setSearchParams)(k, H);
        let le = z && z.headers ? z.headers : {};
        return de.headers = Object.assign(Object.assign(Object.assign({}, pe), le), x.headers), {
          url: (0, t.toPathString)(k),
          options: de
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
      getUsersTransactionsReport: (c, o, i, e, a, s, ...n) => h(this, [c, o, i, e, a, s, ...n], void 0, function* (u, d, p, v, P, b, g = {}) {
        (0, t.assertParamExists)("getUsersTransactionsReport", "id", u);
        const U = "/users/{id}/transactions/report".replace("{id}", encodeURIComponent(String(u))), V = new URL(U, t.DUMMY_BASE_URL);
        let E;
        r && (E = r.baseOptions);
        const M = Object.assign(Object.assign({ method: "GET" }, E), g), I = {}, C = {};
        yield (0, t.setBearerAuthToObject)(I, r), d !== void 0 && (C.fromDate = d), p !== void 0 && (C.tillDate = p), v !== void 0 && (C.fromId = v), P !== void 0 && (C.toId = P), b !== void 0 && (C.exclusiveToId = b), (0, t.setSearchParams)(V, C);
        let q = E && E.headers ? E.headers : {};
        return M.headers = Object.assign(Object.assign(Object.assign({}, I), q), g.headers), {
          url: (0, t.toPathString)(V),
          options: M
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
      getUsersTransfers: (c, o, i, e, a, s, ...n) => h(this, [c, o, i, e, a, s, ...n], void 0, function* (u, d, p, v, P, b, g = {}) {
        (0, t.assertParamExists)("getUsersTransfers", "id", u);
        const U = "/users/{id}/transfers".replace("{id}", encodeURIComponent(String(u))), V = new URL(U, t.DUMMY_BASE_URL);
        let E;
        r && (E = r.baseOptions);
        const M = Object.assign(Object.assign({ method: "GET" }, E), g), I = {}, C = {};
        yield (0, t.setBearerAuthToObject)(I, r), d !== void 0 && (C.take = d), p !== void 0 && (C.skip = p), v !== void 0 && (C.fromId = v), P !== void 0 && (C.toId = P), b !== void 0 && (C.id = b), (0, t.setSearchParams)(V, C);
        let q = E && E.headers ? E.headers : {};
        return M.headers = Object.assign(Object.assign(Object.assign({}, I), q), g.headers), {
          url: (0, t.toPathString)(V),
          options: M
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
      updateUser: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        (0, t.assertParamExists)("updateUser", "id", e), (0, t.assertParamExists)("updateUser", "updateUserRequest", a);
        const n = "/users/{id}".replace("{id}", encodeURIComponent(String(e))), u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, t.serializeDataIfNeeded)(a, p, r), {
          url: (0, t.toPathString)(u),
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
      updateUserKey: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("updateUserKey", "id", i);
        const a = "/users/{id}/authenticator/key".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      updateUserLocalPassword: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        (0, t.assertParamExists)("updateUserLocalPassword", "id", e), (0, t.assertParamExists)("updateUserLocalPassword", "updateLocalRequest", a);
        const n = "/users/{id}/authenticator/local".replace("{id}", encodeURIComponent(String(e))), u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PUT" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, t.serializeDataIfNeeded)(a, p, r), {
          url: (0, t.toPathString)(u),
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
      updateUserNfc: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        (0, t.assertParamExists)("updateUserNfc", "id", e), (0, t.assertParamExists)("updateUserNfc", "updateNfcRequest", a);
        const n = "/users/{id}/authenticator/nfc".replace("{id}", encodeURIComponent(String(e))), u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PUT" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, t.serializeDataIfNeeded)(a, p, r), {
          url: (0, t.toPathString)(u),
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
      updateUserPin: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        (0, t.assertParamExists)("updateUserPin", "id", e), (0, t.assertParamExists)("updateUserPin", "updatePinRequest", a);
        const n = "/users/{id}/authenticator/pin".replace("{id}", encodeURIComponent(String(e))), u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PUT" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, t.serializeDataIfNeeded)(a, p, r), {
          url: (0, t.toPathString)(u),
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
      waiveUserFines: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("waiveUserFines", "id", i);
        const a = "/users/{id}/fines/waive".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
          options: u
        };
      })
    };
  };
  l.UsersApiAxiosParamCreator = $s;
  const Ws = function(r) {
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
          var e, a, s;
          const n = yield c.acceptTos(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["UsersApi.acceptTos"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.authenticateAs(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["UsersApi.authenticateAs"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.createUser(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["UsersApi.createUser"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.deleteUser(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["UsersApi.deleteUser"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.deleteUserKey(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["UsersApi.deleteUserKey"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.deleteUserNfc(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["UsersApi.deleteUserNfc"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      getAllUsers(o, i, e, a, s, n, u, d) {
        return h(this, void 0, void 0, function* () {
          var p, v, P;
          const b = yield c.getAllUsers(o, i, e, a, s, n, u, d), g = (p = r == null ? void 0 : r.serverIndex) !== null && p !== void 0 ? p : 0, U = (P = (v = A.operationServerMap["UsersApi.getAllUsers"]) === null || v === void 0 ? void 0 : v[g]) === null || P === void 0 ? void 0 : P.url;
          return (V, E) => (0, t.createRequestFunction)(b, O.default, A.BASE_PATH, r)(V, U || E);
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
      getAllUsersOfUserType(o, i, e, a) {
        return h(this, void 0, void 0, function* () {
          var s, n, u;
          const d = yield c.getAllUsersOfUserType(o, i, e, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, v = (u = (n = A.operationServerMap["UsersApi.getAllUsersOfUserType"]) === null || n === void 0 ? void 0 : n[p]) === null || u === void 0 ? void 0 : u.url;
          return (P, b) => (0, t.createRequestFunction)(d, O.default, A.BASE_PATH, r)(P, v || b);
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
          var e, a, s;
          const n = yield c.getIndividualUser(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["UsersApi.getIndividualUser"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      getOrganMembers(o, i, e, a) {
        return h(this, void 0, void 0, function* () {
          var s, n, u;
          const d = yield c.getOrganMembers(o, i, e, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, v = (u = (n = A.operationServerMap["UsersApi.getOrganMembers"]) === null || n === void 0 ? void 0 : n[p]) === null || u === void 0 ? void 0 : u.url;
          return (P, b) => (0, t.createRequestFunction)(d, O.default, A.BASE_PATH, r)(P, v || b);
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
          var e, a, s;
          const n = yield c.getUserAuthenticatable(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["UsersApi.getUserAuthenticatable"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
          var e, a, s;
          const n = yield c.getUserRoles(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["UsersApi.getUserRoles"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      getUsersContainers(o, i, e, a) {
        return h(this, void 0, void 0, function* () {
          var s, n, u;
          const d = yield c.getUsersContainers(o, i, e, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, v = (u = (n = A.operationServerMap["UsersApi.getUsersContainers"]) === null || n === void 0 ? void 0 : n[p]) === null || u === void 0 ? void 0 : u.url;
          return (P, b) => (0, t.createRequestFunction)(d, O.default, A.BASE_PATH, r)(P, v || b);
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
      getUsersFinancialMutations(o, i, e, a, s, n) {
        return h(this, void 0, void 0, function* () {
          var u, d, p;
          const v = yield c.getUsersFinancialMutations(o, i, e, a, s, n), P = (u = r == null ? void 0 : r.serverIndex) !== null && u !== void 0 ? u : 0, b = (p = (d = A.operationServerMap["UsersApi.getUsersFinancialMutations"]) === null || d === void 0 ? void 0 : d[P]) === null || p === void 0 ? void 0 : p.url;
          return (g, U) => (0, t.createRequestFunction)(v, O.default, A.BASE_PATH, r)(g, b || U);
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
      getUsersPointsOfSale(o, i, e, a) {
        return h(this, void 0, void 0, function* () {
          var s, n, u;
          const d = yield c.getUsersPointsOfSale(o, i, e, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, v = (u = (n = A.operationServerMap["UsersApi.getUsersPointsOfSale"]) === null || n === void 0 ? void 0 : n[p]) === null || u === void 0 ? void 0 : u.url;
          return (P, b) => (0, t.createRequestFunction)(d, O.default, A.BASE_PATH, r)(P, v || b);
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
          var e, a, s;
          const n = yield c.getUsersProcessingDeposits(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["UsersApi.getUsersProcessingDeposits"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      getUsersProducts(o, i, e, a) {
        return h(this, void 0, void 0, function* () {
          var s, n, u;
          const d = yield c.getUsersProducts(o, i, e, a), p = (s = r == null ? void 0 : r.serverIndex) !== null && s !== void 0 ? s : 0, v = (u = (n = A.operationServerMap["UsersApi.getUsersProducts"]) === null || n === void 0 ? void 0 : n[p]) === null || u === void 0 ? void 0 : u.url;
          return (P, b) => (0, t.createRequestFunction)(d, O.default, A.BASE_PATH, r)(P, v || b);
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
      getUsersTransactions(o, i, e, a, s, n, u, d, p, v, P) {
        return h(this, void 0, void 0, function* () {
          var b, g, U;
          const V = yield c.getUsersTransactions(o, i, e, a, s, n, u, d, p, v, P), E = (b = r == null ? void 0 : r.serverIndex) !== null && b !== void 0 ? b : 0, M = (U = (g = A.operationServerMap["UsersApi.getUsersTransactions"]) === null || g === void 0 ? void 0 : g[E]) === null || U === void 0 ? void 0 : U.url;
          return (I, C) => (0, t.createRequestFunction)(V, O.default, A.BASE_PATH, r)(I, M || C);
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
      getUsersTransactionsReport(o, i, e, a, s, n, u) {
        return h(this, void 0, void 0, function* () {
          var d, p, v;
          const P = yield c.getUsersTransactionsReport(o, i, e, a, s, n, u), b = (d = r == null ? void 0 : r.serverIndex) !== null && d !== void 0 ? d : 0, g = (v = (p = A.operationServerMap["UsersApi.getUsersTransactionsReport"]) === null || p === void 0 ? void 0 : p[b]) === null || v === void 0 ? void 0 : v.url;
          return (U, V) => (0, t.createRequestFunction)(P, O.default, A.BASE_PATH, r)(U, g || V);
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
      getUsersTransfers(o, i, e, a, s, n, u) {
        return h(this, void 0, void 0, function* () {
          var d, p, v;
          const P = yield c.getUsersTransfers(o, i, e, a, s, n, u), b = (d = r == null ? void 0 : r.serverIndex) !== null && d !== void 0 ? d : 0, g = (v = (p = A.operationServerMap["UsersApi.getUsersTransfers"]) === null || p === void 0 ? void 0 : p[b]) === null || v === void 0 ? void 0 : v.url;
          return (U, V) => (0, t.createRequestFunction)(P, O.default, A.BASE_PATH, r)(U, g || V);
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
      updateUser(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateUser(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["UsersApi.updateUser"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
          var e, a, s;
          const n = yield c.updateUserKey(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["UsersApi.updateUserKey"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      updateUserLocalPassword(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateUserLocalPassword(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["UsersApi.updateUserLocalPassword"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
      updateUserNfc(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateUserNfc(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["UsersApi.updateUserNfc"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
      updateUserPin(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateUserPin(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["UsersApi.updateUserPin"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
          var e, a, s;
          const n = yield c.waiveUserFines(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["UsersApi.waiveUserFines"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      }
    };
  };
  l.UsersApiFp = Ws;
  const zs = function(r, c, o) {
    const i = (0, l.UsersApiFp)(r);
    return {
      /**
       *
       * @summary Accept the Terms of Service if you have not accepted it yet
       * @param {AcceptTosRequest} acceptTosRequest \&quot;Tosrequest body\&quot;
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      acceptTos(e, a) {
        return i.acceptTos(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Authenticate as another user
       * @param {number} id The id of the user that should be authenticated as
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      authenticateAs(e, a) {
        return i.authenticateAs(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Create a new user
       * @param {CreateUserRequest} createUserRequest The user which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createUser(e, a) {
        return i.createUser(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Delete a single user
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUser(e, a) {
        return i.deleteUser(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Delete a users key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserKey(e, a) {
        return i.deleteUserKey(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Delete a nfc code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      deleteUserNfc(e, a) {
        return i.deleteUserNfc(e, a).then((s) => s(o, c));
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
      getAllUsers(e, a, s, n, u, d, p, v) {
        return i.getAllUsers(e, a, s, n, u, d, p, v).then((P) => P(o, c));
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
      getAllUsersOfUserType(e, a, s, n) {
        return i.getAllUsersOfUserType(e, a, s, n).then((u) => u(o, c));
      },
      /**
       *
       * @summary Get an individual user
       * @param {number} id userID
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getIndividualUser(e, a) {
        return i.getIndividualUser(e, a).then((s) => s(o, c));
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
      getOrganMembers(e, a, s, n) {
        return i.getOrganMembers(e, a, s, n).then((u) => u(o, c));
      },
      /**
       *
       * @summary Get all users that the user can authenticate as
       * @param {number} id The id of the user to get authentications of
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserAuthenticatable(e, a) {
        return i.getUserAuthenticatable(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Get all roles assigned to the user.
       * @param {number} id The id of the user to get the roles from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUserRoles(e, a) {
        return i.getUserRoles(e, a).then((s) => s(o, c));
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
      getUsersContainers(e, a, s, n) {
        return i.getUsersContainers(e, a, s, n).then((u) => u(o, c));
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
      getUsersFinancialMutations(e, a, s, n, u, d) {
        return i.getUsersFinancialMutations(e, a, s, n, u, d).then((p) => p(o, c));
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
      getUsersPointsOfSale(e, a, s, n) {
        return i.getUsersPointsOfSale(e, a, s, n).then((u) => u(o, c));
      },
      /**
       *
       * @summary Get all deposits of a user that are still being processed by Stripe
       * @param {number} id The id of the user to get the deposits from
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getUsersProcessingDeposits(e, a) {
        return i.getUsersProcessingDeposits(e, a).then((s) => s(o, c));
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
      getUsersProducts(e, a, s, n) {
        return i.getUsersProducts(e, a, s, n).then((u) => u(o, c));
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
      getUsersTransactions(e, a, s, n, u, d, p, v, P, b, g) {
        return i.getUsersTransactions(e, a, s, n, u, d, p, v, P, b, g).then((U) => U(o, c));
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
      getUsersTransactionsReport(e, a, s, n, u, d, p) {
        return i.getUsersTransactionsReport(e, a, s, n, u, d, p).then((v) => v(o, c));
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
      getUsersTransfers(e, a, s, n, u, d, p) {
        return i.getUsersTransfers(e, a, s, n, u, d, p).then((v) => v(o, c));
      },
      /**
       *
       * @summary Update a user
       * @param {number} id The id of the user
       * @param {UpdateUserRequest} updateUserRequest The user which should be updated
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUser(e, a, s) {
        return i.updateUser(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary POST an users update to new key code
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserKey(e, a) {
        return i.updateUserKey(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Put a user\'s local password
       * @param {number} id The id of the user
       * @param {UpdateLocalRequest} updateLocalRequest    The password update
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserLocalPassword(e, a, s) {
        return i.updateUserLocalPassword(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Put a users NFC code
       * @param {number} id The id of the user
       * @param {UpdateNfcRequest} updateNfcRequest    The NFC code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserNfc(e, a, s) {
        return i.updateUserNfc(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Put an users pin code
       * @param {number} id The id of the user
       * @param {UpdatePinRequest} updatePinRequest    The PIN code to update to
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateUserPin(e, a, s) {
        return i.updateUserPin(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Waive all given user\'s fines
       * @param {number} id The id of the user
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      waiveUserFines(e, a) {
        return i.waiveUserFines(e, a).then((s) => s(o, c));
      }
    };
  };
  l.UsersApiFactory = zs;
  class Ks extends A.BaseAPI {
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
    getAllUsers(c, o, i, e, a, s, n, u) {
      return (0, l.UsersApiFp)(this.configuration).getAllUsers(c, o, i, e, a, s, n, u).then((d) => d(this.axios, this.basePath));
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
    getAllUsersOfUserType(c, o, i, e) {
      return (0, l.UsersApiFp)(this.configuration).getAllUsersOfUserType(c, o, i, e).then((a) => a(this.axios, this.basePath));
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
    getOrganMembers(c, o, i, e) {
      return (0, l.UsersApiFp)(this.configuration).getOrganMembers(c, o, i, e).then((a) => a(this.axios, this.basePath));
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
    getUsersContainers(c, o, i, e) {
      return (0, l.UsersApiFp)(this.configuration).getUsersContainers(c, o, i, e).then((a) => a(this.axios, this.basePath));
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
    getUsersFinancialMutations(c, o, i, e, a, s) {
      return (0, l.UsersApiFp)(this.configuration).getUsersFinancialMutations(c, o, i, e, a, s).then((n) => n(this.axios, this.basePath));
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
    getUsersPointsOfSale(c, o, i, e) {
      return (0, l.UsersApiFp)(this.configuration).getUsersPointsOfSale(c, o, i, e).then((a) => a(this.axios, this.basePath));
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
    getUsersProducts(c, o, i, e) {
      return (0, l.UsersApiFp)(this.configuration).getUsersProducts(c, o, i, e).then((a) => a(this.axios, this.basePath));
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
    getUsersTransactions(c, o, i, e, a, s, n, u, d, p, v) {
      return (0, l.UsersApiFp)(this.configuration).getUsersTransactions(c, o, i, e, a, s, n, u, d, p, v).then((P) => P(this.axios, this.basePath));
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
    getUsersTransactionsReport(c, o, i, e, a, s, n) {
      return (0, l.UsersApiFp)(this.configuration).getUsersTransactionsReport(c, o, i, e, a, s, n).then((u) => u(this.axios, this.basePath));
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
    getUsersTransfers(c, o, i, e, a, s, n) {
      return (0, l.UsersApiFp)(this.configuration).getUsersTransfers(c, o, i, e, a, s, n).then((u) => u(this.axios, this.basePath));
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
      return (0, l.UsersApiFp)(this.configuration).updateUser(c, o, i).then((e) => e(this.axios, this.basePath));
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
      return (0, l.UsersApiFp)(this.configuration).updateUserLocalPassword(c, o, i).then((e) => e(this.axios, this.basePath));
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
      return (0, l.UsersApiFp)(this.configuration).updateUserNfc(c, o, i).then((e) => e(this.axios, this.basePath));
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
      return (0, l.UsersApiFp)(this.configuration).updateUserPin(c, o, i).then((e) => e(this.axios, this.basePath));
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
  l.UsersApi = Ks, l.GetAllUsersTypeEnum = {
    Member: "MEMBER",
    Organ: "ORGAN",
    Voucher: "VOUCHER",
    LocalUser: "LOCAL_USER",
    LocalAdmin: "LOCAL_ADMIN",
    Invoice: "INVOICE",
    AutomaticInvoice: "AUTOMATIC_INVOICE"
  };
  const Js = function(r) {
    return {
      /**
       *
       * @summary Create a new VAT group
       * @param {VatGroupRequest} vatGroupRequest The VAT group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVatGroup: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("createVatGroup", "vatGroupRequest", i);
        const a = "/vatgroups", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      getAllVatGroups: (c, o, i, e, a, s, ...n) => h(this, [c, o, i, e, a, s, ...n], void 0, function* (u, d, p, v, P, b, g = {}) {
        const U = "/vatgroups", V = new URL(U, t.DUMMY_BASE_URL);
        let E;
        r && (E = r.baseOptions);
        const M = Object.assign(Object.assign({ method: "GET" }, E), g), I = {}, C = {};
        yield (0, t.setBearerAuthToObject)(I, r), u !== void 0 && (C.vatGroupId = u), d !== void 0 && (C.name = d), p !== void 0 && (C.percentage = p), v !== void 0 && (C.deleted = v), P !== void 0 && (C.take = P), b !== void 0 && (C.skip = b), (0, t.setSearchParams)(V, C);
        let q = E && E.headers ? E.headers : {};
        return M.headers = Object.assign(Object.assign(Object.assign({}, I), q), g.headers), {
          url: (0, t.toPathString)(V),
          options: M
        };
      }),
      /**
       *
       * @summary Returns the requested VAT group
       * @param {number} id The ID of the VAT group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleVatGroup: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("getSingleVatGroup", "id", i);
        const a = "/vatgroups/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      getVatDeclarationAmounts: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        (0, t.assertParamExists)("getVatDeclarationAmounts", "year", e), (0, t.assertParamExists)("getVatDeclarationAmounts", "period", a);
        const n = "/vatgroups/declaration", u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), e !== void 0 && (P.year = e), a !== void 0 && (P.period = a), (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, t.toPathString)(u),
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
      updateVatGroup: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        (0, t.assertParamExists)("updateVatGroup", "id", e), (0, t.assertParamExists)("updateVatGroup", "updateVatGroupRequest", a);
        const n = "/vatgroups/{id}".replace("{id}", encodeURIComponent(String(e))), u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, t.serializeDataIfNeeded)(a, p, r), {
          url: (0, t.toPathString)(u),
          options: p
        };
      })
    };
  };
  l.VatGroupsApiAxiosParamCreator = Js;
  const Xs = function(r) {
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
          var e, a, s;
          const n = yield c.createVatGroup(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["VatGroupsApi.createVatGroup"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      getAllVatGroups(o, i, e, a, s, n, u) {
        return h(this, void 0, void 0, function* () {
          var d, p, v;
          const P = yield c.getAllVatGroups(o, i, e, a, s, n, u), b = (d = r == null ? void 0 : r.serverIndex) !== null && d !== void 0 ? d : 0, g = (v = (p = A.operationServerMap["VatGroupsApi.getAllVatGroups"]) === null || p === void 0 ? void 0 : p[b]) === null || v === void 0 ? void 0 : v.url;
          return (U, V) => (0, t.createRequestFunction)(P, O.default, A.BASE_PATH, r)(U, g || V);
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
          var e, a, s;
          const n = yield c.getSingleVatGroup(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["VatGroupsApi.getSingleVatGroup"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      getVatDeclarationAmounts(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getVatDeclarationAmounts(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["VatGroupsApi.getVatDeclarationAmounts"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
      updateVatGroup(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateVatGroup(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["VatGroupsApi.updateVatGroup"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      }
    };
  };
  l.VatGroupsApiFp = Xs;
  const Zs = function(r, c, o) {
    const i = (0, l.VatGroupsApiFp)(r);
    return {
      /**
       *
       * @summary Create a new VAT group
       * @param {VatGroupRequest} vatGroupRequest The VAT group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVatGroup(e, a) {
        return i.createVatGroup(e, a).then((s) => s(o, c));
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
      getAllVatGroups(e, a, s, n, u, d, p) {
        return i.getAllVatGroups(e, a, s, n, u, d, p).then((v) => v(o, c));
      },
      /**
       *
       * @summary Returns the requested VAT group
       * @param {number} id The ID of the VAT group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleVatGroup(e, a) {
        return i.getSingleVatGroup(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Get the VAT collections needed for VAT declarations
       * @param {number} year Calendar year for VAT declarations
       * @param {string} period Period for VAT declarations
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVatDeclarationAmounts(e, a, s) {
        return i.getVatDeclarationAmounts(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Create a new VAT group
       * @param {number} id The ID of the VAT group which should be updated
       * @param {UpdateVatGroupRequest} updateVatGroupRequest The VAT group information
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVatGroup(e, a, s) {
        return i.updateVatGroup(e, a, s).then((n) => n(o, c));
      }
    };
  };
  l.VatGroupsApiFactory = Zs;
  class ea extends A.BaseAPI {
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
    getAllVatGroups(c, o, i, e, a, s, n) {
      return (0, l.VatGroupsApiFp)(this.configuration).getAllVatGroups(c, o, i, e, a, s, n).then((u) => u(this.axios, this.basePath));
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
      return (0, l.VatGroupsApiFp)(this.configuration).getVatDeclarationAmounts(c, o, i).then((e) => e(this.axios, this.basePath));
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
      return (0, l.VatGroupsApiFp)(this.configuration).updateVatGroup(c, o, i).then((e) => e(this.axios, this.basePath));
    }
  }
  l.VatGroupsApi = ea;
  const ta = function(r) {
    return {
      /**
       *
       * @summary Creates a new voucher group
       * @param {VoucherGroupRequest} voucherGroupRequest The voucher group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVouchergroup: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("createVouchergroup", "voucherGroupRequest", i);
        const a = "/vouchergroups", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
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
      getAllVouchergroups: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        const n = "/vouchergroups", u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "GET" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), e !== void 0 && (P.take = e), a !== void 0 && (P.skip = a), (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), {
          url: (0, t.toPathString)(u),
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
      getVouchergroupId: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("getVouchergroupId", "id", i);
        const a = "/vouchergroups/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
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
      updateVoucherGroup: (c, o, ...i) => h(this, [c, o, ...i], void 0, function* (e, a, s = {}) {
        (0, t.assertParamExists)("updateVoucherGroup", "id", e), (0, t.assertParamExists)("updateVoucherGroup", "voucherGroupRequest", a);
        const n = "/vouchergroups/{id}".replace("{id}", encodeURIComponent(String(e))), u = new URL(n, t.DUMMY_BASE_URL);
        let d;
        r && (d = r.baseOptions);
        const p = Object.assign(Object.assign({ method: "PATCH" }, d), s), v = {}, P = {};
        yield (0, t.setBearerAuthToObject)(v, r), v["Content-Type"] = "application/json", (0, t.setSearchParams)(u, P);
        let b = d && d.headers ? d.headers : {};
        return p.headers = Object.assign(Object.assign(Object.assign({}, v), b), s.headers), p.data = (0, t.serializeDataIfNeeded)(a, p, r), {
          url: (0, t.toPathString)(u),
          options: p
        };
      })
    };
  };
  l.VouchergroupsApiAxiosParamCreator = ta;
  const sa = function(r) {
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
          var e, a, s;
          const n = yield c.createVouchergroup(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["VouchergroupsApi.createVouchergroup"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      getAllVouchergroups(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.getAllVouchergroups(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["VouchergroupsApi.getAllVouchergroups"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
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
          var e, a, s;
          const n = yield c.getVouchergroupId(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["VouchergroupsApi.getVouchergroupId"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
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
      updateVoucherGroup(o, i, e) {
        return h(this, void 0, void 0, function* () {
          var a, s, n;
          const u = yield c.updateVoucherGroup(o, i, e), d = (a = r == null ? void 0 : r.serverIndex) !== null && a !== void 0 ? a : 0, p = (n = (s = A.operationServerMap["VouchergroupsApi.updateVoucherGroup"]) === null || s === void 0 ? void 0 : s[d]) === null || n === void 0 ? void 0 : n.url;
          return (v, P) => (0, t.createRequestFunction)(u, O.default, A.BASE_PATH, r)(v, p || P);
        });
      }
    };
  };
  l.VouchergroupsApiFp = sa;
  const aa = function(r, c, o) {
    const i = (0, l.VouchergroupsApiFp)(r);
    return {
      /**
       *
       * @summary Creates a new voucher group
       * @param {VoucherGroupRequest} voucherGroupRequest The voucher group which should be created
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createVouchergroup(e, a) {
        return i.createVouchergroup(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Returns all existing voucher groups
       * @param {number} [take] How many voucher groups the endpoint should return
       * @param {number} [skip] How many voucher groups should be skipped (for pagination)
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllVouchergroups(e, a, s) {
        return i.getAllVouchergroups(e, a, s).then((n) => n(o, c));
      },
      /**
       *
       * @summary Returns the requested voucher group
       * @param {number} id The id of the voucher group which should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getVouchergroupId(e, a) {
        return i.getVouchergroupId(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Updates the requested voucher group
       * @param {number} id The id of the voucher group which should be updated
       * @param {VoucherGroupRequest} voucherGroupRequest The updated voucher group
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      updateVoucherGroup(e, a, s) {
        return i.updateVoucherGroup(e, a, s).then((n) => n(o, c));
      }
    };
  };
  l.VouchergroupsApiFactory = aa;
  class ra extends A.BaseAPI {
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
      return (0, l.VouchergroupsApiFp)(this.configuration).getAllVouchergroups(c, o, i).then((e) => e(this.axios, this.basePath));
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
      return (0, l.VouchergroupsApiFp)(this.configuration).updateVoucherGroup(c, o, i).then((e) => e(this.axios, this.basePath));
    }
  }
  l.VouchergroupsApi = ra;
  const na = function(r) {
    return {
      /**
       *
       * @summary Creates a new write-off in the system. Creating a write-off will also close and delete the user\'s account.
       * @param {WriteOffRequest} writeOffRequest New write off
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createWriteOff: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("createWriteOff", "writeOffRequest", i);
        const a = "/writeoffs", s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "POST" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), d["Content-Type"] = "application/json", (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), u.data = (0, t.serializeDataIfNeeded)(i, u, r), {
          url: (0, t.toPathString)(s),
          options: u
        };
      }),
      /**
       *
       * @summary Returns all write-offs in the system.
       * @param {number} [toId] Filter on Id of the debtor
       * @param {number} [amount] Filter on the amount of the write-off
       * @param {number} [take] Number of write-offs to return
       * @param {number} [skip] Number of write-offs to skip
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllWriteOffs: (c, o, i, e, ...a) => h(this, [c, o, i, e, ...a], void 0, function* (s, n, u, d, p = {}) {
        const v = "/writeoffs", P = new URL(v, t.DUMMY_BASE_URL);
        let b;
        r && (b = r.baseOptions);
        const g = Object.assign(Object.assign({ method: "GET" }, b), p), U = {}, V = {};
        yield (0, t.setBearerAuthToObject)(U, r), s !== void 0 && (V.toId = s), n !== void 0 && (V.amount = n), u !== void 0 && (V.take = u), d !== void 0 && (V.skip = d), (0, t.setSearchParams)(P, V);
        let E = b && b.headers ? b.headers : {};
        return g.headers = Object.assign(Object.assign(Object.assign({}, U), E), p.headers), {
          url: (0, t.toPathString)(P),
          options: g
        };
      }),
      /**
       *
       * @summary Get a single write-off
       * @param {number} id The ID of the write-off object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleWriteOff: (c, ...o) => h(this, [c, ...o], void 0, function* (i, e = {}) {
        (0, t.assertParamExists)("getSingleWriteOff", "id", i);
        const a = "/writeoffs/{id}".replace("{id}", encodeURIComponent(String(i))), s = new URL(a, t.DUMMY_BASE_URL);
        let n;
        r && (n = r.baseOptions);
        const u = Object.assign(Object.assign({ method: "GET" }, n), e), d = {}, p = {};
        yield (0, t.setBearerAuthToObject)(d, r), (0, t.setSearchParams)(s, p);
        let v = n && n.headers ? n.headers : {};
        return u.headers = Object.assign(Object.assign(Object.assign({}, d), v), e.headers), {
          url: (0, t.toPathString)(s),
          options: u
        };
      })
    };
  };
  l.WriteoffsApiAxiosParamCreator = na;
  const ia = function(r) {
    const c = (0, l.WriteoffsApiAxiosParamCreator)(r);
    return {
      /**
       *
       * @summary Creates a new write-off in the system. Creating a write-off will also close and delete the user\'s account.
       * @param {WriteOffRequest} writeOffRequest New write off
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createWriteOff(o, i) {
        return h(this, void 0, void 0, function* () {
          var e, a, s;
          const n = yield c.createWriteOff(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["WriteoffsApi.createWriteOff"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      },
      /**
       *
       * @summary Returns all write-offs in the system.
       * @param {number} [toId] Filter on Id of the debtor
       * @param {number} [amount] Filter on the amount of the write-off
       * @param {number} [take] Number of write-offs to return
       * @param {number} [skip] Number of write-offs to skip
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllWriteOffs(o, i, e, a, s) {
        return h(this, void 0, void 0, function* () {
          var n, u, d;
          const p = yield c.getAllWriteOffs(o, i, e, a, s), v = (n = r == null ? void 0 : r.serverIndex) !== null && n !== void 0 ? n : 0, P = (d = (u = A.operationServerMap["WriteoffsApi.getAllWriteOffs"]) === null || u === void 0 ? void 0 : u[v]) === null || d === void 0 ? void 0 : d.url;
          return (b, g) => (0, t.createRequestFunction)(p, O.default, A.BASE_PATH, r)(b, P || g);
        });
      },
      /**
       *
       * @summary Get a single write-off
       * @param {number} id The ID of the write-off object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleWriteOff(o, i) {
        return h(this, void 0, void 0, function* () {
          var e, a, s;
          const n = yield c.getSingleWriteOff(o, i), u = (e = r == null ? void 0 : r.serverIndex) !== null && e !== void 0 ? e : 0, d = (s = (a = A.operationServerMap["WriteoffsApi.getSingleWriteOff"]) === null || a === void 0 ? void 0 : a[u]) === null || s === void 0 ? void 0 : s.url;
          return (p, v) => (0, t.createRequestFunction)(n, O.default, A.BASE_PATH, r)(p, d || v);
        });
      }
    };
  };
  l.WriteoffsApiFp = ia;
  const oa = function(r, c, o) {
    const i = (0, l.WriteoffsApiFp)(r);
    return {
      /**
       *
       * @summary Creates a new write-off in the system. Creating a write-off will also close and delete the user\'s account.
       * @param {WriteOffRequest} writeOffRequest New write off
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      createWriteOff(e, a) {
        return i.createWriteOff(e, a).then((s) => s(o, c));
      },
      /**
       *
       * @summary Returns all write-offs in the system.
       * @param {number} [toId] Filter on Id of the debtor
       * @param {number} [amount] Filter on the amount of the write-off
       * @param {number} [take] Number of write-offs to return
       * @param {number} [skip] Number of write-offs to skip
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getAllWriteOffs(e, a, s, n, u) {
        return i.getAllWriteOffs(e, a, s, n, u).then((d) => d(o, c));
      },
      /**
       *
       * @summary Get a single write-off
       * @param {number} id The ID of the write-off object that should be returned
       * @param {*} [options] Override http request option.
       * @throws {RequiredError}
       */
      getSingleWriteOff(e, a) {
        return i.getSingleWriteOff(e, a).then((s) => s(o, c));
      }
    };
  };
  l.WriteoffsApiFactory = oa;
  class la extends A.BaseAPI {
    /**
     *
     * @summary Creates a new write-off in the system. Creating a write-off will also close and delete the user\'s account.
     * @param {WriteOffRequest} writeOffRequest New write off
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof WriteoffsApi
     */
    createWriteOff(c, o) {
      return (0, l.WriteoffsApiFp)(this.configuration).createWriteOff(c, o).then((i) => i(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns all write-offs in the system.
     * @param {number} [toId] Filter on Id of the debtor
     * @param {number} [amount] Filter on the amount of the write-off
     * @param {number} [take] Number of write-offs to return
     * @param {number} [skip] Number of write-offs to skip
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof WriteoffsApi
     */
    getAllWriteOffs(c, o, i, e, a) {
      return (0, l.WriteoffsApiFp)(this.configuration).getAllWriteOffs(c, o, i, e, a).then((s) => s(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get a single write-off
     * @param {number} id The ID of the write-off object that should be returned
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof WriteoffsApi
     */
    getSingleWriteOff(c, o) {
      return (0, l.WriteoffsApiFp)(this.configuration).getSingleWriteOff(c, o).then((i) => i(this.axios, this.basePath));
    }
  }
  l.WriteoffsApi = la;
})(Rt);
var xe = {};
Object.defineProperty(xe, "__esModule", { value: !0 });
xe.Configuration = void 0;
class Un {
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
xe.Configuration = Un;
(function(l) {
  var h = he && he.__createBinding || (Object.create ? function(t, A, m, S) {
    S === void 0 && (S = m);
    var j = Object.getOwnPropertyDescriptor(A, m);
    (!j || ("get" in j ? !A.__esModule : j.writable || j.configurable)) && (j = { enumerable: !0, get: function() {
      return A[m];
    } }), Object.defineProperty(t, S, j);
  } : function(t, A, m, S) {
    S === void 0 && (S = m), t[S] = A[m];
  }), O = he && he.__exportStar || function(t, A) {
    for (var m in t) m !== "default" && !Object.prototype.hasOwnProperty.call(A, m) && h(A, t, m);
  };
  Object.defineProperty(l, "__esModule", { value: !0 }), O(Rt, l), O(xe, l);
})(Q);
const K = $.create();
K.interceptors.response.use((l) => (Aa(l), l));
class Tn {
  constructor(h) {
    W(this, "_authenticateApi");
    W(this, "_balanceApi");
    W(this, "_debtorsApi");
    W(this, "_usersApi");
    W(this, "_posApi");
    W(this, "_categoryApi");
    W(this, "_transactionApi");
    W(this, "_bannerApi");
    W(this, "_rootApi");
    W(this, "_voucherGroupApi");
    W(this, "_containerApi");
    W(this, "_filesApi");
    W(this, "_invoicesApi");
    W(this, "_payoutsApi");
    W(this, "_productsApi");
    W(this, "_transfersApi");
    W(this, "_vatGroupsApi");
    W(this, "_stripeApi");
    W(this, "_rbacApi");
    W(this, "_openBannerApi");
    const O = new Q.Configuration({
      accessToken: () => Je().token
    });
    this._authenticateApi = new Q.AuthenticateApi(O, h, K), this._balanceApi = new Q.BalanceApi(O, h, K), this._debtorsApi = new Q.DebtorsApi(O, h, K), this._usersApi = new Q.UsersApi(O, h, K), this._posApi = new Q.PointofsaleApi(O, h, K), this._categoryApi = new Q.ProductCategoriesApi(O, h, K), this._transactionApi = new Q.TransactionsApi(O, h, K), this._bannerApi = new Q.BannersApi(O, h, K), this._openBannerApi = new Q.BannersApi(void 0, h, K), this._rootApi = new Q.RootApi(), this._voucherGroupApi = new Q.VouchergroupsApi(O, h, K), this._containerApi = new Q.ContainersApi(O, h, K), this._filesApi = new Q.FilesApi(O, h, K), this._invoicesApi = new Q.InvoicesApi(O, h, K), this._payoutsApi = new Q.PayoutRequestsApi(O, h, K), this._productsApi = new Q.ProductsApi(O, h, K), this._transfersApi = new Q.TransfersApi(O, h, K), this._vatGroupsApi = new Q.VatGroupsApi(O, h, K), this._stripeApi = new Q.StripeApi(O, h, K), this._rbacApi = new Q.RbacApi(O, h, K);
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
function Bn(l) {
  l.mask.addEventListener("click", function(h) {
    h.target === l.mask && l.close();
  });
}
export {
  Tn as ApiService,
  Bn as addListenerOnDialogueOverlay,
  Oa as clearTokenInStorage,
  it as fetchAllPages,
  Je as getTokenFromStorage,
  ma as isAuthenticated,
  ba as isTokenExpired,
  Pa as parseToken,
  Vn as populateStoresFromToken,
  Ut as setTokenInStorage,
  Aa as updateTokenIfNecessary,
  Sa as useAuthStore,
  gt as useUserStore
};
