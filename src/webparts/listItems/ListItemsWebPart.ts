import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  IPropertyPaneDropdownOption
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { update } from '@microsoft/sp-lodash-subset';
import * as strings from 'ListItemsWebPartStrings';
import ListItems from './components/ListItems';
import { IListItemsProps } from './components/IListItemsProps';
import { sp } from "@pnp/sp";
import { useList } from "../../hooks/useLists";

const { getLists, getItems, getColumns } = useList() ;

export interface IListItemsWebPartProps {
  listNameId: string;
  listNameLabel: string;
  itemNameId: string;
  itemNameLabel: string;
  columnNameId: string;
  columnNameLabel: string;
  errorMessage: string;
}
export default class ListItemsWebPart extends BaseClientSideWebPart<IListItemsWebPartProps> {
  private lists: IPropertyPaneDropdownOption[];
  private items: IPropertyPaneDropdownOption[];
  private columns: IPropertyPaneDropdownOption[];
  private errorMessage: string;
  private columns: IPropertyPaneDropdownOption[];

  public render(): void {
    const element: React.ReactElement<IListItemsProps> = React.createElement(ListItems, {
      listNameId: this.properties.listNameId,
      listNameLabel: this.properties.listNameLabel,
      itemNameId: this.properties.itemNameId,
      itemNameLabel: this.properties.itemNameLabel,
      columnNameId: this.properties.columnNameId,
      columnNameLabel: this.properties.columnNameLabel,
    });
    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    // eslint-disable-next-line no-void
    return super.onInit().then(async _ => {
      sp.setup({
        spfxContext: this.context
      });
    });
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  private async loadLists(newValue: any): Promise<IPropertyPaneDropdownOption[]> {
    try {
      const lists = [];  
      const _lists: any = await getLists(newValue);
      
      for (const _list of _lists) {
        lists.push({ key: _list.Id, text: _list.Title });
        console.log('_list.Title %s, _list.Id %s', _list.Title, _list.Id)
      }
      
      return lists;
    } catch (error) {
      this.errorMessage =  `${error.message} -  please check if site url if valid.` ;
      this.context.propertyPane.refresh();
    }
  }

  private async getAllItems(newValue: string): Promise<IPropertyPaneDropdownOption[]> {
    try {
      const items = [];
      const _items: any = await getItems(newValue);

      for (const _list of _items) {
        items.push({ key: _list.Id, text: _list.Title });
      }
      
      return items;
    } catch (error) {
      console.log('[LIWP69] error :>>', error);
      return [];
    }
  }

  private async getAllColumns(newList: any): Promise<IPropertyPaneDropdownOption[]> {
    try {
      const columns = [];  
      const _columns: any = await getColumns(newList);

      for (const _list of _columns) {
        columns.push({ key: _list.Id, text: _list.Title });
        console.log('_list.Title %s, _list.Id %s', _list.Title, _list.Id)
      }
      
      return columns;
    } catch (error) {
      return [];
    }
  }

  private loadLists(): Promise<IPropertyPaneDropdownOption[]> {
    return this.getAllLists(this.properties.listNameId);
  }

  private loadItems(listId: string): Promise<IPropertyPaneDropdownOption[]> {
    return this.getAllItems(listId);
  }

  private loadColumns(listId: string): Promise<IPropertyPaneDropdownOption[]> {
    return this.getAllColumns(listId);
  }

  protected getTextByKey(key: string): string {
    return this.lists
      .filter((item) => item.key === key)
      .map((item) => item.text)[0]
  }

  protected onPropertyPaneConfigurationStart(): void {
    // eslint-disable-next-line no-void
    void this
      .loadLists(this.properties.listName)
      .then((listOptions: IPropertyPaneDropdownOption[]): void => {
        this.lists = listOptions;
        this.context.propertyPane.refresh();
      })
  }

  protected onPropertyPaneFieldChanged(
    propertyPath: string, 
    oldValue: unknown, 
    newValue: unknown
  ): void {
    if (typeof newValue !== 'string') { return }
    super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);

    if (propertyPath === 'listName') {
      //
      // Lists
      //
      const selectedList = this.lists.filter((list: IPropertyPaneDropdownOption) => list.key === newValue)[0]
      update(this.properties, 'listNameLabel', (): unknown => selectedList.text);

      //
      // Items
      //
      this.items = undefined;
      
      // eslint-disable-next-line no-void
      void this.loadItems(newValue)
      .then((itemOptions: IPropertyPaneDropdownOption[]): void => {
          this.items = itemOptions;
          this.context.propertyPane.refresh();
          this.render();
        })
      // Store new value in web part properties (using lodash update)
      update(this.properties, 'itemNameLabel', (): unknown => newValue);

      // 
      // Columns
      //
      this.columns = undefined;
      // eslint-disable-next-line no-void
      void this.loadColumns(newValue)
        .then((columnOptions: IPropertyPaneDropdownOption[]): void => {
          this.columns = columnOptions;
          this.context.propertyPane.refresh();
          this.render();
        })
      // Store new value in web part properties (using lodash update)
      update(this.properties, 'columnsNameLabel', (): unknown => newValue);
    }
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    console.log('getPropertyPaneConfiguration');
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneDropdown('listName', {
                  label: strings.ListNameFieldLabel,
                  options: this.lists,
                  disabled: !this.lists || this.lists.length === 0,
                  selectedKey: this.properties.listNameId,
                }),
                PropertyPaneDropdown('itemName', {  
                  label: strings.ItemNameFieldLabel,
                  options: this.items,
                  disabled: !this.items || this.items.length === 0,
                  selectedKey: this.properties.itemNameId,
                }),
                PropertyPaneDropdown('columnName', {  
                  label: strings.ColumnNameFieldLabel,
                  options: this.columns,
                  disabled: !this.columns || this.columns.length === 0,
                  selectedKey: this.properties.columnNameId,
                })
              ]
            }
          ]
        }
      ]
    };
  }
  
}
