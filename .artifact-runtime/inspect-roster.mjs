import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const source = "C:/Users/林典瑋 Kelly Lin/Downloads/團員名單.xlsx";
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(source));
const result = [];
for (const name of ["北區", "中區", "南區"]) {
  const sheet = workbook.worksheets.getItem(name);
  const rows = sheet.getUsedRange(true).values;
  const members = rows.slice(1).filter(row => String(row[1] ?? "").trim()).map(row => ({
    church: String(row[0] ?? "").trim(),
    name: String(row[1] ?? "").trim(),
    region: name.replace("區", ""),
    voice: String(row[3] ?? "").trim(),
    nature: String(row[4] ?? "團員").trim() || "團員",
  }));
  result.push({ sheet: name, count: members.length, members });
}
const all = result.flatMap(group => group.members);
const duplicates = [...new Set(all.map(member => member.name).filter((name, index, names) => names.indexOf(name) !== index))];
console.log(JSON.stringify({ groups: result, total: all.length, duplicates }, null, 2));
