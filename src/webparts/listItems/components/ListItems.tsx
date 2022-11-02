import * as React from 'react';
import styles from './ListItems.module.scss';
import { IListItemsProps } from './IListItemsProps';

export default class ListItems extends React.Component<IListItemsProps, {}> {
  constructor(props: IListItemsProps) {
    super(props);
  }

  public render(): JSX.Element {
    const {
      listNameLabel,
      itemNameLabel,
      columnNameLabel,
    } = this.props;

    return (
      <section className={`${styles.listItems} ''}`}>
        <div className={styles.welcome}>
          <img alt="" src={require('../assets/welcome-light.png')} className={styles.welcomeImage} />
          <div>List name: <strong>{listNameLabel}</strong></div>
          <div>Item name: <strong>{itemNameLabel}</strong></div>
          <div>Column name: <strong>{columnNameLabel}</strong></div>
        </div>
      </section>
    );
  }
}
