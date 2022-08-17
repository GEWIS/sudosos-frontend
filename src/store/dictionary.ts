export interface Dictionary<T> {
  [id: number]: T
}

export function getItems<T>(dictionary: Dictionary<T>): T[] {
  return Object.keys(dictionary)
    .map((key, index) => dictionary[Number(key)]);
}
