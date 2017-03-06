postcss-modules-resolve-imports
===============================


Transforms:

```css
:import("library/button.css") {
  i__imported_button_0: button;
}
._source_continueButton {
  color: green;
}
```

into:

```css
:export {
  continueButton: _source_continueButton _button_button
}
._button_button {
  /*common button styles*/
}
._source_continueButton {
  color: green
}
```


## Options

`explicitExports` `boolean`

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
