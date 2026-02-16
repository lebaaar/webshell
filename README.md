# webshell

DragonHack URL challenge - (almost) full UNIX machine emulator on the web.<br>
Deployed at: [webshell-b2u.pages.dev](https://webshell-b2u.pages.dev/)

## Commands
Most standard UNIX commands are supported, some examples include:
- `help` - show all available commands
- `man` - show all available commands
- `ls` - list folder contents
- `cat` - read file content
- `clear` - clear screen
- `pwd` - print working directory
- `cd` - change directory
- `sudo` - prints out nuh uh for 3 sec, redirect to rickroll
- `whoami` - lists info about team, each member (portoflio for each user)
- `draw` - draw a dragon in ascii art
- `git` - lists git details about this repo
- ...

## Deploy
Deployed on CF pages
```
npx wrangler login
npx wrangler pages deploy . --project-name=webshell
```