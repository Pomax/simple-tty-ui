import { appendFileSync } from "node:fs";

export function log(string) {
  appendFileSync(`log.txt`, string + `\n`, { encoding: `utf-8` });
}
