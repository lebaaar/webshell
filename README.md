# webshell

Dragonhack project

## Routes
- `/index.html` -> Linux boot `[  OK  ]` for 2 sec, then loading screen (PC boot). Redirect to grub after 3 sec of loading
- `/grub.html` -> choose between `Ubuntu (light)` / `Arch (dark)` theme. Goes to `/shell.html`
- `/shell.html` -> main site with commands

## Commands
- `help` - show all available commands
- `man` - show all available commands
- `ls`
- `cat`
- `clear`
- `pwd`
- `cd`
- `echo`
- `sudo` - prints out nuh uh for 3 sec, redirect to rickroll
- `whoami` - lists info about team, each member (portoflio for each user)
- `neofetch` - draw a dragon with specs
- `draw [dragon|cat|dog]` - ascii art
- `uptime`
- `ping`
- `git [branch|status]`
- `checksum - hash generator`

## shell
Shell looks like this (name is TBD...)
```
user@nasa:~$ 
```

Files already present:
- Default dir is `/home/user`
- All other dirs are unix standard, all empty by default
- `.env` - when base64 decoded is a funny value
- `about.txt`
- .. TBD