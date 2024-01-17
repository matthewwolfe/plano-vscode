import * as vscode from 'vscode';
import { snippets } from './commands/snippets';
import { templates } from './commands/templates';

export function activate(context: vscode.ExtensionContext) {
  const snippetsDisposable = vscode.commands.registerCommand(
    'extension.plano-vscode.snippets',
    snippets
  );

  const templatesDisposable = vscode.commands.registerCommand(
    'extension.plano-vscode.templates',
    templates
  );

  const disposables = [snippetsDisposable, templatesDisposable];

  disposables.forEach((disposable) => {
    context.subscriptions.push(disposable);
  });
}

export function deactivate() {}
