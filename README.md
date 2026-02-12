# webshell

Dragonhack challenge to get tickets.<br>
Deployed at: [webshell-b2u.pages.dev](https://webshell-b2u.pages.dev/)

## Routes
- `/` -> Linux boot `[  OK  ]` for 2 sec, then loading screen (PC boot). Redirect to `/grub` after 3 sec of loading.
- `/grub` -> choose between `Ubuntu (light)` / `Arch (dark)` theme. Goes to after 5 seconds timeout automatically `/shell`
- `/shell` -> main site, terminal

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
Shell looks like this (user name is TBD...)
```
user@nasa:~$ 
```

Files already present:
- Default dir is `/home/user`
- All other dirs are unix standard, all empty by default
- `.env` - when base64 decoded is a funny value
- `about.txt`
- .. TBD

## Deploy
Deployed on CF pages
```
npx wrangler login
npx wrangler pages deploy . --project-name=webshell
```