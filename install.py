from pathlib import Path
import shutil
import subprocess
import os

from_to_files = map(lambda base: (f'{Path.home()}/Dotfiles/{base}', f'{Path.home()}/{base}'), [
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

backup_dir = f'{Path.home()}/Dotfiles.bak'
run_bash('rm', ' -r', backup_dir)
run_bash('mkdir', backup_dir)
for from_file, to_file in from_to_files:
    run_bash('cp', '-r', to_file, backup_dir)
    run_bash('rm', '-r', to_file)
    run_bash('cp', '-r', from_file, to_file)
