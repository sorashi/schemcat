# Text bakalářské práce

- `make all` pro vysázení, je potřeba distirbuce LaTeXu, a program [vlna](https://petr.olsak.net/ftp/olsak/vlna/),
- `make validate` pro lokální validaci PDF/A, je potřeba [podman](https://podman.io/),
- `make diagrams` pro export UML diagramů do PDF, je potřeba [StarUML](https://staruml.io/) a [Inkscape](https://inkscape.org/)
  - toto je nutné udělat manuálně vždy, když je upraven soubor [Diagrams.mdj](../img/diagrams/Diagrams.mdj),
  - výsledné PDF soubory dát do version control,
- `make ermodel` pro export PDF obrázků, je potřeba Python3 a [Inkscape](https://inkscape.org/),
  - nutné udělat vždy když je uprven soubor [base.svg](../img/er-model/base.svg),
  - výsledné PDF soubory dát do version control,
