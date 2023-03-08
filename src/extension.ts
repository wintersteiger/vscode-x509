import * as vscode from "vscode";

var spawnSync = require("child_process").spawnSync;

var binary: string = "openssl";
var args: string[] = [];

function runOpenSSL() {
	let config = vscode.workspace.getConfiguration("show-x509");
	let cfgBinary: string | undefined = config.get("opensslBinary");
	let cfgArgs: string[] | undefined = config.get("opensslArguments");

	if (cfgBinary) { binary = cfgBinary; }
	if (cfgArgs) { args = cfgArgs; }

	let r: string[] = [];
	let editor = vscode.window.activeTextEditor;
	if (editor) {
		editor.edit(builder => {
			if (editor) {
				for (let sel of editor.selections) {
					let txt = editor.document.getText(sel);

					txt = txt.replace(/(?:\\r\\n|\\r|\\n)/g, '\n');
					try {
						var prc = spawnSync(binary, ["x509", "-text", ...args], {
							input: txt,
							encoding: "utf-8",
						});
					}
					catch (ex) {
						vscode.window.showErrorMessage("Exception: " + ex);
					}

					if (prc.error) {
						vscode.window.showErrorMessage("Error spawning process: " + prc.error.message);
					}
					else if (prc.stderr !== "") {
						vscode.window.showInformationMessage("stderr: " + prc.stderr);
						return r;
					}
					else {
						r.push(prc.stdout);
					}
				}
			}
		});
	}
	return r;
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand("show-x509.show-pem-certificate", () => {
			var outputs = runOpenSSL();
			for (let output of outputs) {
				vscode.workspace.openTextDocument({ content: output }).then((doc: vscode.TextDocument) => { vscode.window.showTextDocument(doc); },
					(error: any) => {
						console.error(error);
						debugger;
					});
			}
		}));
}

export function deactivate() { }
