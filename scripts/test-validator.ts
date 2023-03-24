import { fetchOrdinalContent } from "../src/ordinals-api";
import { validateSnsInscription } from "../src/validator";

const [id] = process.argv.slice(2);

async function run() {
  const content = await fetchOrdinalContent(id.toLowerCase());
  const result = validateSnsInscription(content);
  console.log(result);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
