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

const { getLists, getItems } = useList() ;

export interface IListItemsWebPartProps {
  listName: string;
  itemName: string;
}
export default class ListItemsWebPart extends BaseClientSideWebPart<IListItemsWebPartProps> {
  private lists: IPropertyPaneDropdownOption[];
  private items: IPropertyPaneDropdownOption[];

  public render(): void {
    const element: React.ReactElement<IListItemsProps> = React.createElement(ListItems, {
      listName: this.properties.listName,
      itemName: this.properties.itemName
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

  private async getAllLists(newValue: any): Promise<IPropertyPaneDropdownOption[]> {
    try {
      const lists = [];  
      const _lists: any = await getLists(newValue);
      
      for (const _list of _lists) {
        lists.push({ key: _list.Id, text: _list.Title });
        console.log('_list.Title %s, _list.Id %s', _list.Title, _list.Id)
      }
      return lists;
    } catch (error) {
      console.log('[LIWP69] error :>>', error);
      return [];
    }
  }

  private async getAllItems(newValue: any): Promise<IPropertyPaneDropdownOption[]> {
    try {
      const items = [];  
      const _items: any = await getItems(newValue);

      for (const _list of _items) {
        items.push({ key: _list.Id, text: _list.Title });
        console.log('_list.Title %s, _list.Id %s', _list.Title, _list.Id)
      }
      
      return items;
    } catch (error) {
      console.log('[LIWP69] error :>>', error);
      return [];
    }
  }

  private loadLists(): Promise<IPropertyPaneDropdownOption[]> {
    return this.getAllLists(this.properties.listName);
  }

  private loadItems(listName: string): Promise<IPropertyPaneDropdownOption[]> {
    return this.getAllItems(this.properties.listName);
  }

  protected onPropertyPaneConfigurationStart(): void {
    console.log('onPropertyPaneConfigurationStart');
    
    // eslint-disable-next-line no-void
    void this
      .loadLists()
      .then((listOptions: IPropertyPaneDropdownOption[]): void => {
        this.lists = listOptions;
        this.context.propertyPane.refresh();
      })
    
    if (this.properties.listName) {
      // eslint-disable-next-line no-void
      void this
        .loadItems(this.properties.listName)
        .then((itemOptions: IPropertyPaneDropdownOption[]): void => {
          this.items = itemOptions;
          this.context.propertyPane.refresh();
          this.render();
        })
    }
  }

  protected onPropertyPaneFieldChanged(
    propertyPath: string, 
    oldValue: unknown, 
    newValue: unknown
  ): void {
    console.log('onPropertyPaneFieldChanged');

    super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);

    if (
      propertyPath === 'listName' && 
      typeof newValue === 'string'
    ) {
      this.items = undefined;
      // eslint-disable-next-line no-void
      void this.loadItems(newValue)
        .then((itemOptions: IPropertyPaneDropdownOption[]): void => {
          this.items = itemOptions;
          this.context.propertyPane.refresh();
          this.render();
        })
      // Store new value in web part properties (using lodash update)
      update(this.properties, propertyPath, (): unknown => newValue);
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
                  selectedKey: this.properties.listName,
                }),
                PropertyPaneDropdown('itemName', {  
                  label: strings.ItemNameFieldLabel,
                  options: this.items,
                  disabled: !this.items || this.items.length === 0,
                  selectedKey: this.properties.itemName,
                })
              ]
            }
          ]
        }
      ]
    };
  }
  
}
