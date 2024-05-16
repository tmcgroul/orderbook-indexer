import { run } from "@subsquid/batch-processor";
import { augmentBlock } from "@subsquid/fuel-objects";
import { DataSourceBuilder } from "@subsquid/fuel-stream";
import { TypeormDatabase } from "@subsquid/typeorm-store";
import { assertNotNull } from "@subsquid/util-internal";
import { BN } from "@fuel-ts/math";
import { TransactionResultReceipt, Provider, ReceiptLogData, ReceiptType } from "fuels";
import { handleOrderbookReceipts } from "./handlers/handleOrderbookReceipts";
import { OrderbookAbi, OrderbookAbi__factory } from "./sdk/blockchain/fuel/types/orderbook";
import { ORDERBOOK_ID, START_BLOCK } from "./config";

let orderbookAbi: OrderbookAbi | undefined;

async function getOrderbookAbi(): Promise<OrderbookAbi> {
  if (orderbookAbi) {
    return orderbookAbi;
  }

  const provider = await Provider.create("https://beta-5.fuel.network/graphql");
  const abi = OrderbookAbi__factory.connect(ORDERBOOK_ID, provider);
  return abi;
}

const dataSource = new DataSourceBuilder()
  .setGraphql({
    url: "https://beta-5.fuel.network/graphql",
    strideConcurrency: 2,
    strideSize: 50,
  })
  .setGateway("https://v2.archive.subsquid.io/network/fuel-stage-5")
  .setBlockRange({ from: parseInt(START_BLOCK) })
  .setFields({
    transaction: {
      status: true,
    },
    receipt: {
      receiptType: true,
      contract: true,
      digest: true,
      is: true,
      len: true,
      pc: true,
      ptr: true,
      ra: true,
      rb: true,
      data: true,
    },
  })
  .addReceipt({
    contract: [ORDERBOOK_ID],
    type: ["LOG_DATA"],
    transaction: true,
  })
  .build();

const database = new TypeormDatabase();

run(dataSource, database, async (ctx) => {
  const abi = await getOrderbookAbi();
  const blocks = ctx.blocks.map(augmentBlock);
  const receipts: (ReceiptLogData & { data: string })[] = [];

  for (const block of blocks) {
    for (const receipt of block.receipts) {
      if (receipt.contract == ORDERBOOK_ID && receipt.transaction?.status.type != "FailureStatus") {
        receipts.push({
          type: ReceiptType.LogData,
          digest: assertNotNull(receipt.digest),
          id: receipt.contract,
          is: new BN(receipt.is?.toString()),
          len: new BN(receipt.len?.toString()),
          pc: new BN(receipt.pc?.toString()),
          ptr: new BN(receipt.ptr?.toString()),
          val0: new BN(receipt.ra?.toString()),
          val1: new BN(receipt.rb?.toString()),
          data: assertNotNull(receipt.data),
        });
      }
    }
  }

  await handleOrderbookReceipts(receipts as TransactionResultReceipt[], abi);
});
