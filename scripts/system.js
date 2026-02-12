export const fileContents = {
    'about.txt': `
# Lan Lebar
bla bla bla

# Tian Istenič
bla bla bla

# Kristjan Kumlanc
bla bla bla

# Žan Krajnc
bla bla bla
    `
};
export const fileSystem = {
    '/': {
        type: 'dir',
        children: {
            'bin': { type: 'dir', children: {} },
            'boot': { type: 'dir', children: {} },
            'dev': { type: 'dir', children: {} },
            'etc': { type: 'dir', children: {
                'hostname': { type: 'file', content: 'localhost' },
                'hosts': { type: 'file', content: '127.0.0.1 localhost' },
                'resolv.conf': { type: 'file', content: 'nameserver 8.8.8.8' },
                'shadow': { type: 'file', content: 'root:$6$randomsalt$hashedpassword:18295:0:99999:7:::' },
                'passwd': { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash' },
                'group': { type: 'file', content: 'root:x:0:' },
                'gshadow': { type: 'file', content: 'root:!::' },
                'init.d': { type: 'dir', children: {} }
            } },
            'home': {
                type: 'dir',
                children: {
                    'user': {
                        type: 'dir',
                        children: {
                            '.env': { type: 'file', content: '8' },
                            'about.txt': { type: 'file', content: fileContents['about.txt'] }
                        }
                    }
                }
            },
            'lib': { type: 'dir', children: {} },
            'media': { type: 'dir', children: {} },
            'mnt': { type: 'dir', children: {} },
            'opt': { type: 'dir', children: {} },
            'root': { type: 'dir', children: {} },
            'proc': { type: 'dir', children: {} },
            'sbin': { type: 'dir', children: {} },
            'srv': { type: 'dir', children: {} },
            'sys': { type: 'dir', children: {} },
            'tmp': { type: 'dir', children: {} },
            'usr': { type: 'dir', children: {
                'bin': { type: 'dir', children: {} },
                'lib': { type: 'dir', children: {} },
                'local': { type: 'dir', children: {} },
                'share': { type: 'dir', children: {} },
                'src': { type: 'dir', children: {} }
            } },
            'var': { type: 'dir', children: {
                'cache': { type: 'dir', children: {} },
                'lock': { type: 'dir', children: {} },
                'log': { type: 'dir', children: {} },
                'spool': { type: 'dir', children: {} },
                'tmp': { type: 'dir', children: {} },
            } }
        }
    }
};
