import { PrismaClient } from "@prisma/client";
import PQueue from "p-queue";

const queue = new PQueue({
  concurrency: 12,
});

async function run() {
  const db = new PrismaClient();
  await db.$connect();
  const registrations = await db.registration.findMany({
    include: {
      name: true,
    },
    orderBy: {
      nameId: "asc",
    },
  });

  await Promise.all(
    registrations.map(async (r) => {
      const nameStr = r.name.name.toLowerCase();

      const found = await queue.add(
        () => db.$queryRaw<{ id: number }[]>`
        select id
        from names
        where lower(name) = ${nameStr}
        order by id asc
        limit 1
      `
      );
      if (typeof found !== "object") return;

      const [name] = found;
      if (name.id !== r.nameId) {
        console.log(`Duplicate!`, nameStr, r.name.name);

        // point inscription to correct name
        // delete 'bad' name
        // update 'good' name
        // await queue.add(async () => {
        //   await db.$transaction([
        //     // db.registration.updateMany({
        //     //   where: {
        //     //     nameId: r.nameId,
        //     //   },
        //     //   data: {
        //     //     nameId: name.id,
        //     //   },
        //     // }),
        //     // db.name.deleteMany({
        //     //   where: {
        //     //     id: r.nameId,
        //     //   },
        //     // }),
        //     // db.name.update({
        //     //   where: {
        //     //     id: name.id,
        //     //   },
        //     //   data: {
        //     //     name: nameStr,
        //     //   },
        //     // }),
        //   ]);
        // });
      }
    })
  );
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
