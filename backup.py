from pathlib import Path
import shutil
import subprocess
import os

from_to_files = map(lambda base: (f'{Path.home()}/{base}', f'{Path.home()}/Dotfiles/{base}'), [
    '.base16_theme',
    '.bash_profile',
    '.bashrc',
    '.config/base16-shell',
    '.gitconfig',
    '.ideavimrc',
    '.oh-my-zsh/custom/themes',
    '.shell_aliases',
    '.shell_path',
    '.spacemacs',
    '.ssh/config',
    '.tmux.conf',
    '.vim',
    '.vimrc',
    '.vimrc_background',
    '.zshrc',
    'bin',
])

def run_bash(*args, dry_run=False):
    if dry_run:
        print(' '.join(args))
    else:
        subprocess.Popen(args)

for from_file, to_file in from_to_files:
    run_bash('cp', '-r', from_file, to_file)
