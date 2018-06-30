#!/bin/bash
dir=~/Dotfiles
backupDir=~/Dotfiles.bak
files=`ls $dir | grep -v make.sh`

echo "Creating $backupDir ..."
mkdir -p $backupDir

echo "Moving existing dotfiles to $backupDir ..."
for file in $files; do
    mv ~/.$file $backupDir
    ln -s $dir/$file ~/.$file
done
