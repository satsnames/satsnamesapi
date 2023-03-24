import { ContentUpdater } from "../src/content-updater";

async function run() {
  const updater = await ContentUpdater.create();

  await updater.run();

  console.log(`Updated ${updater.updated.length}`);

  updater.updated.forEach((i) => console.log(i));
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
