import * as vscode from 'vscode';
import * as path from 'node:path';
import { getAllPaths, getTemplate } from 'plano-cli';
import { input } from '../input';
import { selection } from '../selection';
import { worker } from '../worker';

async function templates(contextMenu: vscode.Uri) {
  let disposableStatus: vscode.Disposable | undefined;

  try {
    const templatePaths = getAllPaths({
      paths: [],
      type: 'file',
    });

    const name = await selection(
      templatePaths.map((templatePath) => ({
        label: templatePath.template,
        value: templatePath.template,
      }))
    );

    const template = getTemplate({
      name,
      paths: [],
      type: 'file',
    });

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

export { templates };
