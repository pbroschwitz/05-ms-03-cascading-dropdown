import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  IPropertyPaneDropdownOption
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
// import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'ListItemsWebPartStrings';
import ListItems from './components/ListItems';
import { IListItemsProps } from './components/IListItemsProps';
import ListItems from '../../../lib/webparts/listItems/components/ListItems';

export interface IListItemsWebPartProps {
  listName: string;
  itemName: string;
}

export default class ListItemsWebPart extends BaseClientSideWebPart<IListItemsWebPartProps> {
  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';
  private listsDropdownDisabled: boolean = true;
  private itemsDropdownDisabled: boolean = true;
  private lists: IPropertyPaneDropdownOption[];
  private items: IPropertyPaneDropdownOption[];

  public render(): void {
    const element: React.ReactElement<IListItemsProps> = React.createElement(ListItems, {
      listName: this.properties.listName,
      itemName: this.properties.itemName
    });

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    return super.onInit();
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  private loadLists(): Promise<IPropertyPaneDropdownOption[]> {
    return new Promise<IPropertyPaneDropdownOption[]>((
        resolve: (options: IPropertyPaneDropdownOption[]) => void,
        reject: (error: unknown) => void
      ) => {
      setTimeout((): void => {
        resolve([{
          key: 'sharedDocuments',
          text: 'Shared Documents'
        },
        {
          key: 'myDocuments',
          text: 'My Documents'
        }]);
      }, 2000);
    });
  }

  private loadItems(listName: string): Promise<IPropertyPaneDropdownOption[]> {
    // if (!this.properties.listName) {
    //   // resolve to empty options since no list has been selected
    //   return new Promise<IPropertyPaneDropdownOption[]>((
    //     resolve: (options: IPropertyPaneDropdownOption[]) => void): void => {
    //       resolve([]);
    //   });
    // }

    // if (!this.properties.listName) {
    //   // resolve to empty options since no list has been selected
    //   return Promise.resolve();
    // }


    return new Promise<IPropertyPaneDropdownOption[]>((
      resolve: (options: IPropertyPaneDropdownOption[]) => void, 
      reject: (error: unknown) => void
    ) => {
      setTimeout(() => {
        const items = {
          sharedDocuments: [
            {
              key: 'spfx_presentation.pptx',
              text: 'SPFx for the masses'
            },
            {
              key: 'hello-world.spapp',
              text: 'hello-world.spapp'
            }
          ],
          myDocuments: [
            {
              key: 'isaiah_cv.docx',
              text: 'Isaiah CV'
            },
            {
              key: 'isaiah_expenses.xlsx',
              text: 'Isaiah Expenses'
            }
          ]
        } as {
          [key: string]: IPropertyPaneDropdownOption[];
        };
        
        resolve(items[listName]);
        debugger
      }, 2000);
    });
  }

  protected onPropertyPaneConfigurationStart(): void {
    // this.listsDropdownDisabled = !this.lists;
    // this.itemsDropdownDisabled = !this.properties.listName || !this.items;

    // if (this.lists) {
    //   return;
    // }

    this.context.statusRenderer.displayLoadingIndicator(this.domElement, 'lists');
    
    // eslint-disable-next-line no-void
    void this.loadLists()
      .then((listOptions: IPropertyPaneDropdownOption[]): void => {
        this.lists = listOptions;
        // void this.loadItems(this.properties.listName)
        this.context.propertyPane.refresh();
        this.context.statusRenderer.clearLoadingIndicator(this.domElement);
        //this.render();
      })
      //.then((itemOptions: IPropertyPaneDropdownOption): void => {
      // .then((itemOptions): void => {
      //   debugger
      //   this.items = itemOptions;
      //   this.context.propertyPane.refresh();
      //   this.context.statusRenderer.clearLoadingIndicator(this.domElement);
      //   this.render();
      // });
  }

  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {
    super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
    if (propertyPath === 'listName') {
      // TODO Check the newValue 
      // eslint-disable-next-line no-void
      void this.loadItems(newValue)
        .then((itemOptions: IPropertyPaneDropdownOption[]): void => {
          this.items = itemOptions;
        })
      // TODO lodash update
      this.properties.listName = newValue;
    }
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
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
                  disabled: !this.lists || this.lists.length === 0
                }),
                PropertyPaneDropdown('itemName', {  
                  label: strings.ItemNameFieldLabel,
                  options: this.lists,
                  disabled: this.itemsDropdownDisabled
                })
              ]
            }
          ]
        }
      ]
    };
  }
  
}
