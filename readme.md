postcss-modules-resolve-imports
===============================

Transforms:

```css
:import("library/button.css") {
  button: __tmp_487387465fczSDGHSABb;
}

:local(.continueButton) {
  composes: __tmp_487387465fczSDGHSABb;
  color: green;
}
```

into:

```css
???
```


postcss-modules-scope


:import("./file.css") {
  imported_otherClass: otherClass;
}
:local(.exportName) {
  composes: imported_otherClass;
  color: green;
}


to


:import("./file.css") {
  imported_otherClass: otherClass;
}
._lib_extender__exportName {
  color: green;
}
:export {
  exportName: _lib_extender__exportName imported_otherClass;
}


the common parts

depsExtractor:

-> ast, result (opts, processor)
<- ast.exports


## Options

`resolve` `object`

`resolve.alias` `object`

```javascript
{dash: path.resolve(__dirname, 'lib/dash')}
```

`resolve.extensions` `array`

```javascript
['.css']
```

`resolve.modules` `array`

```javascript
[]
```


## Reference Guides

- Interoperable CSS: https://github.com/css-modules/icss
- https://en.wikipedia.org/wiki/Topological_sorting
- https://nodejs.org/dist/latest-v6.x/docs/api/modules.html#modules_all_together
- http://api.postcss.org/AtRule.html#walkRules
