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
	const runTestCmd = vscode.commands.registerCommand(
		"pytest-run.runTest",
		() => {
			const editor = vscode.window.activeTextEditor!
			const document = editor.document
			const filePath = document.fileName

			if (document.languageId !== "python") {
				return
			}

			const currentPosition = editor?.selection.active
			const lineText = document.lineAt(currentPosition.line).text

			const terminal = vscode.window.activeTerminal
			const testText = generateTestTextFromLine({
				filePath,
				line: lineText,
				runFile: false,
			})
			if (!testText) {
				vscode.window.showInformationMessage("Not on a test func def line")
			} else {
				terminal?.sendText(testText)
			}
		}
	)

	const runTestFileCmd = vscode.commands.registerCommand(
		"pytest-run.fileRun",
		() => {
			const editor = vscode.window.activeTextEditor!
			const document = editor.document
			const filePath = document.fileName

			if (document.languageId !== "python") {
				return
			}
			const terminal = vscode.window.activeTerminal

			const testText = generateTestTextFromLine({
				runFile: true,
				filePath,
			})
			if (testText) {
				terminal?.sendText(testText)
			}
		}
	)
	console.log(runTestCmd, runTestFileCmd)

	context.subscriptions.push(runTestCmd)
	context.subscriptions.push(runTestFileCmd)
}

// this method is called when your extension is deactivated
export function deactivate() {}

type TestCmdOptions = {
	runFile: boolean
	filePath: string
	line?: string | undefined
}

function generateTestTextFromLine(opts: TestCmdOptions) {
	if (opts.runFile) {
		return `pipenv run pytest -k ${opts.filePath}`
	} else {
		if (!opts.line) {
			return
		}
		const funcName = getPythonFuncNameFromLine(opts.line)
		if (funcName) {
			return `pipenv run pytest -k "${funcName}" ${opts.filePath}`
		}
	}
}

function getPythonFuncNameFromLine(line: string) {
	const regex = new RegExp(/def (\w+)\(/)
	const options = regex.exec(line)
	if (options === null || options.length < 2) {
		return
	}

	const funcName = options[1]
	return funcName
}
