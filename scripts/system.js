export const fileContents = {
    'about.txt': `<h1>Lan Lebar</h1>
Computer science student at <a href="https://fri.uni-lj.si/sl" target="_blank">FRI</a> && part time software developer - interested in cybersecurity, UX/UI design and frontend software development.
Projects: <a href="https://www.potegni.me" target="_blank">potegni.me</a>, <a href="https://lan.si" target="_blank">lan.si</a>, and more on my GitHub: <a href="https://github.com/lebaaar" target="_blank">GitHub</a>

<h1>Tian Istenič</h1>
bla bla bla

<h1>Kristjan Kumlanc</h1>
bla bla bla

<h1>Žan Krajnc</h1>
bla bla bla`
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
                            'Secrets': {
                                type: 'dir',
                                children: {
                                    '.env': { type: 'file', content: '8' },
                                }
                            },
                            'Documents': {
                                type: 'dir',
                                children: {
                                    'empty.txt': { type: 'file', content: 'A sad, empty file.' },
                                }
                            },
                            'Pictures': {
                                type: 'dir',
                                children: {
                                    'lan.jpg': { type: 'file', content: '<img src="resources/lan.jpeg" alt="Lan Lebar" width="200" />' },
                                    'tian.jpg': { type: 'file', content: '<img src="resources/tian.jpeg" alt="Tian Istenič" width="200" />' },
                                    'kristjan.jpg': { type: 'file', content: '<img src="resources/kristjan.jpeg" alt="Kristjan Kumlanc" width="200" />' },
                                    'zan.jpg': { type: 'file', content: '<img src="resources/zan.jpeg" alt="Žan Krajnc" width="200" />' },
                                }
                            },
                            'Desktop': {
                                type: 'dir',
                                children: {
                                    'empty.txt': { type: 'file', content: 'A sad, empty file.' },
                                }
                            },
                            'Downloads': {
                                type: 'dir',
                                children: {
                                    'empty.txt': { type: 'file', content: 'A sad, empty file.' },
                                }
                            },
                            'Homework': {
                                type: 'dir',
                                children: {
                                    '100GB_file.txt': { type: 'file', content: 'Definitely homework related... Nothing to see here' },
                                }
                            },
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
            }
        }
        }
    }
};
