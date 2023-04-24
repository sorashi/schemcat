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

.PHONY: all clean vlna
