// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode"

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log("pytest-run is now activated")

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand("pytest-run.runTest", () => {
		// The code you place here will be executed every time your command is executed
		const editor = vscode.window.activeTextEditor!
		const document = editor.document
		const filePath = document.fileName

		if (document.languageId !== "python") {
			return
		}

		const currentPosition = editor?.selection.active
		const lineText = document.lineAt(currentPosition.line).text

		const terminal = vscode.window.activeTerminal

		const testText = generateTestTextFromLine(lineText, filePath)
		if (!testText) {
			vscode.window.showInformationMessage("Not on a test func def line")
		} else {
			terminal?.sendText(testText)
		}

		// Display a message box to the user
	})

	context.subscriptions.push(disposable)
}

// this method is called when your extension is deactivated
export function deactivate() {}

function generateTestTextFromLine(line: string | undefined, fileName: string) {
	if (!line) {
		return
	}

	const regex = new RegExp(/def (\w+)\(/)
	const options = regex.exec(line)
	if (options === null || options.length < 2) {
		return
	}

	const func_name = options[1]
	return `pipenv run pytest -k "${func_name}" ${fileName}`
}
