import * as fs from 'fs';
import * as path from 'path';

const LOG_PATH = path.join(__dirname, '..', 'logs');

function fileExists(filepath: string): boolean {
    try {
        fs.statSync(filepath);
        return true;
    } catch (error) {
        return false;
    }
}

if (!fileExists(LOG_PATH)) {
    fs.mkdirSync(LOG_PATH);
}

export function log(msg: string, stream: string = 'default'): void {
    if (stream !== 'default') {
        log(msg);
    }

    const logPath = path.join(LOG_PATH, `${stream}.txt`);
    const currentContents = fileExists(logPath) ? fs.readFileSync(logPath, 'utf8') : '';

    fs.writeFileSync(logPath, `${currentContents}${new Date(Date.now()).toISOString()} - ${msg}\n`);
}
