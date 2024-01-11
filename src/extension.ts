import * as path from 'node:path';
import { Worker } from 'node:worker_threads';
import * as url from 'node:url';
import * as vscode from 'vscode';
import { getAllPaths, getTemplate } from 'plano-cli';
import { input } from './input';
import { selection } from './selection';

const worker = new Worker(
  url.pathToFileURL(path.join(__dirname, '/worker/worker.js'))
);

export function activate(context: vscode.ExtensionContext) {
  let disposableStatus: vscode.Disposable | undefined;

  const disposable = vscode.commands.registerCommand(
    'extension.plano-vscode.templates',
    async (contextMenu) => {
      try {
        const templatePaths = getAllPaths([]);

        const name = await selection(
          templatePaths.map((templatePath) => ({
            label: templatePath.template,
            value: templatePath.template,
          }))
        );

        const template = getTemplate({ name, paths: [] });

        worker.on('message', async ({ type, ...args }) => {
          switch (type) {
            case 'context-prompts': {
              const { prompts } = args;

              const contextValues = new Map<string, string>();

              for (const prompt of prompts) {
                if (prompt.type === 'input') {
                  const answer = await input({
                    title: prompt.message,
                  });

                  contextValues.set(prompt.name, answer);
                }
              }

              disposableStatus = vscode.window.setStatusBarMessage(
                `Generating template "${template.template}"`
              );

              return worker.postMessage({
                type: 'generate',
                data: {
                  copyToPath: contextMenu.path,
                  context: Object.fromEntries(contextValues),
                  modulePath: path.resolve(
                    `${template.path}/${template.template}`,
                    'context.mjs'
                  ),
                  template,
                },
              });
            }

            case 'generate-success': {
              if (disposableStatus) {
                return disposableStatus.dispose();
              }
            }

            default: {
              vscode.window.showErrorMessage('Something went wrong');
            }
          }
        });

        worker.postMessage({
          type: 'import',
          data: {
            modulePath: path.resolve(
              `${template.path}/${template.template}`,
              'context.mjs'
            ),
          },
        });
      } catch (e) {
        vscode.window.showErrorMessage(e as string);
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
