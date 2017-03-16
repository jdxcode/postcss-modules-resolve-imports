declare module 'css-selector-tokenizer' {
  declare class Tokenizer {
    parse: Function,
    stringify: Function,
    parseValues: Function,
    stringifyValues: Function,
  }

  declare module.exports: Tokenizer;
}
