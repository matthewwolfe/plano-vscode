import * as vscode from 'vscode';

interface InputParams {
  placeHolder?: string;
  prompt?: string;
  title: string;
}

async function input({
  placeHolder = '',
  prompt = '',
  title,
}: InputParams): Promise<string> {
  return (
    (await vscode.window.showInputBox({
      placeHolder,
      prompt,
      title,
      value: '',
    })) || ''
  );
}

export { input };
