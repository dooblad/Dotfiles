#!/usr/bin/env bash

# Switch to current directory.
cd "$(dirname "$0")"

dir="$HOME/Dotfiles"
backup_dir="$HOME/Dotfiles.bak"
files="gitconfig ideavimrc spacemacs vimrc zshrc"

echo "creating $backup_dir ..."
mkdir "$backup_dir"

echo "moving existing dotfiles to $backup_dir ..."
for file in $files; do
    mv "$HOME/.$file" $backup_dir 2> /dev/null
    ln -s "$dir/$file" "$HOME/.$file"
done
