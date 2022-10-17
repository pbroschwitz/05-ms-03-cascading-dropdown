// We need to tell TypeScript that when we write "import styles from './styles.scss' we mean to load a module (to look for a './styles.scss.d.ts').
// See https://xomino.com/2019/08/19/cannot-find-scss-module-error-enabling-sass-integration-with-your-sharepoint-framework-code/
declare module "*.scss" {
  const content: { [className: string]: string };
  export = content;
}