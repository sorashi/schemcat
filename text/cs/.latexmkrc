$pdf_mode = 5;
$xelatex = "xelatex -interaction=nonstopmode -synctex=1 -shell-escape %O %S";
$xdvipdfmx = "xdvipdfmx -z 0 -o %D %O %S";
$dvi_mode = 0;
$postscript_mode = 0;
$hash_calc_ignore_pattern{'timestamp'} = '^';
