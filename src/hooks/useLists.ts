// SEE https://github.com/pnp/sp-dev-fx-webparts/blob/23760ec883ef04ac27b0c3c2eb01d52cd60fec56/samples/react-list-items-menu/src/webparts/listItemsMenu/ListItemsMenuWebPart.ts

// import "@pnp/sp/fields";
// import "@pnp/sp/items";
//import "@pnp/sp/lists";
// import "@pnp/sp/webs";

import { sp } from "@pnp/sp";
//import { IListInfo } from "@pnp/sp/lists";
export const useList = () => {
  // Run on useList hook
  // eslint-disable-next-line no-void, @typescript-eslint/no-floating-promises, @typescript-eslint/no-empty-function
  //(async () => {})();

  // Get Lists
  const getLists = async (baseTemplate: number): Promise<unknown[]> => {
    let _filter: string = "Hidden eq false and ";
    if (baseTemplate === 0) {
      _filter = _filter + " BaseType ne 1";
    } else {
      _filter = _filter + " BaseType eq 1";
    }
    const _lists: unknown[] = await sp.web.lists.filter(_filter).get();
    //const _lists: IListInfo[] = await sp.web.lists.filter(_filter).get();

    console.log("lists", _lists);
    return _lists;
  };

  return {
    getLists,
  };
};
