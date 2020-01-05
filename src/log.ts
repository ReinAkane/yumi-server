import * as fs from 'fs';
import * as path from 'path';

const LOG_PATH = path.join(__dirname, '..', 'log.txt');

function fileExists(filepath: string): boolean {
    try {
        fs.statSync(filepath);
        return true;
    } catch (error) {
        return false;
    }
}

export function log(msg: string): void {
    const currentContents = fileExists(LOG_PATH) ? fs.readFileSync(LOG_PATH, 'utf8') : '';

    fs.writeFileSync(LOG_PATH, `${currentContents}${new Date(Date.now()).toISOString()} - ${msg}\n`);
}
