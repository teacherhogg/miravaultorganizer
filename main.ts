import { Notice, Plugin, TFile } from "obsidian";

interface ChangeRecord {
	filePath: string;
	changes: string[];
}

export default class MiraVaultOrganizerPlugin extends Plugin {
	async onload(): Promise<void> {
		this.addCommand({
			id: "organize-vault-frontmatter",
			name: "Organize Vault Frontmatter (category & subcategory)",
			callback: () => this.runOrganizer(),
		});
	}

	private async runOrganizer(): Promise<void> {
		const allFiles: TFile[] = this.app.vault.getMarkdownFiles();
		const changedFiles: ChangeRecord[] = [];
		const errorFiles: string[] = [];

		for (const file of allFiles) {
			// Split path into segments: ["folderA", "folderB", "file.md"] or deeper
			const parts = file.path.split("/");

			// Need at least folderA/folderB/file.md → 3 parts minimum
			if (parts.length < 3) {
				continue;
			}

			const expectedCategory = parts[0];
			const expectedSubcategory = parts[1];

			try {
				const fileChanges: string[] = [];

				await this.app.fileManager.processFrontMatter(
					file,
					(fm) => {
						if (fm["category"] !== expectedCategory) {
							const old = fm["category"] ?? "(not set)";
							fm["category"] = expectedCategory;
							fileChanges.push(
								`category: "${old}" → "${expectedCategory}"`
							);
						}

						if (fm["subcategory"] !== expectedSubcategory) {
							const old = fm["subcategory"] ?? "(not set)";
							fm["subcategory"] = expectedSubcategory;
							fileChanges.push(
								`subcategory: "${old}" → "${expectedSubcategory}"`
							);
						}
					}
				);

				if (fileChanges.length > 0) {
					changedFiles.push({ filePath: file.path, changes: fileChanges });
				}
			} catch (err) {
				errorFiles.push(file.path);
				console.error(
					`MiraVaultOrganizer: error processing ${file.path}`,
					err
				);
			}
		}

		this.showSummary(changedFiles, errorFiles);
	}

	private showSummary(changed: ChangeRecord[], errors: string[]): void {
		if (changed.length > 0) {
			console.log("MiraVaultOrganizer — Changes Made:");
			for (const record of changed) {
				console.log(`  ${record.filePath}`);
				for (const c of record.changes) {
					console.log(`    • ${c}`);
				}
			}
		}

		if (errors.length > 0) {
			console.warn("MiraVaultOrganizer — Files with errors (skipped):");
			for (const path of errors) {
				console.warn(`  ${path}`);
			}
		}

		let message: string;

		if (changed.length === 0 && errors.length === 0) {
			message =
				"MiraVaultOrganizer: No changes needed. All frontmatter is correct.";
		} else if (changed.length === 0 && errors.length > 0) {
			message = `MiraVaultOrganizer: No changes made. ${errors.length} file(s) had errors — see developer console.`;
		} else {
			const totalPropChanges = changed.reduce(
				(acc, r) => acc + r.changes.length,
				0
			);
			message = `MiraVaultOrganizer: Updated ${totalPropChanges} frontmatter propert${totalPropChanges === 1 ? "y" : "ies"} across ${changed.length} file(s).`;

			if (errors.length > 0) {
				message += ` ${errors.length} file(s) had errors — see developer console.`;
			}

			message += "\n\nSee developer console (Ctrl+Shift+I) for full details.";
		}

		new Notice(message, 8000);
	}
}
