import * as vscode from 'vscode';
import * as path from 'path';

interface CommandContext {
    subscriptions: { push(disposable: vscode.Disposable): void };
}

function activate(context: CommandContext): void {
    // Command for internal file picker menu
    let internalFilePicker = vscode.commands.registerCommand('path-adder.internalFilePicker', async () => {
        try {
            // Step 1: Get all files in the workspace
            const workspaceFiles: vscode.Uri[] = await vscode.workspace.findFiles('**/*', '**/node_modules/**'); // Avoid node_modules

            if (workspaceFiles.length === 0) {
                vscode.window.showErrorMessage('No files found in the workspace.');
                return;
            }

            // Step 2: Show the file picker
            const fileChoice = await vscode.window.showQuickPick(workspaceFiles.map(file => file.fsPath), {
                placeHolder: 'Select a file to insert its path'
            });

            if (!fileChoice) {
                return; // User canceled the file selection
            }

            const selectedPath = fileChoice;

            // Step 3: Ask for slash direction (forward or backward)
            const slashChoice: string | undefined = await vscode.window.showQuickPick(['Forward Slash (/)', 'Backward Slash (\\)'], {
                placeHolder: 'Choose slash direction'
            });

            if (!slashChoice) {
                return; // User canceled the prompt
            }

            const slash: string = slashChoice === 'Forward Slash (/)' ? '/' : '\\';

            // Step 4: Ask for path type (relative or absolute)
            const pathTypeChoice: string | undefined = await vscode.window.showQuickPick(['Relative Path', 'Absolute Path'], {
                placeHolder: 'Choose path type'
            });

            if (!pathTypeChoice) {
                return; // User canceled the prompt
            }

            let finalPath: string = '';
            if (pathTypeChoice === 'Absolute Path') {
                finalPath = selectedPath.split(path.sep).join(slash);
            } else {
                const workspaceFolder: string = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';
                if (workspaceFolder) {
                    finalPath = path.relative(workspaceFolder, selectedPath).split(path.sep).join(slash);
                }
            }

            // Step 5: Ask for quote type (single, double, or none)
            const quoteChoice: string | undefined = await vscode.window.showQuickPick(['Double Quotes ("")', 'Single Quotes (\'\')', 'No Quotes'], {
                placeHolder: 'Choose quote style for the path'
            });

            if (!quoteChoice) {
                return; // User canceled the prompt
            }

            if (quoteChoice === 'Double Quotes ("")') {
                finalPath = `"${finalPath}"`;
            } else if (quoteChoice === 'Single Quotes (\'\')') {
                finalPath = `'${finalPath}'`;
            }

            // Step 6: Insert path at the cursor's current position
            const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
            if (editor) {
                editor.edit((editBuilder: vscode.TextEditorEdit) => {
                    editBuilder.insert(editor.selection.active, finalPath);
                });
            }
        } catch (err) {
            if (err instanceof Error) {
                vscode.window.showErrorMessage('Error: ' + err.message);
            } else {
                vscode.window.showErrorMessage('An unknown error occurred.');
            }
        }
    });

    // Command for file explorer
    let fileExplorer = vscode.commands.registerCommand('path-adder.fileExplorer', async () => {
        try {
            // Open file explorer dialog
            const fileUri: vscode.Uri[] | undefined = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                openLabel: 'Select File'
            });

            if (!fileUri || fileUri.length === 0) {
                return; // No file selected
            }

            const selectedFile: vscode.Uri = fileUri[0];
            const selectedPath: string = selectedFile.fsPath;

            // The rest is the same as before
            const slashChoice: string | undefined = await vscode.window.showQuickPick(['Forward Slash (/)', 'Backward Slash (\\)'], {
                placeHolder: 'Choose slash direction'
            });

            if (!slashChoice) {
                return;
            }

            const slash: string = slashChoice === 'Forward Slash (/)' ? '/' : '\\';

            const pathTypeChoice: string | undefined = await vscode.window.showQuickPick(['Relative Path', 'Absolute Path'], {
                placeHolder: 'Choose path type'
            });

            if (!pathTypeChoice) {
                return;
            }

            let finalPath: string = '';
            if (pathTypeChoice === 'Absolute Path') {
                finalPath = selectedPath.split(path.sep).join(slash);
            } else {
                const workspaceFolder: string = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';
                if (workspaceFolder) {
                    finalPath = path.relative(workspaceFolder, selectedPath).split(path.sep).join(slash);
                }
            }

            // Step 5: Ask for quote type (single, double, or none)
            const quoteChoice: string | undefined = await vscode.window.showQuickPick(['Double Quotes ("")', 'Single Quotes (\'\')', 'No Quotes'], {
                placeHolder: 'Choose quote style for the path'
            });

            if (!quoteChoice) {
                return; // User canceled the prompt
            }

            if (quoteChoice === 'Double Quotes ("")') {
                finalPath = `"${finalPath}"`;
            } else if (quoteChoice === 'Single Quotes (\'\')') {
                finalPath = `'${finalPath}'`;
            }

            // Step 6: Insert path at the cursor's current position
            const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
            if (editor) {
                editor.edit((editBuilder: vscode.TextEditorEdit) => {
                    editBuilder.insert(editor.selection.active, finalPath);
                });
            }
        } catch (err) {
            if (err instanceof Error) {
                vscode.window.showErrorMessage('Error: ' + err.message);
            } else {
                vscode.window.showErrorMessage('An unknown error occurred.');
            }
        }
    });

    context.subscriptions.push(internalFilePicker);
    context.subscriptions.push(fileExplorer);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
