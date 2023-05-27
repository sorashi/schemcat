export TEXINPUTS=../tex//:

all: prace.pdf abstrakt.pdf

# LaTeX je potreba spustit nekolikrat, aby spravne spocital odkazy
prace.pdf: prace.tex $(wildcard *.tex) literatura.bib prace.xmpdata
	latexmk prace

abstrakt.pdf: abstrakt.tex abstrakt.xmpdata
	latexmk abstrakt

clean:
	latexmk -C
	rm -f *.log *.dvi *.aux *.toc *.lof *.lot *.out *.bbl *.blg *.xmpi
	rm -f prace.pdf abstrakt.pdf
	rm -f ../img/diagrams/*.svg

# Local PDF/A-2u validation, podman is needed. CI uses something different for this, see ../../.gitlab-ci.yml .
validate: prace.pdf abstrakt.pdf
	podman run --rm -v .:/prace:Z ghcr.io/mff-cuni-cz/cuni-thesis-validator verify prace/prace.pdf | grep 'isCompliant="true"'
	podman run --rm -v .:/prace:Z ghcr.io/mff-cuni-cz/cuni-thesis-validator verify prace/abstrakt.pdf | grep 'isCompliant="true"'

../img/diagrams/%.svg: ../img/diagrams/Diagrams.mdj | ../img/diagrams
	staruml image $< -f svg -o "../img/diagrams/<%=filenamify(element.name)%>.svg"

../img/diagrams/%.pdf: ../img/diagrams/%.svg
	inkscape "$<" --export-area-drawing --batch-process --export-type=pdf

../img/er-model/%.pdf: ../img/er-model/base.svg
	outp="$(basename $(notdir $@))"; \
	export_id=$$(python3 ../img/er-model/find-layer-id.py "$<" $$outp); \
	inkscape "$<" --export-area-drawing --export-id="$$export_id" --export-id-only --batch-process --export-type=pdf --export-filename="$@"

# Convert StarUML project diagrams to PDFs for embedding in LaTeX. Needs StarUML for mdj -> svg, and Inkscape for svg -> pdf.
diagrams: ../img/diagrams/schema-category-model.pdf ../img/diagrams/diagram-model.pdf
# Extract PDFs from Inkscape layers of ../img/er-model/base.svg. Need Inkscape and Python3.
ermodel: ../img/er-model/entity.pdf ../img/er-model/relationship.pdf ../img/er-model/attribute.pdf ../img/er-model/identifier.pdf ../img/er-model/external-identifier.pdf ../img/er-model/composite-attribute.pdf ../img/er-model/generalization.pdf

.PHONY: all clean validate diagrams ermodel
