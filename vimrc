
"----------------------------------------------------------"
"      ____              __             _    ___           "
"     / __ \____  ____  / /_  _____    | |  / (_)___ ___   "
"    / / / / __ \/ __ \/ __ \/ ___/    | | / / / __ `__ \  "
"   / /_/ / /_/ / /_/ / /_/ (__  )     | |/ / / / / / / /  "
"  /_____/\____/\____/_.___/____/      |___/_/_/ /_/ /_/   "
"                                                          "
"----------------------------------------------------------"

" NeoVim <-> Vim compatibility (just in case, yo)
if has('nvim')
    let s:editor_root = expand("~/.nvim")
else
    let s:editor_root = expand("~/.vim")
endif

" Remove backwards compatibility with Vi
set nocompatible

" Add them colors if they got 'em
if has('termguicolors')
    set termguicolors
endif

"-----------------"
"   VUNDLE SHIT   "
"-----------------"
filetype off
let &rtp = &rtp . ',' . s:editor_root . '/bundle/Vundle.vim'
call vundle#begin()
Plugin 'VundleVim/Vundle.vim'
Plugin 'scrooloose/nerdtree'
Plugin 'PotatoesMaster/i3-vim-syntax'
Plugin 'junegunn/goyo.vim'
Plugin 'junegunn/limelight.vim'
call vundle#end()

" Re-enable filetype plugins
filetype plugin indent on

"------------"
"   CONFIG   "
"------------"

" Prevent ugly LaTeX error highlighting
let tex_no_error = 1

let g:limelight_conceal_ctermfg = 'DarkGray'
let g:limelight_default_coefficient = 0.8

function! s:goyo_enter()
    let b:quitting = 0
    let b:quitting_bang = 0
    autocmd QuitPre <buffer> let b:quitting = 1
    cabbrev <buffer> q! let b:quitting_bang = 1 <bar> q!

    Limelight
endfunction

function! s:goyo_leave()
	" Quit Vim if this is the only remaining buffer
	if b:quitting && len(filter(range(1, bufnr('$')), 'buflisted(v:val)')) == 1
		if b:quitting_bang
			qa!
		else
			qa
		endif
	endif
    colorscheme mod8

    Limelight!
endfunction

autocmd! User GoyoEnter nested call <SID>goyo_enter()
autocmd! User GoyoLeave nested call <SID>goyo_leave()

" Vim tabs are LAAAAAAAME
set showtabline=0

" Allows for realtime regex testing
set incsearch

" Don't close buffers when you move away from them for a sec...
" Just hide 'em!
set hidden

" QUIT INSERTING COMMENTS!
autocmd FileType * silent setlocal formatoptions-=c formatoptions-=r formatoptions-=o

" Set syntax highlighting
syntax on

" Relative line numbering on the left-hand side and absolute numbering on the
" current line
set relativenumber
set number

" Expands tabs into spaces for better cross-platform viewing
set expandtab

" Smart indenting?
set autoindent
set nosmartindent

" Dis ones nice, I gess
colorscheme mod8

" No more jerking the page halfway over for text that extends
" beyond the screen width
set sidescroll=1

"--------------"
" KEY BINDINGS "
"--------------"

" Space is your leader
let mapleader = " "

" [d]eletes a whole line
nnoremap <Leader>d dd
" [c]hange whole line
nnoremap <Leader>c cc
" [y]ank the whole line
nnoremap <Leader>y yy

" Larger movements with leader prefix
nnoremap <Leader>j }
nnoremap <Leader>k {
nnoremap <Leader>h ^
nnoremap <Leader>l $

" Previous buffer (similar to Tmux)
nnoremap <Leader>; :b#<CR>

" Buffer close
nnoremap <C-W> :bdelete<CR>

" [R]eload .vimrc
" TODO: Change this to an Ex command, rather than a binding
nnoremap <Leader>r :source ~/.vimrc<CR>

" Switch to buffer [1]-[5]
nnoremap <Leader>1 :buffer 1<CR>
nnoremap <Leader>2 :buffer 2<CR>
nnoremap <Leader>3 :buffer 3<CR>
nnoremap <Leader>4 :buffer 4<CR>
nnoremap <Leader>5 :buffer 5<CR>

" Quicker fold toggling. Besides, who uses the tab key
nnoremap <tab> za 

" Easier split maneuvering
nnoremap <C-J> <C-W><C-J>
nnoremap <C-K> <C-W><C-K>
nnoremap <C-L> <C-W><C-L>
nnoremap <C-H> <C-W><C-H>

" Faster splits with leader mappings
nnoremap <Leader>\ :vs<CR>
nnoremap <Leader>- :sp<CR>

" Fuck the placement of the escape key
inoremap jk <ESC>

" Use Ctrl-n to open up NerdTree
nmap <C-n> :NERDTreeToggle<CR>

" Insert line breaks with enter
nnoremap <CR> i<CR><Esc>

" Buffer navigation
nnoremap <Leader>> :bnext<CR>
nnoremap <Leader>< :bprevious<CR>

" Fuck line wrapping
set nowrap
set wrapmargin=0
set textwidth=0

" Default tab sizes for unknown filetypes
set tabstop=4
set softtabstop=4
set shiftwidth=4

" More convenient Goyo
nnoremap <Leader>g :Goyo<CR>

autocmd Filetype scheme silent set syntax=lisp

" TODO: Make it so that pasting over a selection doesn't overwrite the paste buffer
" TODO: Get camel-case text objects, and make "_" count as a word delimiter
" TODO: Use backspace in normal mode for something
" TODO: Vertigo.vim?
