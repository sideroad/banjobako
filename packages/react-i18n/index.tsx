import React, { FC, useContext } from 'react';
import acceptLanguage from 'accept-language';
import serialize from 'serialize-javascript';

declare global {
  interface Window {
    __SIMPLE_I18N__: {
      resource: Resource;
      lang: string;
    };
  }
}

export interface Resource {
  [id: string]: string;
}

export interface Resources {
  [lang: string]: Resource;
}

export interface Headers {
  'accept-language': string;
  [lang: string]: string;
}

export interface I18n {
  t: (key: string) => string;
  resource: Resource;
  lang: string;
}

const resources: Resources = {};

let isLoaded = false;
const UNASSIGNED_TEXT = '_UNASSIGNED_';

const isServer: boolean = typeof window === 'undefined' ? true : false;
export function init({
  assignedLanguage,
  headers,
  locales = {},
  fallbackLanguage = 'en'
}: {
  assignedLanguage?: string;
  headers?: Headers;
  locales?: Resources;
  fallbackLanguage?: string;
}): I18n {
  if (!isServer) {
    // XXX: window.__SIMPLE_I18N__ could be passed validation of typescript on editor
    // But rollup-plugin-typescript2 throw issue even we use same configuration.
    // window['__SIMPLE_I18N__'] implementation is kind of hack to prevent the error
    const { resource, lang } = window['__SIMPLE_I18N__'];
    return {
      resource,
      t: (id: string) => {
        if (resource[id]) {
          return resource[id];
        } else {
          console.warn(`local text for [${id}] is not assigned.`);
          return UNASSIGNED_TEXT;
        }
      },
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
    const lang =
      acceptLanguage.get(assignedLanguage || headers['accept-language']) || '';
    const resource: Resource =
      resources[lang] || resources[fallbackLanguage] || {};
    return {
      resource: resource,
      t: (id: string) => {
        if (resource[id]) {
          return resource[id];
        } else {
          console.warn(`local text for [${id}] is not assigned.`);
          return UNASSIGNED_TEXT;
        }
      },
      lang: lang
    };
  }
  throw new Error(
    'Unexpected condition. headers is needed for SSR. In browser case, window.__SIMPLE_I18N__ object should be exists'
  );
}

interface I18nProps {
  id: string;
}

export const Context = React.createContext({
  t: (key: string) => key || UNASSIGNED_TEXT,
  resource: {},
  lang: ''
});

export const { Provider, Consumer } = Context;

const I18n: FC<I18nProps> = (props: I18nProps) => {
  const i18n: I18n = useContext(Context);
  return <>{i18n.t(props.id)}</>;
};

interface I18nRenderJSProps {
  assignedLanguage?: string;
  headers?: Headers;
  locales?: Resources;
  fallbackLanguage?: string;
}

export const I18nRenderJS: FC<I18nRenderJSProps> = (
  props: I18nRenderJSProps
) => {
  const i18n = init(props);
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.__SIMPLE_I18N__={resource: ${serialize(
          i18n.resource
        )}, lang: ${serialize(i18n.lang)}}`
      }}
    />
  );
};

export default I18n;
