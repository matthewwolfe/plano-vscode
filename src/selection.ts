import * as vscode from 'vscode';

interface Item {
  label: string;
  value: string;
}

async function selection(items: Item[]): Promise<string> {
  return new Promise((resolve) => {
    const quickPick = vscode.window.createQuickPick();

    quickPick.items = items;

    quickPick.onDidChangeSelection((selection) => {
      const selected = selection[0] as Item;

      if (selected) {
        quickPick.hide();
        resolve(selected.value);
      }
    });

    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
  });
}

export { selection };
