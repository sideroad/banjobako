import React, { FC, useContext } from 'react';
import renderer from 'react-test-renderer';
import I18n, { Context, Provider, init, I18nRenderJS } from '../index';

const TestComponent: FC<{}> = () => {
  const i18n = useContext(Context);
  return <>{i18n.t('hello')}</>;
};

test('Render I18n with using locales', () => {
  const headers = {
    'accept-language': 'en'
  };
  const locales = {
    en: {
      hello: 'Hello'
    },
    ja: {
      hello: 'こんにちは'
    }
  };
  window.__SIMPLE_I18N__ = { resource: locales.en, lang: 'en' };

  const i18n = init({
    headers,
    locales
  });
  expect(
    renderer
      .create(
        <Provider value={i18n}>
          <I18n id="hello" />
        </Provider>
      )
      .toJSON()
  ).toMatchSnapshot();

  expect(
    renderer
      .create(
        <Provider value={i18n}>
          <TestComponent />
        </Provider>
      )
      .toJSON()
  ).toMatchSnapshot();

  expect(
    renderer
      .create(<I18nRenderJS headers={headers} locales={locales} />)
      .toJSON()
  ).toMatchSnapshot();
});
