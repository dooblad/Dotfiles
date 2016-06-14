
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
Plugin 'w0ng/vim-hybrid'
Plugin 'klen/python-mode'
call vundle#end()

" Re-enable filetype plugins
filetype plugin indent on

"------------"
"   CONFIG   "
"------------"

" Let python-mode take care of indentation
let g:pymode_indent = 1

" Don't bother with errors while typing (only on save)
let g:pymode_lint_on_write = 1
let g:pymode_lint_on_fly = 0

" Don't open a little window for every error
let g:pymode_lint_cwindow = 0

" Say no to automatic auto-completion!
let g:pymode_rope_complete_on_dot = 0

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
    "colorscheme mod8
    colorscheme hybrid

    Limelight!
endfunction

autocmd! User GoyoEnter nested call <SID>goyo_enter()
autocmd! User GoyoLeave nested call <SID>goyo_leave()

" Vim tabs are LAAAAAAAME
set showtabline=0

set incsearch       " Allows for realtime regex testing
set smartcase       " Override 'ignorecase' if search contains capitals

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

" Indentation preferences
set autoindent
set nosmartindent

" Dem pastel colors tho
let g:hybrid_custom_term_colors = 1
let g:hybrid_reduced_contrast = 0
set background=dark
colorscheme hybrid

" No more jerking the page halfway over for text that extends
" beyond the screen width
set sidescroll=1

" Fuck line wrapping
set nowrap
set wrapmargin=0
set textwidth=0

" Default tab behaviors for unknown filetypes
set tabstop=4
set softtabstop=4
set shiftwidth=4

" Reload buffer if file has been externally modified
set autoread

"--------------"
" KEY BINDINGS "
"--------------"

" Prevent 'x' and 'c' from overwriting
" yank register.
nnoremap x "_x
nnoremap c "_c

" Stay in place while joining lines
nnoremap J mzJ`z

" Use arrow keys for buffer resizing
nnoremap <silent> <Left> :vertical resize +2<CR>
nnoremap <silent> <Right> :vertical resize -2<CR>
nnoremap <silent> <Up> :resize -2<CR>
nnoremap <silent> <Down> :resize +2<CR>

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
nnoremap <Leader>r :source ~/.vimrc<CR>

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

" More convenient Goyo
nnoremap <Leader>g :Goyo<CR>

" Backtick tracks column position, but
" it's further away. So swap 'em.
nnoremap ` '
nnoremap ' `

" Shitty brace completion
inoremap {<CR> {<CR>}<ESC>O

" Override builtin go-to-definition key
let g:pymode_rope_goto_definition_bind = "<C-]>"

" TODO: Make it so that pasting over a selection doesn't overwrite the paste buffer
" TODO: Get camel-case text objects, and make "_" count as a word delimiter
" TODO: Use backspace in normal mode for something
" TODO: Vertigo.vim?
" TODO: Make ftplugin for tex that adds "$" as a paired token.
