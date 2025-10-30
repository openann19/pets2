export interface Pet {
  _id: string;
  name: string;
  breed: string;
  age: number;
  bio: string;
  photos?: string[];
  uri?: string;
}
