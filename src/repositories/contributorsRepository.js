const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const dataFilePath = path.resolve(__dirname, "../../data/contribuintes.json");

async function readAll() {
  const raw = await fs.readFile(dataFilePath, "utf-8");
  return JSON.parse(raw);
}

async function writeAll(contributors) {
  await fs.writeFile(dataFilePath, `${JSON.stringify(contributors, null, 2)}\n`, "utf-8");
}

async function list() {
  return readAll();
}

async function findById(id) {
  const contributors = await readAll();
  return contributors.find((item) => item.id === id) || null;
}

async function create(payload) {
  const contributors = await readAll();
  const contributor = {
    id: randomUUID(),
    ...payload
  };
  contributors.push(contributor);
  await writeAll(contributors);
  return contributor;
}

async function update(id, payload) {
  const contributors = await readAll();
  const index = contributors.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  const updated = {
    ...contributors[index],
    ...payload,
    id
  };

  contributors[index] = updated;
  await writeAll(contributors);
  return updated;
}

async function remove(id) {
  const contributors = await readAll();
  const index = contributors.findIndex((item) => item.id === id);

  if (index === -1) {
    return false;
  }

  contributors.splice(index, 1);
  await writeAll(contributors);
  return true;
}

module.exports = {
  list,
  findById,
  create,
  update,
  remove
};
