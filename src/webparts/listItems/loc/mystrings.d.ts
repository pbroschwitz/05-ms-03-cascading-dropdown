declare interface IListItemsWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  ListNameFieldLabel: string;
  ItemNameFieldLabel: string;
  ColumnNameFieldLabel: string;
}

declare module 'ListItemsWebPartStrings' {
  const strings: IListItemsWebPartStrings;
  export = strings;
}
