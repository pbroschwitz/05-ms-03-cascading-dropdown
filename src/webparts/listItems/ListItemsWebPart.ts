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
import { spfi, SPFx } from "@pnp/sp";
import { getSP } from './pnpjsConfig';
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
    void super.onInit();
    getSP(this.context)
    
    // const sp = spfi().using(SPFx(this.context));
    // console.log(sp);

    // // get all the items from a list
    // const items = await sp.web.lists.getByTitle("FAQTest").items.getAll();
    // console.log('items :>> ', items);
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
      }, 1000);
    });
  }

  private loadItems(listName: string): Promise<IPropertyPaneDropdownOption[]> {
    console.log('loadItems');

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
      }, 1000);
    });
  }

  protected onPropertyPaneConfigurationStart(): void {
    console.log('onPropertyPaneConfigurationStart');
    
    // eslint-disable-next-line no-void
    void this.loadLists()
      .then((listOptions: IPropertyPaneDropdownOption[]): void => {
        this.lists = listOptions;
        this.context.propertyPane.refresh();
      })
    
    if (this.properties.listName) {
      // eslint-disable-next-line no-void
      void this.loadItems(this.properties.listName)
        .then((itemOptions: IPropertyPaneDropdownOption[]): void => {
          this.items = itemOptions;
          this.context.propertyPane.refresh();
          this.render();
        })
    }
  }

  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: unknown, newValue: unknown): void {
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
