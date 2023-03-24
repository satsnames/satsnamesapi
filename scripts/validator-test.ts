import { fetchOrdinalContent } from "../src/ordinals-api";
import { getCodePoints } from "../src/utils";
import { getSatsName, validateSnsInscription } from "../src/validator";

function testName(nameStr: string) {
  const name = getSatsName(nameStr);
  if (name === false) {
    throw new Error(`Invalid name: ${nameStr}`);
  }
  console.log(`"${name}" from "${nameStr}" (${getCodePoints(name)})`);
}

testName("satoshi.sats nakamoto.sats");
testName("sat.sats\nbat.sats");
testName("Mrs‍‍.sats");

const invalids = [
  "efd59a9a8c54a1f7f2d9752c097dfdcd052a9cda0f6b2459fd0aedc2f1ccdfbdi0",
  "71db6434a9ca13235321daf2d61faf0f14f12d5144d9c0ed2a8a62f43a4bf3adi0",
];

async function testInvalid(id: string) {
  const inscription = await fetchOrdinalContent(id);

  if (validateSnsInscription(inscription) !== false) {
    throw new Error(`Expected ${id} not to be valid`);
  }
}

async function run() {
  await Promise.all(invalids.map(testInvalid));
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
