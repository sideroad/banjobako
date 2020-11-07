# How to use in next.js 10?

## Initialize i18n 
_app.tsx

```
import { init, Provider } from '@sideroad/react-i18n';

...

render() {
  const i18n = init({
    lang: this.props.router.locale,
    locales,
  });

  return (
    <Provider value={i18n}>
      ...
    </Provider>
  );
}
```

## Usage

```
import I18n from '@sideroad/react-i18n';

const Component = () => <I18n id="hello" />;
```


# LICENSE
MIT