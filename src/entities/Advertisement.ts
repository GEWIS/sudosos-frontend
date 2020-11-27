export interface Advertisement {
  id: number;
  picture: string;
  duration: number;
  active: boolean;
  startDate: Date;
  endDate: Date;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
