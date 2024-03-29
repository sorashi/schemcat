%% Implemented by Martin Helsø (martibhe@math.uio.no)
%% Version: 23-09-2019
%%
%% Also available at:
%% https://github.com/martinhelso/uioposter

\NeedsTeXFormat{LaTeX2e}


\ProvidesClass{uioposter}


\DeclareOption{english}{\def\uioposter@lang{english}}
\DeclareOption{norsk}
{
    \def\uioposter@lang{norsk}
    \pretolerance = 2000
    \tolerance    = 6000
    \hbadness     = 6000
}


\DeclareOption{portrait}
{
    \PassOptionsToPackage{orientation = portrait}{beamerposter}
    \def\uioposter@orientation{}
}
\DeclareOption{landscape}
{
    \PassOptionsToPackage{orientation = landscape}{beamerposter}
    \def\uioposter@orientation{landscape}
}


\DeclareOption{a0paper}{\def\uioposter@size{a0paper}}
\DeclareOption{a1paper}{\def\uioposter@size{a1paper}}
\DeclareOption{a2paper}{\def\uioposter@size{a2paper}}
\DeclareOption{a3paper}{\def\uioposter@size{a3paper}}
\DeclareOption{a4paper}{\def\uioposter@size{a4paper}}
\DeclareOption{a5paper}{\def\uioposter@size{a5paper}}
\DeclareOption{a6paper}{\def\uioposter@size{a6paper}}
\DeclareOption*{\PassOptionsToClass{\CurrentOption}{beamer}}


\ExecuteOptions{a0paper}
\ExecuteOptions{english}
\ExecuteOptions{portrait}
\ProcessOptions
\relax


\LoadClass[t]{beamer}

\def\beamerscale{1.3}
\def\horizontalmarginminimal{1.05cm}
\def\horizontalmarginadditional{3cm}
\def\horizontalmargin{\dimexpr\horizontalmarginminimal + \horizontalmarginadditional}

\def\verticalmarginminimal{1.3cm}
\def\verticalmarginadditional{3cm}
\def\verticalmargincompensatepredefined{-0.5in}
\def\verticalmargin{\dimexpr\verticalmarginminimal + \verticalmarginadditional + \verticalmargincompensatepredefined}
\def\footerverticalmarginadditional{1cm}
\RequirePackage[size = a0, scale = \beamerscale]{beamerposter}
\RequirePackage{etoolbox}
\RequirePackage{pgfpages}
% \RequirePackage[utf8]{inputenx}
\RequirePackage[T1]{fontenc}
\RequirePackage{calc}
\RequirePackage[final]{microtype}
\RequirePackage{lmodern}
\RequirePackage[scaled]{beramono}


\hypersetup{%colorlinks,
            urlcolor  = uiolink,
            linkcolor =,
            citecolor =,
            filecolor =}
\renewcommand{\sfdefault}{phv}
\DeclareFontShape{OMX}{cmex}{m}{n}
{
    <-7.5>    cmex7
    <7.5-8.5> cmex8
    <8.5-9.5> cmex9
    <9.5->    cmex10
}{}
\SetSymbolFont{largesymbols}{normal}{OMX}{cmex}{m}{n}
\SetSymbolFont{largesymbols}{bold}  {OMX}{cmex}{m}{n}
\setlength{\marginparwidth}{2cm}
\setlength{\emergencystretch}{1em}
\frenchspacing

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\usefonttheme{serif}
\useinnertheme{rectangles}
\setbeamertemplate{navigation symbols}{}
\setbeamertemplate{caption}[numbered]
\setbeamertemplate{caption label separator}{: }
\setbeamertemplate{qed symbol}{\(\blacksquare\)}
\setbeamertemplate{itemize items}{\color{itemize item.fg}\(\blacksquare\)}


\setlength{\labelsep}{3ex}
\setlength{\leftmargini}{18ex}
\setbeamersize{text margin left = \horizontalmargin, text margin right = \horizontalmargin}
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\definecolor{uiored}{cmyk}{0.29, 0, 0.52, 0.22}
\definecolor{uiowhite}{cmyk}{0, 0, 0, 0}
\definecolor{uioblack}{cmyk}{0, 0, 0, 1}
\definecolor{mffgreen}{cmyk}{0.29, 0, 0.52, 0.22}
\definecolor{mffred}{cmyk}{0, 0.76, 0.67, 0.18}
\definecolor{cpbluedark}{cmyk}{0.81, 0.40, 0, 0.39}
\definecolor{cpbluelight}{cmyk}{0.52, 0.21, 0, 0.04}
\definecolor{morered}{cmyk}{0, 0.74, 1, 0.18}
\definecolor{uioheader}{cmyk}{0, 0, 0, 0.6}
\definecolor{uiobackground}{cmyk}{0, 0, 0, 0.1}
\definecolor{uiolink}{HTML}{0B5A9D}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\setbeamercolor{structure}{fg = uioheader}
\setbeamercolor{alerted text}{fg = cpbluedark}
\setbeamercolor{background canvas}{fg = uioblack, bg = uiobackground}
\setbeamercolor{headline}{fg = uiowhite, bg = cpbluedark}
\setbeamercolor{title in headline}{fg = uiowhite}
\setbeamercolor{author in headline}{fg = uiowhite}
\setbeamercolor{footline}{fg = uiowhite, bg = cpbluedark}


\setbeamercolor{block title}{fg = uiowhite, bg = cpbluelight}
\setbeamercolor{block title example}{fg = uiowhite, bg = uioblack}
\setbeamercolor{block title alerted}{fg = uiowhite, bg = cpbluedark}


\setbeamercolor{block body} {fg = uioblack, bg = uiowhite}
\setbeamercolor{block body example} {fg = uioblack, bg = uiowhite}
\setbeamercolor{block body alerted} {fg = uioblack, bg = uiowhite}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\setbeamerfont{title in headline}{family = \sffamily,
                                  series = \bfseries,
                                  size   = \huge}
\setbeamerfont{author in headline}{family = \sffamily,
                                   series = \bfseries,
                                   size   = \Large}
\setbeamerfont{institute}{family = \sffamily,
                          series = \mdseries,
                          size   = \normalsize}


\setbeamerfont{block title}{family = \sffamily,
                            series = \bfseries,
                            size   = \large}
\setbeamerfont{block title alerted}{family = \sffamily,
                                    series = \bfseries,
                                    size   = \large}
\setbeamerfont{block title example}{family = \sffamily,
                                    series = \bfseries,
                                    size   = \large}


\setbeamerfont{block body}{family = \rmfamily,
                           series = \normalfont,
                           size   = \normalsize}
\setbeamerfont{block body example}{family = \rmfamily,
                                   series = \normalfont,
                                   size   = \normalsize}
\setbeamerfont{block body alerted}{family = \rmfamily,
                                   series = \normalfont,
                                   size   = \normalsize}


\setbeamerfont{item projected}{family = \sffamily,
                               series = \bfseries,
                               size   = \small}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\setbeamertemplate{headline}
{
    \begin{beamercolorbox}[wd = \paperwidth,
                           leftskip  = \horizontalmargin,
                           rightskip = \horizontalmargin plus 5cm]{headline}
        \vskip\verticalmargin
        \usebeamerfont{title in headline}
        \usebeamercolor{title in headline}
        \color{fg}
        \vskip0ex
        \hskip-0.05ex
        \inserttitle
        \vskip1ex
        \usebeamerfont{author in headline}
        \usebeamercolor{author in headline}
        \color{fg}
        \hskip-0.05ex
        \insertauthor
        \ifdefempty{\insertinstitute}{}
        {
            \hskip1ex
            \usebeamerfont{institute}
            \def\beamer@andinst{\quad}
            \insertinstitute
        }
        \vskip3cm
    \end{beamercolorbox}
    \vskip1cm
}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\setbeamertemplate{footline}
{
    \leavevmode
    \begin{beamercolorbox}[wd = \paperwidth]{footline}
        \vskip0.5cm
        \hskip\dimexpr\horizontalmargin + \footerverticalmarginadditional
        \includegraphics[scale = \beamerscale]{images/logo-cs-removed-white-inverse}
        \vskip\verticalmargin
    \end{beamercolorbox}
}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\setbeamertemplate{block begin}
{
    \setbeamercolor{itemize item}  {fg = block title.bg}
    \setbeamercolor{item projected}{fg = block title.fg,
                                    bg = block title.bg}
    \setbeamercolor{description item}{fg = structure}

    \begin{beamercolorbox}[ht        = 3.2 ex,
                           dp        = 1.3 ex,
                           leftskip  = 2 ex,
                           rightskip = 2 ex]
                          {block title}

        \usebeamerfont*{block title}
        \insertblocktitle
        
    \end{beamercolorbox}

    \nointerlineskip

    \begin{beamercolorbox}[dp        = 2 ex,
                           leftskip  = 2 ex,
                           rightskip = 2 ex,
                           vmode]
                          {block body}

        \usebeamerfont{block body}
        \vskip2ex
        \begin{minipage}{\textwidth-4ex}
             \setlength{\parskip}{1.5ex}
             \setlength{\abovecaptionskip}{1ex}
}


\setbeamertemplate{block end}
{
        \end{minipage}
    \vskip0.2ex
    \end{beamercolorbox}
    \vskip1cm
}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\setbeamertemplate{block example begin}
{
    \setbeamercolor{itemize item}  {fg = block title example.bg}
    \setbeamercolor{item projected}{fg = block title example.fg,
                                    bg = block title example.bg}
    \setbeamercolor{description item}{fg = structure}

    \begin{beamercolorbox}[ht        = 3.2 ex,
                           dp        = 1.3 ex,
                           leftskip  = 2 ex,
                           rightskip = 2 ex]
                          {block title example}

        \usebeamerfont*{block title example}
        \insertblocktitle

    \end{beamercolorbox}

    \nointerlineskip

    \begin{beamercolorbox}[dp        = 2 ex,
                           leftskip  = 2 ex,
                           rightskip = 2 ex,
                           vmode]
                          {block body example}

        \usebeamerfont{block example body}
        \vskip2ex
        \begin{minipage}{\textwidth-4ex}
             \setlength{\parskip}{1.5ex}
             \setlength{\abovecaptionskip}{1ex}
}


\setbeamertemplate{block example end}
{
        \end{minipage}
    \vskip0.2ex
    \end{beamercolorbox}
    \vskip3cm
}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\setbeamertemplate{block alerted begin}
{
    \setbeamercolor{itemize item}  {fg = block title alerted.bg}
    \setbeamercolor{item projected}{fg = block title alerted.fg,
                                    bg = block title alerted.bg}
    \setbeamercolor{description item}{fg = structure}

    \begin{beamercolorbox}[ht        = 3.2 ex,
                           dp        = 1.3 ex,
                           leftskip  = 2 ex,
                           rightskip = 2 ex]
                          {block title alerted}

        \usebeamerfont*{block title alerted}
        \insertblocktitle

    \end{beamercolorbox}

    \nointerlineskip

    \begin{beamercolorbox}[dp        = 2 ex,
                           leftskip  = 2 ex,
                           rightskip = 2 ex,
                           vmode]
                          {block body alerted}

        \usebeamerfont{block body alerted}
        \vskip2ex
        \begin{minipage}{\textwidth-4ex}
             \setlength{\parskip}{1.5ex}
             \setlength{\abovecaptionskip}{1ex}
}


\setbeamertemplate{block alerted end}
{
        \end{minipage}
    \vskip0.2ex
    \end{beamercolorbox}
    \vskip3cm
}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\newcommand{\enumitem}[1]
{{%
    \leavevmode\unskip
    \def\insertenumlabel{#1}
    \usebeamertemplate*{enumerate item}%
}}


\newcommand{\enumref}[1]{\enumitem{\ref{#1}}}


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\pgfpagesdeclarelayout{resize and center}
{
    \def\pgfpageoptionborder{0pt}
}
{
    \pgfpagesphysicalpageoptions
    {
        logical pages   = 1,
        physical height = \pgfpageoptionheight,
        physical width  = \pgfpageoptionwidth
    }
    \pgfpageslogicalpageoptions{1}
    {
        resized width  = \pgfphysicalwidth,
        resized height = \pgfphysicalheight,
        border shrink  = \pgfpageoptionborder,
        center         = \pgfpoint{.5\pgfphysicalwidth}{.5\pgfphysicalheight}
    }
}


\ifdefstring{\uioposter@size}{a0paper}{}
{
    \pgfpagesuselayout{resize and center}[\uioposter@size,
                                          \uioposter@orientation]
}

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\endinput
