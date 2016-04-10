setlocal foldmethod=syntax
setlocal foldtext=substitute(getline(v:foldstart),'\\t','\ \ \ \ ','g')
