# schemcat

Nástroj pro kresbu diagramů schématických kategorií.

## Instalace

Je potřeba mít správce balíků kompatibilní s npm registrem ([npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)/[yarn](https://yarnpkg.com/)/[pnpm](https://pnpm.io/)...).
V čase psaní doporučujeme pnpm.

Poté ve složce projektu spustit:

```bash
pnpm install
```

## Vývoj

Hot-reload pro vývoj:

```bash
pnpm dev
```

## Sestavení

```bash
pnpm build
```

poté lze výstup ve složce `./dist/` distribuovat pomocí libovolného statického serveru, např.

```bash
# pnpx je součástí pnpm
pnpx http-server .
```

Statický server musí podporovat (v konfiguraci nebo jako výchozí) korektní MIME headers v HTTP odpovědích pro odpovídající přípony souborů.
Například `python -m http.server` *nepodporuje* MIME headers jako výchozí, ale lze ho nakonfigurovat.

Pro sestavení projekt používá build-tool [Vite](https://vitejs.dev/).
Ten ve výchozím nastavení cílí pouze na [moderní webové prohlížeče](https://caniuse.com/es6-module).
Existuje však plugin pro zacílení starších prohlížečů [@vitejs/plugin-legacy](https://www.npmjs.com/package/@vitejs/plugin-legacy).
Potřebné prohlížeče lze specifikovat položkou [browserslist](https://browsersl.ist/) v souboru `package.json`.
