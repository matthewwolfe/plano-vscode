import * as vscode from "vscode";
import { templates } from "./commands/templates";

export function activate(context: vscode.ExtensionContext) {
  const templatesDisposable = vscode.commands.registerCommand(
    "extension.plano-vscode.templates",
    templates
  );

  const disposables = [templatesDisposable];

  disposables.forEach((disposable) => {
    context.subscriptions.push(disposable);
  });
}

export function deactivate() {}
