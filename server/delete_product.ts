import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const productId = '7029d569-0c89-4a8d-ba23-5577a0d0c4aa';
  
  console.log(`Deleting relations for product ${productId}...`);
  
  // Delete CustomerOrderItems
  const customerOrderItems = await prisma.customerOrderItem.deleteMany({ where: { productId } });
  console.log(`Deleted ${customerOrderItems.count} CustomerOrderItems`);
  
  // Delete BulkOrderRequests
  const bulkOrders = await prisma.bulkOrderRequest.deleteMany({ where: { productId } });
  console.log(`Deleted ${bulkOrders.count} BulkOrderRequests`);
  
  // Delete Auctions
  const auctions = await prisma.auction.deleteMany({ where: { productId } });
  console.log(`Deleted ${auctions.count} Auctions`);
  
  // MediaAssets have onDelete: Cascade, but let's be safe
  const mediaAssets = await prisma.mediaAsset.deleteMany({ where: { productId } });
  console.log(`Deleted ${mediaAssets.count} MediaAssets`);
  
  // Finally, delete the Product
  await prisma.product.delete({ where: { id: productId } });
  console.log('Successfully deleted the product!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
