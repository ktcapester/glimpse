import { CardList } from './card-list.model';

export class User {
  id: string;
  name: string;
  lists: Map<string, CardList>;
  activeList: string;

  constructor() {
    this.id = '';
    this.name = '';
    this.lists = new Map();
    this.activeList = ''; // active list ID
  }

  getList(listID: string) {
    return this.lists.get(listID);
  }

  getActiveList() {
    this.lists.get(this.activeList);
  }
}
