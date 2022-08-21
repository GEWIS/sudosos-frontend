import APIHelper from '@/mixins/APIHelper';

export function postFile(file: any) {
  return APIHelper.postResource('files', file).then((response) => (response));
}

export function getFile(id: number) {
  return APIHelper.getResource(`files/${id}`).then((response) => (response));
}

export function deleteFile(id: number) {
  return APIHelper.delResource(`files/${id}`);
}
