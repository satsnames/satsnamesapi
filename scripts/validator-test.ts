import { getCodePoints } from "../src/utils";
import { getSatsName } from "../src/validator";

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
