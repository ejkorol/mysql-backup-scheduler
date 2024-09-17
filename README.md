# Script to automate Database Backups

This script automates database backups for mysql to save to a local directory, and SCP these to a local machine running on the same network.

Backups are done daily via *mysqldump* executed on *cron* and managed on *pm2*.

## Dependencies

### NPM

To install npm dependencies run:

```bash
$ npm i
```

### Machine Dependencies

1. *sshpass*:

```bash
$ sudo apt-get install sshpass
```

2. *pm2*

```bash
$ npm i -g pm2
```

### ENV

## Running / Setup

1. Update the env variables in a new `.env` file based on `.env.sample` in the root direcotry.

2. *Compile typescript*

```bash
$ npm run build
```

3. *start pm2 process*

```bash
$ pm2 start build/index.js
```

4. *check if backup service is running*

_Check if services running_

```bash
$ pm2 list
```

_Check logs_

```bash
$ pm2 log
```

## Cron Scheduler

Below are some cron matches for running the backup scheduler

1. *Every hour*

```bash
0 * * * *
```

2. *Every Sunday at 3:00 AM*

```bash
0 3 * * 0
```

3. *Every day at 6:00 PM*

```bash
0 18 * * *
```
