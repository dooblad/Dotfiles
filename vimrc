" NeoVim <-> Vim compatibility.
if has('nvim')
    let s:editor_root=expand("~/.nvim")
else
    let s:editor_root=expand("~/.vim")
endif

" Remove backwards compatibility with Vi.
set nocompatible

" Begin Vundle shit.
filetype off
let &rtp = &rtp . ',' . s:editor_root . '/bundle/Vundle.vim'
call vundle#begin()
Plugin 'VundleVim/Vundle.vim'
Plugin 'scrooloose/syntastic'
Plugin 'tpope/vim-surround'
call vundle#end()
filetype plugin indent on
" End Vundle shit.

" TODO: Make this work with s:editor_root
"source s:editor_root . '/autoclose.vim'
source ~/.vim/tex_autoclose.vim
source ~/.vim/autoclose.vim

" QUIT INSERTING COMMENTS!
autocmd FileType * setlocal formatoptions-=c formatoptions-=r formatoptions-=o

" Set syntax highlighting
syntax on

" Relative line numbering on the left-hand side and absolute numbering on the
" current line.
set relativenumber
set number

" Expands tabs into spaces for cross-platform viewing.
set expandtab
" Make a tab equivalent to 4 spaces.
set tabstop=4
set softtabstop=4
set shiftwidth=4

" Smart indenting?
set autoindent
set nosmartindent

" Space is your leader.
let mapleader = " "
" [D]eletes a whole line.
nnoremap <Leader>d dd
" [C]hange whole line.
nnoremap <Leader>c cc
" Faster [w]riting/saving.
nnoremap <Leader>w :w<CR>
" Save and [q]uit.
nnoremap <Leader>q :wq<CR>
" Quicker movement.
nnoremap <Leader>j }
nnoremap <Leader>k {
nnoremap <Leader>h ^
nnoremap <Leader>l $
" For [L]aTeX compiling on the current file.
"nnoremap <Leader>l :w <bar> !pdflatex %<CR>
" [R]eload .vimrc.
nnoremap <Leader>r :source ~/.vimrc<CR>
" Switch to buffer [1]-[5]
nnoremap <Leader>1 :buffer 1<CR>
nnoremap <Leader>2 :buffer 2<CR>
nnoremap <Leader>3 :buffer 3<CR>
nnoremap <Leader>4 :buffer 4<CR>
nnoremap <Leader>5 :buffer 5<CR>
" Remove pesky search highlighting.
nnoremap <silent> <Leader><Leader> :nohlsearch<cr>

" Split maneuvering.
nnoremap <C-J> <C-W><C-J>
nnoremap <C-K> <C-W><C-K>
nnoremap <C-L> <C-W><C-L>
nnoremap <C-H> <C-W><C-H>

" Word wrapping.
set nowrap
set linebreak
set nolist " list disables linebreak
set wrapmargin=0

" Fuck the placement of the escape key.
inoremap jk <ESC>

" Read ':help fo-table'
set formatoptions=tcn2l

fun! MakeColorColumn()
    " Don't do dis on .tex files.
    if &ft =~ 'tex'
        return
    endif
    " Light grey column as a reminder to keep code readable.
    set colorcolumn=90
    highlight ColorColumn ctermbg=7
    " Set textwidth to enforce it!
    set textwidth=89
endfun

autocmd BufNewFile,BufRead * call MakeColorColumn() 

colorscheme default
