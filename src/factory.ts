import {makeFn} from '@snek-at/functions'
import type {SpawnOptionsWithoutStdio} from 'child_process'

export const url = process.env.IS_OFFLINE
  ? process.env.CODESPACE_NAME
    ? `https://${process.env.CODESPACE_NAME}-4020.githubpreview.dev/graphql`
    : 'http://localhost:4020/graphql'
  : `${process.env.ENDPOINT_URL_AUTHENTICATION}`

export const fn = makeFn({
  url
})

export async function spawnChild(
  command: string,
  scriptName: string,
  args?: string[],
  options?: SpawnOptionsWithoutStdio
) {
  const { spawn } = await import("child_process");
  const { fileURLToPath } = await import("url");
  const { default: path, dirname } = await import("path");

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // filepath relative to current file
  const scriptPath = path.resolve(__dirname, scriptName);

  const child = spawn(command, [scriptPath].concat(args || []), options);

  let data = "";
  for await (const chunk of child.stdout) {
    console.log("stdout chunk: " + chunk);
    data += chunk;
  }
  let error = "";
  for await (const chunk of child.stderr) {
    console.error("stderr chunk: " + chunk);
    error += chunk;
  }
  const exitCode = await new Promise((resolve, _) => {
    child.on("close", resolve);
  });

  if (exitCode) {
    throw new Error(`subprocess error exit ${exitCode}, ${error}`);
  }
  return data;
}

// SPDX-License-Identifier: (EUPL-1.2)
// Copyright © 2019-2022 snek.at
