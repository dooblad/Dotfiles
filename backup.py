from pathlib import Path
import os
import subprocess

from util import BACKUP_FILES

from_to_files = map(
    lambda base: (f'{Path.home()}/{base}', f'{Path.home()}/Dotfiles/{base}'),
    BACKUP_FILES)

def run_bash(*args, dry_run=False):
    if dry_run:
        print(' '.join(args))
    else:
        subprocess.Popen(args)

for from_file, to_file in from_to_files:
    if os.path.isdir(from_file):
        run_bash('rm', '-r', to_file)
    run_bash('cp', '-r', from_file, to_file)