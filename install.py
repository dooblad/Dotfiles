from pathlib import Path
import subprocess

from util import BACKUP_FILES

from_to_files = map(
    lambda base: (f'{Path.home()}/Dotfiles/{base}', f'{Path.home()}/{base}'),
    BACKUP_FILES)

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
