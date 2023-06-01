#!/bin/sh

set -e

common() {
  echo "% Metadata k uložení do PDF, podrobnější popis viz dokumentace balíčku pdfx."
  echo ""
  echo "\Author{Dennis Pražák}"
  echo "\Publisher{Univerzita Karlova}"
}

xmpdata_abstract_cz() {
  common
  echo "\Title{$(cat metadata/title-cz.txt)}"
}
xmpdata_abstract_en() {
  common
  echo "\Title{$(cat metadata/title-en.txt)}"
}
xmpdata_prace() {
  common
  echo "\Title{$(cat metadata/title-cz.txt)}"
  echo "\Subject{$(cat metadata/abstrakt-cz.txt)}"
  # replace }, { with \sep
  keywords=$(sed 's/},\s*{/\\sep /g' metadata/keywords-cz.txt | tr -d '{}')
  echo "\Keywords{$keywords}"
}

if [ "$1" = "cz" ]; then
  xmpdata_abstract_cz
elif [ "$1" = "en" ]; then
  xmpdata_abstract_en
elif [ "$1" = "prace" ]; then
  xmpdata_prace
else
  echo "Invalid argument: $1" >&2
  echo "Specify mode en/cz/prace" >&2
fi
