declare module 'postcss' {
  declare class Comment {}
  declare class Declaration {}
  declare class Processor {}
  declare class Result {}
  declare class Warning {}

  declare class Container {
    append: Function;
    prepend: Function;
    walk(callback: (node: Object) => false | void): void;
    walkAtRules(name?: string | RegExp, callback: (rule: AtRule) => false | void): void;
    walkComments(callback: (comment: Comment) => false | void) : void;
    walkDecls(prop?: string | RegExp, callback: (decl: Declaration) => false | void): void;
    walkRules(selector?: string | RegExp, callback: (rule: Rule) => false | void): void;
  }
  declare class AtRule extends Container {}
  declare class Root extends Container {}
  declare class Rule extends Container {}

  declare class Plugin {}
  declare function pluginFunction(root: Root, result: Result): void;
  declare function plugin(name: string, initializer: (opts: Object) => pluginFunction): Plugin;

  declare class Postcss {
    (plugins: Array<plugin | Plugin>): Object;

    plugin(): plugin;
    parse(): Function;
    stringify(): Function;

    atRule(): AtRule;
    comment(): Object;
    decl(): Declaration;
    root(): Root;
    rule(): Rule;
  }

  declare module.exports: Postcss;
}
