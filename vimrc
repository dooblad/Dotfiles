" NeoVim <-> Vim compatibility (just in case, yo)
if has('nvim')
    let s:editor_root=expand("~/.nvim")
else
    let s:editor_root=expand("~/.vim")
endif

" Remove backwards compatibility with Vi
set nocompatible

"=-----------="
" VUNDLE SHIT "
"=-----------="
filetype off
let &rtp = &rtp . ',' . s:editor_root . '/bundle/Vundle.vim'
call vundle#begin()
Plugin 'VundleVim/Vundle.vim'
Plugin 'scrooloose/syntastic'
Plugin 'tmhedberg/SimpylFold'
Plugin 'scrooloose/nerdtree'
Plugin 'PotatoesMaster/i3-vim-syntax'
call vundle#end()

" Re-enable filetype plugins
filetype plugin indent on

"=------="
" CONFIG "
"=------="

" Vim tabs are LAAAAAAAME
set showtabline=0

" Allows for realtime regex testing
set incsearch

" Don't close buffers when you move away from them for a sec...
" Just hide 'em!
set hidden

" QUIT INSERTING COMMENTS!
autocmd Filetype * silent setlocal formatoptions-=c formatoptions-=r formatoptions-=o

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

" Save fold state across sessions
"autocmd BufWinLeave * silent mkview
"autocmd BufWinEnter * silent loadview

" Dis ones nice, I gess
colorscheme mod8

" No more jerking the page halfway over for text that extends
" beyond the screen width
set sidescroll=1

"=------------="
" KEY BINDINGS "
"=------------="

" Space is your leader
let mapleader = " "

" [d]eletes a whole line
nnoremap <Leader>d dd
" [c]hange whole line
nnoremap <Leader>c cc

" Faster [w]riting/saving
nnoremap <Leader>w :w<CR>
" Save and [q]uit
nnoremap <Leader>q :wq<CR>

" Larger movements with leader prefix
nnoremap <Leader>j }
nnoremap <Leader>k {
nnoremap <Leader>h ^
nnoremap <Leader>l $

" Previous buffer (similar to Tmux)
nnoremap <Leader>; :b#<CR>

" [R]eload .vimrc
nnoremap <Leader>r :source ~/.vimrc<CR>

" Switch to buffer [1]-[5]
nnoremap <Leader>1 :buffer 1<CR>
nnoremap <Leader>2 :buffer 2<CR>
nnoremap <Leader>3 :buffer 3<CR>
nnoremap <Leader>4 :buffer 4<CR>
nnoremap <Leader>5 :buffer 5<CR>

" Remove pesky search highlighting
nnoremap <silent> <Leader><Leader> :nohlsearch<cr>

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
map <C-n> :NERDTreeToggle<CR>

" Fuck line wrapping
set nowrap
set wrapmargin=0
set textwidth=0

" Default tab sizes for unknown filetypes
set tabstop=4
set softtabstop=4
set shiftwidth=4

" TODO: Make it so that pasting over a selection doesn't overwrite the paste buffer
" TODO: Get camel-case text objects, and make "_" count as a word delimiter
" TODO: Use backspace in normal mode for something

