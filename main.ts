const inputPath = "icons";
const outputPath = "dst";

// ==== GET FILES ==== 
const svgList: Record<string, Record<string, Record<string, string>>> = {};
const promises: Promise<void>[] = [];
for await (const versionEntry of Deno.readDir(inputPath)) {
	if (!versionEntry.isDirectory) continue;

	const version = versionEntry.name;
	const versionPath = inputPath + "/" + version;

	svgList[version] = {};

	for await (const iconSetEntry of Deno.readDir(versionPath)) {
		if (!iconSetEntry.isDirectory) continue;

		const iconSet = iconSetEntry.name;
		const iconSetPath = versionPath + "/" + iconSet;

		svgList[version][iconSet] = {};
		
		for await (const iconEntry of Deno.readDir(iconSetPath)) {
			if (!iconEntry.isFile) continue;

			const icon = iconEntry.name
			const iconPath = iconSetPath + "/" + iconEntry.name;

			promises.push(Deno.readTextFile(iconPath).then((text) => {
				const stripped = text.replace(/<!--[\s\S]*?-->/g, "");
				svgList[version][iconSet][icon] = stripped;
			}));
		}
	}
}
await Promise.all(promises);

const files = new Map<string, string>();
const filePath = outputPath + "/index.js";
const declarationPath = outputPath + "/index.d.ts";

let fileText = "// Icons provided by Font Awesome at https://fontawesome.com/\n";
let declarationText = fileText;

for (const [version, iconSets] of Object.entries(svgList)) {
	for (const [iconSet, icons] of Object.entries(iconSets)) {
		for (const [icon, svg] of Object.entries(icons)) {
			const iconCamelCase = icon
			.replace(/\.svg$/, "")
			.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
			.replaceAll("-", "");
			
			const variableName = `${version}_${iconSet}_${iconCamelCase}`;

			fileText += `export const ${variableName} = \`${svg}\`;\n`;
			declarationText += `export const ${variableName}: string;\n`;
		}
	}
}

files.set(filePath, fileText);
files.set(declarationPath, declarationText);


// write files
for (const [path, text] of files) {
	await Deno.mkdir(path.split("/").slice(0, -1).join("/"), { recursive: true });
	await Deno.writeTextFile(path, text);
}