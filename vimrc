"=========================================================="
"      ____              __             _    ___           "
"     / __ \____  ____  / /_  _____    | |  / (_)___ ___   "
"    / / / / __ \/ __ \/ __ \/ ___/    | | / / / __ `__ \  "
"   / /_/ / /_/ / /_/ / /_/ (__  )     | |/ / / / / / / /  "
"  /_____/\____/\____/_.___/____/      |___/_/_/ /_/ /_/   "
"=========================================================="

" __________ "
" |________| "
" | VUNDLE | "
" |‾‾‾‾‾‾‾‾| "
" ‾‾‾‾‾‾‾‾‾‾ "
set nocompatible
filetype off

set rtp+=~/.vim/bundle/Vundle.vim
call vundle#begin()
Plugin 'VundleVim/Vundle.vim'
Plugin 'chriskempson/base16-vim'
Plugin 'ctrlpvim/ctrlp.vim'
Plugin 'junegunn/limelight.vim'
Plugin 'junegunn/goyo.vim'
call vundle#end()

filetype plugin indent on

" __________ "
" |________| "
" | CONFIG | "
" |‾‾‾‾‾‾‾‾| "
" ‾‾‾‾‾‾‾‾‾‾ "
" Set syntax highlighting.
syntax on

if filereadable(expand("~/.vimrc_background"))
  let base16colorspace=256
  source ~/.vimrc_background
endif

set background=dark
set termguicolors

" _______________________ "
" | Trailing Whitespace | "
" ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾ "
" Highlight trailing whitespace.
highlight ExtraWhitespace ctermbg=red guibg=red
match ExtraWhitespace /\s\+$/
autocmd BufWinEnter * match ExtraWhitespace /\s\+$/
autocmd InsertEnter * match ExtraWhitespace /\s\+\%#\@<!$/
autocmd InsertLeave * match ExtraWhitespace /\s\+$/
autocmd BufWinLeave * call clearmatches()

" Remove trailing whitespace.
autocmd FileType tex,sh,v,ml autocmd BufWritePre <buffer> %s/\s\+$//e

" ___________ "
" | General | "
" ‾‾‾‾‾‾‾‾‾‾‾ "
" Vim tabs are LAAAAAAAME.
set showtabline=0

" Allows for realtime regex testing.
set incsearch
set ignorecase
" Override 'ignorecase' if search contains capitals.
set smartcase
set nohlsearch

" Don't close buffers when you move away from them for a sec...
" just hide 'em!
set hidden

" QUIT INSERTING COMMENTS!
autocmd FileType * silent setlocal formatoptions-=c formatoptions-=r formatoptions-=o

" Relative line numbering on the left-hand side and absolute numbering on the
" current line.
set relativenumber
set number

" Expands tabs into spaces for better cross-platform viewing.
set expandtab

" Indentation preferences
set autoindent
set nosmartindent

" No more jerking the page halfway over for text that extends beyond the
" screen width.
set sidescroll=1

" Fuck line wrapping.
set nowrap
set wrapmargin=0
set textwidth=0

" Default tab behaviors for unknown filetypes.
set tabstop=4
set softtabstop=4
set shiftwidth=4

" DON'T YOU EVER TELL ME WHERE I CAN AND CAN'T BACKSPACE AGAIN, YA HEAR?
set backspace=indent,eol,start

" Reload buffer if file has been externally modified.
set autoread

" Move Vim turds (swapfiles) into a single directory away from the current
" directory.
set directory=$HOME/.vim/swap

" Make the current directory = the current buffer.
set autochdir

" ____________________ "
" | Goyo + Limelight | "
" ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾ "
autocmd! User GoyoEnter Limelight
autocmd! User GoyoLeave Limelight!

let g:limelight_conceal_ctermfg = 'black'
let g:limelight_conceal_guifg = '#777777'

" ________________ "
" |______________| "
" | KEY BINDINGS | "
" |‾‾‾‾‾‾‾‾‾‾‾‾‾‾| "
" ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾ "
" Stay in place while joining lines.
nnoremap J mzJ`z

" Use arrow keys for buffer resizing.
nnoremap <silent> <Left> :vertical resize +2<CR>
nnoremap <silent> <Right> :vertical resize -2<CR>
nnoremap <silent> <Up> :resize -2<CR>
nnoremap <silent> <Down> :resize +2<CR>

" Space is your leader.
let mapleader = " "

" Previous buffer (similar to Tmux)
nnoremap <silent> <Leader><Tab> :b#<CR>

" Shift tab goes backwards on the location stack.
" Cuz tab goes forwards.
nnoremap <S-tab> <C-o>

" Easier split maneuvering
nnoremap <C-J> <C-W><C-J>
nnoremap <C-K> <C-W><C-K>
nnoremap <C-L> <C-W><C-L>
nnoremap <C-H> <C-W><C-H>

" Faster splits with leader mappings
nnoremap <Leader>\ :vs<CR>
nnoremap <Leader>- :sp<CR>

" Fuck the placement of the escape key.
inoremap fd <ESC>

" Buffer navigation
nnoremap <Leader>> :bnext<CR>
nnoremap <Leader>< :bprevious<CR>

" Backtick tracks column position, but it's further away. So swap 'em.
nnoremap ` '
nnoremap ' `

" Shitty brace completion
inoremap {<CR> {<CR>}<ESC>O

" [E]dit my .[v]imrc in a split.
nnoremap <leader>ev :vsplit $MYVIMRC<CR>

" [S]ource my .[v]imrc in a split.
nnoremap <leader>sv :source $MYVIMRC<CR>

" [F]ocus mode
nnoremap <Leader>f :Goyo<CR>

" TODO: Get camel-case text objects, and make "_" count as a word delimiter
" TODO: Use backspace in normal mode for something
" TODO: Vertigo.vim?
" TODO: Make ftplugin for tex that adds "$" as a paired token

