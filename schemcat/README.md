# schemcat

Nástroj pro kresbu diagramů schématických kategorií.

## Vývoj

Hot-reload pro vývoj:

```bash
pnpm dev
```

## Sestavení

```bash
pnpm build
```

poté lze výstup ve složce `./dist/` distribuovat pomocí libovolného statického serveru,
např.

```bash
pnpx http-server .
```

Pro sestavení projekt používá build-tool [Vite](https://vitejs.dev/).
Ten ve výchozím nastavení cílí pouze na [moderní webové prohlížeče](https://caniuse.com/es6-module).
Existuje však plugin pro zacílení starších prohlížečů [@vitejs/plugin-legacy](https://www.npmjs.com/package/@vitejs/plugin-legacy).
Potřebné prohlížeče lze specifikovat položkou [browserslist](https://browsersl.ist/) v souboru `package.json`.
