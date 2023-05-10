# Text bakalářské práce

- `make all` pro vysázení, je potřeba distirbuce LaTeXu, a program [vlna](https://petr.olsak.net/ftp/olsak/vlna/),
- `make validate` pro validaci PDF/A, je potřeba [podman](https://podman.io/),
- `make diagrams` pro export UML diagramů do PDF, je potřeba [StarUML](https://staruml.io/) a [Inkscape](https://inkscape.org/)
  - toto je nutné udělat manuálně vždy, když je upraven soubor [Diagrams.mdj](../img/diagrams/Diagrams.mdj),
  - výsledné PDF soubory dát do version control.
