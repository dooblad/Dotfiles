#! /bin/bash
~/.fehbg &
redshift &
exec i3 -V >> ~/i3log-$(date + '%F-%k-%M-%S') 2>&1

# Load custom key mappings.
if [ -s ~/.Xmodmap ]; then
    xmodmap ~/.Xmodmap
fi
