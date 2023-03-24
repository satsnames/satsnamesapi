import { InvalidRemover } from "../src/invalid-remover";

async function run() {
  const remover = await InvalidRemover.create();

  await remover.run();

  console.log(`Removed ${remover.removed.length} registrations`);

  remover.removed.forEach((id) => console.log(id));
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
