import UserTransformer from '@/transformers/UserTransformer';
import PaginationTransformer from '@/transformers/PaginationTransformer';
import APIHelper from '@/mixins/APIHelper';
import { Pagination } from '@/entities/Pagination';
import { BaseUser, User } from '@/entities/User';

export interface UpdateUserInfo {
  firstName: string,
  lastName: string,
  active: boolean,
  ofAge: boolean,
  email: string,
  deleted: boolean
}

export interface UserQueryParameters {
  take?: number,
  skip?: number,
  type?: string,
  search?: string,
}

export interface AcceptTosRequest {
  extensiveDataProcessing: boolean;
}

export interface CreateUserRequest {
  firstName: string,
  lastName: string,
  active: boolean,
  type: number,
  email: string
}

export interface PaginatedUserResponse {
  _pagination: Pagination,
  records: User[],
}

export function getUsers(queryParameters: UserQueryParameters = {})
  : Promise<PaginatedUserResponse> {
  const body = {
    ...queryParameters,
  };

  return APIHelper.getResource('users', body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    response.records = response.records.map(
      (user: any) => UserTransformer.makeUser(user),
    );

    return response;
  });
}

export function getAllUsers(): Promise<(User | BaseUser)[]> {
  return APIHelper.readPagination('users', 500).then((userResponses: any[]) => userResponses.map((u) => UserTransformer.makeUser(u)));
}

export function postUser(user: CreateUserRequest): Promise<User> {
  return APIHelper.postResource('users', user).then((response) => UserTransformer.makeUser(response) as User);
}

export function getUser(id: number): Promise<User | BaseUser> {
  return APIHelper.getResource(`users/${id}`).then((response) => UserTransformer.makeUser(response));
}

export function patchUser(id: number, user: Partial<UpdateUserInfo>) {
  return APIHelper.patchResource(`users/${id}`, user).then((response) => UserTransformer.makeUser(response));
}

export function deleteUser(id: number) {
  return APIHelper.delResource(`users/${id}`);
}

export function acceptToS(params: AcceptTosRequest): Promise<void> {
  return APIHelper.postResource('users/acceptTos', params);
}

export function requestPasswordReset(accountMail: string): Promise<void> {
  return APIHelper.postResource('authentication/local/reset', { accountMail });
}
