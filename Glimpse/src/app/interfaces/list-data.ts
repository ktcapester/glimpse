export interface ListData {
  list: ListItem[];
  currentTotal: number;
}

export interface ListItem {
  id: string;
  name: string;
  price: number;
  count: number;
}
