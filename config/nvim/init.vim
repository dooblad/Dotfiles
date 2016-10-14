"=========================================================="
"      ____              __             _    ___           "
"     / __ \____  ____  / /_  _____    | |  / (_)___ ___   "
"    / / / / __ \/ __ \/ __ \/ ___/    | | / / / __ `__ \  "
"   / /_/ / /_/ / /_/ / /_/ (__  )     | |/ / / / / / / /  "
"  /_____/\____/\____/_.___/____/      |___/_/_/ /_/ /_/   "
"                                                          "
"=========================================================="

let g:python3_host_prog = '/usr/bin/python3'

" __________ "
" |________| "
" |  DEIN  | "
" |‾‾‾‾‾‾‾‾| "
" ‾‾‾‾‾‾‾‾‾‾ "
filetype off

set runtimepath^=/home/doobs/.config/nvim/plugins/repos/github.com/Shougo/dein.vim

call dein#begin(expand('~/.config/nvim/plugins'))

" Duh...
call dein#add('Shougo/dein.vim')

" Fuzzy searching
call dein#add('ctrlpvim/ctrlp.vim')

" Directory view
call dein#add('scrooloose/nerdtree')

" Allow repeating for plugins
call dein#add('tpope/vim-repeat')

" Surround errythang
call dein#add('tpope/vim-surround')

" Git gud
call dein#add('tpope/vim-fugitive')

" Comments
call dein#add('tpope/vim-commentary')

" Syntaxxxxx
"call dein#add('neomake/neomake')

" i3 config
call dein#add('PotatoesMaster/i3-vim-syntax')

" MAXIMUM FOCUS
call dein#add('junegunn/goyo.vim')
call dein#add('junegunn/limelight.vim')

" Bow to the PEP8 overlords
call dein#add('klen/python-mode')

" Help me cope with the shitshow that is
" JavaScript
call dein#add('pangloss/vim-javascript')

" Asynchronous tags generation
call dein#add('fntlnz/atags.vim')

" For local testing
call dein#local("~/.config/nvim/plugins/local")

call dein#end()

" Re-enable filetype plugins
filetype plugin indent on

" If you want to install not 
" installed plugins on startup.
if dein#check_install()
  call dein#install()
endif

" __________ "
" |________| "
" | CONFIG | "
" |‾‾‾‾‾‾‾‾| "
" ‾‾‾‾‾‾‾‾‾‾ "

" Call this function when [re]setting colors
function! s:color_set()
    set background=dark
    colorscheme mod8
endfunction

" _______"
" | GPG |"
" ‾‾‾‾‾‾‾"
let g:gpg_user_name = "Doobs Parn"

" _______________________________ "
" | Magic That Makes Paste Work | "
" ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾ "
function! WrapForTmux(s)
  if !exists('$TMUX')
    return a:s
  endif

  let tmux_start = "\<Esc>Ptmux;"
  let tmux_end = "\<Esc>\\"

  return tmux_start . substitute(a:s, "\<Esc>", "\<Esc>\<Esc>", 'g') . tmux_end
endfunction

let &t_SI .= WrapForTmux("\<Esc>[?2004h")
let &t_EI .= WrapForTmux("\<Esc>[?2004l")

function! XTermPasteBegin()
  set pastetoggle=<Esc>[201~
  set paste
  return ""
endfunction

inoremap <special> <expr> <Esc>[200~ XTermPasteBegin()

" __________ "
" | Python | "
" ‾‾‾‾‾‾‾‾‾‾ "
" Let python-mode take care of indentation
let g:pymode_indent = 1

" Don't bother with errors while typing (only on save)
let g:pymode_lint_on_write = 1
let g:pymode_lint_on_fly = 0

" Don't open a little window for every error
let g:pymode_lint_cwindow = 0

" Say no to automatic auto-completion!
let g:pymode_rope_complete_on_dot = 0

" _________ "
" | LaTeX | "
" ‾‾‾‾‾‾‾‾‾ "
let tex_no_error = 1

" _____________ "
" | Limelight | "
" ‾‾‾‾‾‾‾‾‾‾‾‾‾ "
let g:limelight_conceal_ctermfg = 8
let g:limelight_conceal_guifg = '#8a8a8a'
let g:limelight_default_coefficient = 0.8

" ________ "
" | Goyo | "
" ‾‾‾‾‾‾‾‾ "

function! s:goyo_enter()
    let b:quitting = 0
    let b:quitting_bang = 0
    autocmd QuitPre <buffer> let b:quitting = 1
    cabbrev <buffer> q! let b:quitting_bang = 1 <bar> q!

    " Center the cursor on the screen
    set scrolloff=999

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

    " Back to normal scrolling
    set scrolloff=0

    " Reset colors
    call <SID>color_set()

    Limelight!
endfunction

autocmd! User GoyoEnter nested call <SID>goyo_enter()
autocmd! User GoyoLeave nested call <SID>goyo_leave()

" ___________ "
" | General | "
" ‾‾‾‾‾‾‾‾‾‾‾ "
" Vim tabs are LAAAAAAAME
set showtabline=0

set incsearch       " Allows for realtime regex testing
set ignorecase
set smartcase       " Override 'ignorecase' if search contains capitals
set nohlsearch

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

" ________________ "
" |______________| "
" | KEY BINDINGS | "
" |‾‾‾‾‾‾‾‾‾‾‾‾‾‾| "
" ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾ "
" Prevent 'x' and 'c' from overwriting
" yank register.
nnoremap x "_x
nnoremap c "_c

" Stay in place while joining lines
nnoremap J mzJ`z

" Use arrow key as shortcut for field dereferencing in C
inoremap <right> ->

" Use arrow keys for buffer resizing
nnoremap <silent> <Left> :vertical resize +2<CR>
nnoremap <silent> <Right> :vertical resize -2<CR>
nnoremap <silent> <Up> :resize -2<CR>
nnoremap <silent> <Down> :resize +2<CR>

" Space is your leader
let mapleader = " "

" Larger movements with leader prefix
nnoremap <Leader>h ^
nnoremap <Leader>l $

" Previous buffer (similar to Tmux)
nnoremap <silent> <Leader><Tab> :b#<CR>

" Shift tab goes backwards on the location stack.
" Tab goes forwards.
nnoremap <S-tab> <C-o>

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
nnoremap <C-n> :NERDTreeToggle<CR>

" Buffer navigation
nnoremap <Leader>> :bnext<CR>
nnoremap <Leader>< :bprevious<CR>

" More convenient Goyo ('f' for FOCUS)
nnoremap <Leader>f :Goyo<CR>

" Fugitive bindings
nnoremap <Leader>gc :Gcommit<CR>
nnoremap <Leader>gs :Gstatus<CR>
nnoremap <Leader>gm :Gmerge<CR>
nnoremap <Leader>g< :Gpull<CR>
nnoremap <Leader>g> :Gpush<CR>
nnoremap <Leader>gf :Gfetch<CR>
nnoremap <Leader>gl :Glog<CR>
nnoremap <Leader>gw :Gwrite<CR>
nnoremap <Leader>gd :Gvdiff<CR>
nnoremap <Leader>gm :Gmove 
nnoremap <Leader>gr :Gremove 

" Backtick tracks column position, but
" it's further away. So swap 'em.
nnoremap ` '
nnoremap ' `

" Shitty brace completion
inoremap {<CR> {<CR>}<ESC>O

" [E]dit my .[v]imrc in a split
nnoremap <leader>ev :vsplit $MYVIMRC<CR>

" [S]ource my .[v]imrc in a split
nnoremap <leader>sv :source $MYVIMRC<CR>

" Override builtin go-to-definition key
let g:pymode_rope_goto_definition_bind = "<C-]>"

" Set the colors initially
call <SID>color_set()

" TODO: Make it so that pasting over a selection doesn't overwrite the paste buffer
" TODO: Get camel-case text objects, and make "_" count as a word delimiter
" TODO: Use backspace in normal mode for something
" TODO: Vertigo.vim?
" TODO: Make ftplugin for tex that adds "$" as a paired token
" TODO: Consolidate swap files in one directory
" TODO: Use as a password manager
