import React, { FC, useContext } from 'react';
import acceptLanguage from 'accept-language';

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
  if (!isServer) {
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
    'Unexpected condition. req is needed for SSR, otherwise window object should be exists'
  );
}

interface Props {
  id: string;
}

export const Context = React.createContext({
  t: (key: string) => key,
  resource: {},
  lang: 'en'
});

export const { Provider, Consumer } = Context;

const I18n: FC<Props> = (props: Props) => {
  const i18n: I18n = useContext(Context);
  return <>{i18n.t(props.id)}</>;
};

export default I18n;
