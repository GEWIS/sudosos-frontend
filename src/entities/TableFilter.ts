export interface TableFilter {
  selfBought: Boolean,
  putInByYou: Boolean,
  putInForYou: Boolean,
  hideHandled: Boolean,
  lastUpdate: String | null,
  fromDate: String,
  toDate: String,
}

export function initFilter(): TableFilter {
  return {
    selfBought: false,
    putInByYou: false,
    putInForYou: false,
    hideHandled: false,
    lastUpdate: null,
    fromDate: '',
    toDate: '',
  };
}
