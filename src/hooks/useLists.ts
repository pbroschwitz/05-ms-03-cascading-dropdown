// SEE https://github.com/pnp/sp-dev-fx-webparts/blob/23760ec883ef04ac27b0c3c2eb01d52cd60fec56/samples/react-list-items-menu/src/webparts/listItemsMenu/ListItemsMenuWebPart.ts
import { sp } from "@pnp/sp";
import { reject } from "lodash";
// REVISIT 
//import { IListInfo } from "@pnp/sp/lists";
export const useList = () => {

  // Get Lists
  const getLists = async (baseTemplate: number): Promise<unknown[]> => {
    let _filter = "Hidden eq false and ";
    if (baseTemplate === 0) {
      _filter = _filter + " BaseType ne 1";
    } 
    else {
      _filter = _filter + " BaseType eq 1";
    }

    const _lists: unknown[] = await sp.web.lists.get();
    //const _lists: IListInfo[] = await sp.web.lists.filter(_filter).get();

    return _lists;
  };

  const getItems = async (listId: string): Promise<unknown[]> => {
    const _items: unknown[] = await sp
      .web
      .lists
      .getById(listId)
      .items
      .getAll();

    return _items;
  };

  
  const getColumns = async (listId: string): Promise<unknown[]> => {
    const _columns: unknown[] = await sp
      .web
      .lists
      .getById(listId)
      .fields
      .filter(`InternalName eq 'Title' or InternalName eq 'Letter'`)
      //.select('Title', 'Letter')
      .get();
    
    return _columns;
  };

  return {
    getLists,
    getItems,
    getColumns,
  };
};
