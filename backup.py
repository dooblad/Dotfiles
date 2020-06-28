from pathlib import Path
import os
import shutil

from util import FILES_TO_BACKUP

BACKUP_DIR = f'{os.path.dirname(os.path.abspath(__file__))}/dotfiles'

for filename in FILES_TO_BACKUP:
    src = f'{Path.home()}/{filename}'
    dst = f'{BACKUP_DIR}/{filename}'
    dst_dir = os.path.dirname(dst)
    if os.path.exists(src):
        if not os.path.exists(dst_dir):
            os.makedirs(dst_dir)

        if os.path.isfile(src):
            shutil.copy(src, dst)
        elif os.path.isdir(src):
            shutil.copytree(src, dst)
        else:
            raise RuntimeError('well then what the fuck is it?')
    else:
        print(f'warning: no such file `{src}` to back up')
