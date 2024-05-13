import { run } from "@subsquid/batch-processor";
import { augmentBlock } from "@subsquid/fuel-objects";
import { DataSourceBuilder } from "@subsquid/fuel-stream";
import { TypeormDatabase } from "@subsquid/typeorm-store";

const dataSource = new DataSourceBuilder()
  .setGraphql({
    url: "https://beta-5.fuel.network/graphql",
    strideConcurrency: 2,
    strideSize: 50,
  })
  .setGateway("https://v2.archive.subsquid.io/network/fuel-stage-5")
  .includeAllBlocks()
  .addTransaction({})
  .build();

const database = new TypeormDatabase();

run(dataSource, database, async (ctx) => {
  const blocks = ctx.blocks.map(augmentBlock);

  for (const block of blocks) {
    console.log(block.header.height);
  }
});
