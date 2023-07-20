export TEXINPUTS=../tex//:

all: prace.pdf abstrakt-cz.pdf abstrakt-en.pdf

prace.pdf: prace.tex $(wildcard *.tex) literatura.bib prace.xmpdata metadata/*
	latexmk prace

abstrakt-cz.pdf: abstrakt-cz.tex abstrakt-cz.xmpdata metadata/abstrakt-cz.txt
	latexmk abstrakt-cz

abstrakt-en.pdf: abstrakt-en.tex abstrakt-en.xmpdata metadata/abstrakt-en.txt
	latexmk abstrakt-en

prace.xmpdata: metadata/*.txt
	metadata/gen-xmpdata.sh prace > $@

abstrakt-cz.xmpdata: metadata/*.txt
	./metadata/gen-xmpdata.sh cz > $@

abstrakt-en.xmpdata: metadata/*.txt
	./metadata/gen-xmpdata.sh en > $@

clean:
	latexmk -C
	rm -f *.log *.dvi *.aux *.toc *.lof *.lot *.out *.bbl *.blg *.xmpi
	rm -f prace.pdf abstrakt.pdf abstrakt-en.pdf abstrakt-cz.pdf
	rm -f prace.xmpdata abstrakt-en.xmpdata abstrakt-cz.xmpdata
	rm -f ../img/diagrams/*.svg

# Local PDF/A-2u validation, podman is needed. CI uses something different for this, see ../../.gitlab-ci.yml .
validate: prace.pdf abstrakt-cz.pdf abstrakt-en.pdf
	podman run --rm -v .:/prace:Z ghcr.io/mff-cuni-cz/cuni-thesis-validator verify prace/prace.pdf | grep 'isCompliant="true"'
	podman run --rm -v .:/prace:Z ghcr.io/mff-cuni-cz/cuni-thesis-validator verify prace/abstrakt-cz.pdf | grep 'isCompliant="true"'
	podman run --rm -v .:/prace:Z ghcr.io/mff-cuni-cz/cuni-thesis-validator verify prace/abstrakt-en.pdf | grep 'isCompliant="true"'

../img/diagrams/%.svg: ../img/diagrams/Diagrams.mdj | ../img/diagrams
	staruml image $< -f svg -o "../img/diagrams/<%=filenamify(element.name)%>.svg"

../img/diagrams/%.pdfb: ../img/diagrams/%.svg
	inkscape "$<" --export-area-drawing --batch-process --export-type=pdf --export-filename="$(basename $@)temp"
	mv "$(basename $@)temp.pdf" "$@"

../img/er-model/%.pdf: ../img/er-model/base.svg
	outp="$(basename $(notdir $@))"; \
	export_id=$$(python3 ../img/find-layer-id.py "$<" $$outp); \
	inkscape "$<" --export-area-drawing --export-id="$$export_id" --export-id-only --batch-process --export-type=pdf --export-filename="$@"

../img/schemcat-diagrams/%.pdf: ../img/schemcat-diagrams/base.svg
	outp="$(basename $(notdir $@))"; \
	export_id=$$(python3 ../img/find-layer-id.py "$<" $$outp); \
	inkscape "$<" --export-area-drawing --export-id="$$export_id" --export-id-only --batch-process --export-type=pdf --export-filename="$@"

# Convert files to PDF/A-2u 1.5 using Ghostscript. To ensure correct rule order, this uses the temporary pdfb extension.
%.pdf: %.pdfb
	gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite \
				-dPDFA=2 \
				-dPDFACompatibilityPolicy=1 \
				-dCompatibilityLevel=1.5 \
				-sColorConversionStrategy=RGB -dOverrideICC=true \
        -dAutoFilterColorImages=false -dColorImageFilter=/FlateEncode -dDownsampleColorImages=false \
        -dAutoFilterGrayImages=false -dGrayImageFilter=/FlateEncode -dDownsampleGrayImages=false \
        -sOutputFile=$@ $<

# Convert StarUML project diagrams to PDFs for embedding in LaTeX. Needs StarUML for mdj -> svg, and Inkscape for svg -> pdf.
diagrams: ../img/diagrams/schema-category-model.pdf ../img/diagrams/er-diagram-model.pdf ../img/diagrams/scv-model.pdf ../img/diagrams/use-case-diagram.pdf ../img/diagrams/diagram-class-diagram.pdf ../img/diagrams/er-class-diagram.pdf ../img/diagrams/schemcat-class-diagram.pdf ../img/diagrams/utils-class-diagram.pdf

# Extract PDFs from Inkscape layers of ../img/er-model/base.svg. Need Inkscape and Python3.
ermodel: ../img/er-model/entity.pdf ../img/er-model/relationship.pdf ../img/er-model/attribute.pdf ../img/er-model/identifier.pdf ../img/er-model/external-identifier.pdf ../img/er-model/composite-attribute.pdf ../img/er-model/generalization.pdf ../img/er-model/external-id-chain.pdf ../img/er-mode/redundant-ids.pdf

schemcat-diagrams: ../img/schemcat-diagrams/raw-schemcat-example.pdf ../img/schemcat-diagrams/schemcat-visualization-example.pdf ../img/schemcat-diagrams/scv-ord-dup.pdf

../img/react-references.pdf: ../img/react-references.svg
	inkscape "$<" --export-area-drawing --batch-process --export-type=pdf --export-filename="$@"

../img/cartesian-systems.pdf: ../img/cartesian-systems.svg
	inkscape "$<" --export-area-drawing --batch-process --export-type=pdf --export-filename="$@"

../img/university-model.pdf: ../img/university-model.svg
	inkscape "$<" --export-area-drawing --batch-process --export-type=pdf --export-filename="$@"

# convert to grayscale to preview how the PDF would looked if printed in grayscale
grayscale: prace.pdf
	gs -sOutputFile=prace-gs.pdf -sDEVICE=pdfwrite -sColorConversionStrategy=Gray -dProcessColorModel=/DeviceGray -dCompatibilityLevel=1.5 $< < /dev/null
	xdg-open prace-gs.pdf

.PHONY: all clean validate diagrams ermodel grayscale
