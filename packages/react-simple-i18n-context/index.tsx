import React, { FC, useContext } from 'react';
import acceptLanguage from 'accept-language';
import serialize from 'serialize-javascript';

interface Resource {
  [id: string]: string;
}
interface Resources {
  [lang: string]: Resource;
}
interface Headers {
  [lang: string]: string;
}
interface I18n {
  t: (key: string) => string;
  resource: Resource;
  lang: string;
}
declare global {
  interface Window {
    __i18n: {
      resource: Resource;
      lang: string;
    };
  }
}
const resources: Resources = {
  en: {}
};

let isLoaded = false;

const isServer: boolean = typeof window === 'undefined' ? true : false;
export function init({
  headers,
  locales = {}
}: {
  headers: Headers;
  locales?: Resources;
}): I18n {
  if (!isServer && window.__i18n) {
    const { resource, lang } = window.__i18n;
    return {
      resource,
      t: (id: string) => resource[id],
      lang
    };
  } else if (!isLoaded) {
    Object.keys(locales).forEach(lang => {
      resources[lang] = locales[lang];
    });
    acceptLanguage.languages(Object.keys(locales));
    isLoaded = true;
  }
  if (headers) {
    const lang = acceptLanguage.get(headers['accept-language']) || '';
    const resource: Resource = resources[lang] || resources.en || {};

    return {
      resource: resource,
      t: (id: string) => resource[id],
      lang: lang
    };
  }
  throw new Error(
    'Unexpected condition. headers is needed for SSR. In browser case, window.__i18n object should be exists'
  );
}

interface I18nProps {
  id: string;
}

export const Context = React.createContext({
  t: (key: string) => key,
  resource: {},
  lang: 'en'
});

export const { Provider, Consumer } = Context;

const I18n: FC<I18nProps> = (props: I18nProps) => {
  const i18n: I18n = useContext(Context);
  return <>{i18n.t(props.id)}</>;
};

interface I18nRenderJSProps {
  headers: Headers;
  locales: Resources;
}

export const I18nRenderJS: FC<I18nRenderJSProps> = (
  props: I18nRenderJSProps
) => {
  const i18n = init(props);
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.__i18n={resource: ${serialize(
          i18n.resource
        )}, lang: ${serialize(i18n.lang)}}`
      }}
    />
  );
};

export default I18n;
