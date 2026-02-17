import fs from "fs/promises";

const filePath = "./employees.json";

const readFromFile = async () => {
    try {
        const data = await fs.readFile(filePath, "utf-8");
        if (!data) return [];
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading file:", err);
        return [];
    }
};

const writeFromFile = async (data) => {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error("Error writing file:", err);
    }
};

export { readFromFile, writeFromFile };
