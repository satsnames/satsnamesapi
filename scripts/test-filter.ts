// import { fetchOrdinals, filterInscriptions } from "../src/ordinals-api";
import { fetchAndFilterInscriptions } from "../src/ord-api";

const [indexStr] = process.argv.slice(2);

async function run() {
  const index = indexStr ? parseInt(indexStr) : 203000;
  const filtered = await fetchAndFilterInscriptions(index - 1);
  // const list = await fetchOrdinals(index - 1);
  // const filtered = await filterInscriptions(list);
  console.log(filtered.inscriptions.map((i) => i._name));
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
