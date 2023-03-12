import { fetchOrdinals, filterInscriptions } from "../src/ordinals-api";

const [indexStr] = process.argv.slice(2);

async function run() {
  const index = indexStr ? parseInt(indexStr) : 203000;
  const list = await fetchOrdinals(index - 1);
  const filtered = await filterInscriptions(list);
  console.log(filtered);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
