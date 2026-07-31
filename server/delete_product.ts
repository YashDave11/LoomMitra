import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Finding product...');
  const products = await prisma.product.findMany({
    where: {
      title: {
        contains: 'rasham',
        mode: 'insensitive'
      },
      user: {
        weaverProfile: {
          name: {
            contains: 'yash',
            mode: 'insensitive'
          }
        }
      }
    }
  });

  if (products.length === 0) {
    console.log('No matching product found.');
    return;
  }

  const productId = products[0].id;
  console.log(`Found product "${products[0].title}" (ID: ${productId}). Deleting relations...`);
  
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
