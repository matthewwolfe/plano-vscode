import * as vscode from 'vscode';
import { compileTemplate, getAllPaths, getTemplate } from 'plano-cli';
import { selection } from '../selection';

async function snippets(contextMenu: vscode.Uri) {
  try {
    const templatePaths = getAllPaths({
      paths: [],
      type: 'snippet',
    });

    const name = await selection(
      templatePaths.map((templatePath) => ({
        label: templatePath.template,
        value: templatePath.template,
      }))
    );

    const snippet = getTemplate({
      name,
      paths: [],
      type: 'snippet',
    });

    const activeEditor = vscode.window.activeTextEditor;

    if (!activeEditor) {
      return;
    }

    const currentPosition = new vscode.Position(
      activeEditor.selection.active.line,
      activeEditor.selection.active.character
    );

    const value = compileTemplate({
      context: {},
      path: `${snippet.path}/${snippet.template}/snippet.handlebars`,
    });

    activeEditor.edit((editBuilder) => {
      editBuilder.insert(currentPosition, value);
    });
  } catch (e) {
    vscode.window.showErrorMessage(e as string);
  }
}

export { snippets };
