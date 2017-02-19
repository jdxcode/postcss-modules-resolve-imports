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
