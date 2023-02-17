import * as vscode from "vscode";

function runOpenSSL() {
	console.log("runOpenSSL");
	let r: string[] = [];
	let editor = vscode.window.activeTextEditor;
	if (editor) {
		editor.edit(builder => {
			if (editor) {
				for (let sel of editor.selections) {
					let txt = editor.document.getText(sel);

					txt = txt.replace(/(?:\\r\\n|\\r|\\n)/g, '\n');

					var spawnSync = require("child_process").spawnSync;
					var prc = spawnSync("openssl", ["x509", "-text", "-nocert"], {
						input: txt,
						encoding: "utf-8",
					});

					if (prc.stderr !== "") {
						vscode.window.showInformationMessage("Errors: " + prc.stderr);
						return r;
					}
					else {
						console.log(prc.stdout);
						r.push(prc.stdout);
					}
				}
			}
		});
	}
	return r;
}


export function activate(context: vscode.ExtensionContext) {
	console.log("pushing");
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

// This method is called when your extension is deactivated
export function deactivate() { }
