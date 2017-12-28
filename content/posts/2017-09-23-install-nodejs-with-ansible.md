---
title: How to install NodeJS on Debian/Ubuntu systems using Ansible
date: 2017-09-23
tags: ["NodeJS", "Ansible"]
slug: install-nodejs-with-ansible
short: true
---
Since I've had to figure out how to do this twice now,
and the NodeSource instructions make this more confusing than it ought to be.
Make sure you replace `node_6.x` with the appropriate version from the
[installation instructions](https://github.com/nodesource/distributions#installation-instructions)
and `xenial` with the results of `lsb_release -s -c`.

```yaml
- name: NodeSource package key
  apt_key:
    state: present
    url: https://deb.nodesource.com/gpgkey/nodesource.gpg.key
- name: NodeSource repository
  apt_repository:
    repo: 'deb https://deb.nodesource.com/node_6.x xenial main'
- name: Install NodeJS
  apt:
    state: present
    name: nodejs
```
