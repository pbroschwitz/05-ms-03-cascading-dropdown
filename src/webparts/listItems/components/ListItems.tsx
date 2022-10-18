import * as React from 'react';
import styles from './ListItems.module.scss';
import { IListItemsProps } from './IListItemsProps';

export default class ListItems extends React.Component<IListItemsProps, {}> {
  public render(): JSX.Element {
    const {
      listName,
      itemName
    } = this.props;

    return (
      <section className={`${styles.listItems} ''}`}>
        <div className={styles.welcome}>
          <img alt="" src={require('../assets/welcome-light.png')} className={styles.welcomeImage} />
          <div>List name: <strong>{escape(listName)}</strong></div>
          <div>Item name: <strong>{escape(itemName)}</strong></div>
        </div>
      </section>
    );
  }
}
