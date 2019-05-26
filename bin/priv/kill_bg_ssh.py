import subprocess

out = subprocess.check_output(['ps', 'aux']).decode('utf-8').split('\n')
for line in out:
    if 'ssh -f' not in line and 'sshfs' not in line:
        continue
    fields = list(filter(lambda s: len(s) != 0, line.split(' ')))
    pid = fields[1]
    assert subprocess.call(['kill', '-9', pid]) == 0
