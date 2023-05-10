export TEXINPUTS=../tex//:

all: vlna prace.pdf abstrakt.pdf

# Note that vlna always touches all files even when they are not changed.
# This causes make to always run vlna.
vlna: $(wildcard *.tex)
	vlna *.tex

# LaTeX je potreba spustit nekolikrat, aby spravne spocital odkazy
prace.pdf: prace.tex $(wildcard *.tex) literatura.bib prace.xmpdata
	pdflatex $<
	bibtex prace
	pdflatex $<
	pdflatex $<

abstrakt.pdf: abstrakt.tex abstrakt.xmpdata
	pdflatex $<

clean:
	rm -f *.log *.dvi *.aux *.toc *.lof *.lot *.out *.bbl *.blg *.xmpi
	rm -f prace.pdf abstrakt.pdf
	rm -f ../img/diagrams/*.svg ../img/diagrams/*.pdf

validate: prace.pdf abstrakt.pdf
	podman run --rm -v .:/prace:Z ghcr.io/mff-cuni-cz/cuni-thesis-validator verify prace/prace.pdf | grep 'isCompliant="true"'
	podman run --rm -v .:/prace:Z ghcr.io/mff-cuni-cz/cuni-thesis-validator verify prace/abstrakt.pdf | grep 'isCompliant="true"'

../img/diagrams/%.svg: ../img/diagrams/Diagrams.mdj | ../img/diagrams
	staruml image $< -f svg -o "../img/diagrams/<%=filenamify(element.name)%>.svg"

../img/diagrams/%.pdf: ../img/diagrams/%.svg
	inkscape "$<" --export-area-drawing --batch-process --export-type=pdf

diagrams: ../img/diagrams/schema-category-model.pdf ../img/diagrams/diagram-model.pdf

.PHONY: all clean vlna validate diagrams
