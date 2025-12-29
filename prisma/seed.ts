import { Prisma, PrismaClient, ProductStatus, ProductVisibility, OrderStatus, PaymentStatus, StockReservationStatus, StockAdjustmentReason } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const DEFAULT_CURRENCY = 'MAD';
const TAX_RATE = new Prisma.Decimal('0.2');
const SHIPPING_FEE = new Prisma.Decimal('60');
const BCRYPT_ROUNDS = 10;

async function resetDatabase() {
  await prisma.stockReservation.deleteMany();
  await prisma.stockAdjustment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.productMedia.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
}

async function seedUsers() {
  const adminPassword = await bcrypt.hash('Admin123!', BCRYPT_ROUNDS);
  const clientPassword = await bcrypt.hash('Client123!', BCRYPT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@youshop.com' },
    update: {},
    create: {
      email: 'admin@youshop.com',
      passwordHash: adminPassword,
      name: 'Platform Admin',
      role: 'ADMIN',
      isEmailVerified: true,
    },
  });

  const client = await prisma.user.upsert({
    where: { email: 'client@youshop.com' },
    update: {},
    create: {
      email: 'client@youshop.com',
      passwordHash: clientPassword,
      name: 'First Customer',
      role: 'CLIENT',
      isEmailVerified: true,
    },
  });

  return { admin, client };
}

async function seedCategories() {
  const categories = [
    {
      name: 'Running Shoes',
      slug: 'running-shoes',
      description: 'Performance footwear designed for speed and comfort.',
      metadata: { icon: '👟', audience: 'athlete' },
    },
    {
      name: 'Training Apparel',
      slug: 'training-apparel',
      description: 'Technical fabrics built for high intensity sessions.',
      metadata: { icon: '🧵', season: 'SS25' },
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Smart accessories that complete the PureShop experience.',
      metadata: { icon: '🎒' },
    },
  ];

  const created = await Promise.all(
    categories.map((category) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: {
          name: category.name,
          slug: category.slug,
          description: category.description,
          metadata: category.metadata,
        },
      }),
    ),
  );

  return created.reduce<Record<string, string>>((acc, category) => {
    acc[category.slug] = category.id;
    return acc;
  }, {});
}

async function seedProducts(categoryMap: Record<string, string>) {
  const products = [
    {
      name: 'PureRun Elite',
      slug: 'purerun-elite',
      description: 'Featherweight racing shoe engineered with a reactive foam midsole.',
      sku: 'RUN-ELITE-001',
      status: ProductStatus.ACTIVE,
      visibility: ProductVisibility.PUBLIC,
      tags: ['running', 'elite', 'carbon'],
      basePrice: '1299.00',
      compareAtPrice: '1499.00',
      taxRate: '0.20',
      lowStockThreshold: 20,
      categorySlug: 'running-shoes',
      attributes: { drop: '8mm', weight: '230g' },
      metadata: { season: 'SS25', bestseller: true },
      media: [
        {
          url: 'https://cdn.pureshop.dev/products/purerun-elite-1.jpg',
          alt: 'PureRun Elite side view',
          isPrimary: true,
        },
        {
          url: 'https://cdn.pureshop.dev/products/purerun-elite-2.jpg',
          alt: 'PureRun Elite outsole grip',
        },
      ],
      stock: { quantity: 150 },
    },
    {
      name: 'PureFlow Trainer Tee',
      slug: 'pureflow-trainer-tee',
      description: 'Seamless training T-shirt with laser-cut ventilation zones.',
      sku: 'APP-TEE-204',
      status: ProductStatus.ACTIVE,
      visibility: ProductVisibility.PUBLIC,
      tags: ['training', 'apparel'],
      basePrice: '349.00',
      compareAtPrice: null,
      taxRate: '0.20',
      lowStockThreshold: 30,
      categorySlug: 'training-apparel',
      attributes: { fit: 'Athletic', material: 'Recycled poly' },
      metadata: { unisex: true },
      media: [
        {
          url: 'https://cdn.pureshop.dev/products/pureflow-tee-front.jpg',
          alt: 'PureFlow Trainer Tee front',
          isPrimary: true,
        },
      ],
      stock: { quantity: 320 },
    },
    {
      name: 'PurePulse Smart Band',
      slug: 'purepulse-smart-band',
      description: 'Health tracking band with continuous heart-rate analytics.',
      sku: 'ACC-BAND-501',
      status: ProductStatus.ACTIVE,
      visibility: ProductVisibility.PUBLIC,
      tags: ['accessories', 'wearable'],
      basePrice: '899.00',
      compareAtPrice: '999.00',
      taxRate: '0.20',
      lowStockThreshold: 25,
      categorySlug: 'accessories',
      attributes: { battery: '7 days', sensors: 'HRV, SPO2' },
      metadata: { waterproof: 'IP68' },
      media: [
        {
          url: 'https://cdn.pureshop.dev/products/purepulse-band.jpg',
          alt: 'PurePulse Smart Band display',
          isPrimary: true,
        },
      ],
      stock: { quantity: 80 },
    },
  ];

  const seeded = [] as Array<{ product: Prisma.ProductGetPayload<{ include: { media: true } }>; stockId: string }>;

  for (const product of products) {
    const createdProduct = await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        sku: product.sku,
        status: product.status,
        visibility: product.visibility,
        tags: product.tags,
        basePrice: new Prisma.Decimal(product.basePrice),
        baseCurrency: DEFAULT_CURRENCY,
        compareAtPrice: product.compareAtPrice ? new Prisma.Decimal(product.compareAtPrice) : undefined,
        compareAtCurrency: product.compareAtPrice ? DEFAULT_CURRENCY : undefined,
        taxRate: new Prisma.Decimal(product.taxRate),
        attributes: product.attributes,
        metadata: product.metadata,
        categoryId: categoryMap[product.categorySlug],
        media: {
          create: product.media,
        },
      },
      include: { media: true },
    });

    const stockRecord = await prisma.stock.upsert({
      where: { productId: createdProduct.id },
      update: {
        quantity: product.stock.quantity,
        reserved: 0,
        lowStockThreshold: product.lowStockThreshold,
      },
      create: {
        productId: createdProduct.id,
        sku: createdProduct.sku,
        quantity: product.stock.quantity,
        reserved: 0,
        lowStockThreshold: product.lowStockThreshold,
      },
    });

    await prisma.stockAdjustment.create({
      data: {
        stockId: stockRecord.id,
        reason: StockAdjustmentReason.DELIVERY,
        quantityChange: product.stock.quantity,
        note: 'Initial inbound inventory',
      },
    });

    seeded.push({ product: createdProduct, stockId: stockRecord.id });
  }

  return seeded;
}

async function seedOrder(clientId: string, catalog: Array<{ product: Prisma.ProductGetPayload<{ include: { media: true } }>; stockId: string }>) {
  const itemsBlueprint = [
    { sku: 'RUN-ELITE-001', quantity: 2 },
    { sku: 'ACC-BAND-501', quantity: 1 },
  ];

  const orderItems = itemsBlueprint
    .map((item) => {
      const productEntry = catalog.find((entry) => entry.product.sku === item.sku);
      if (!productEntry) {
        return null;
      }

      const unitPrice = productEntry.product.basePrice as Prisma.Decimal;
      const lineTotal = unitPrice.mul(item.quantity);

      return {
        productEntry,
        payload: {
          productId: productEntry.product.id,
          sku: productEntry.product.sku,
          productName: productEntry.product.name,
          productDescription: productEntry.product.description,
          quantity: item.quantity,
          unitPrice,
          totalPrice: lineTotal,
          currency: DEFAULT_CURRENCY,
        },
      };
    })
    .filter((item): item is { productEntry: (typeof catalog)[number]; payload: { productId: string; sku: string; productName: string; productDescription: string; quantity: number; unitPrice: Prisma.Decimal; totalPrice: Prisma.Decimal; currency: string } } => Boolean(item));

  if (!orderItems.length) {
    return null;
  }

  const subtotal = orderItems.reduce((sum, item) => sum.add(item.payload.totalPrice), new Prisma.Decimal(0));
  const tax = subtotal.mul(TAX_RATE);
  const total = subtotal.add(tax).add(SHIPPING_FEE);

  const order = await prisma.order.create({
    data: {
      userId: clientId,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
      subtotal,
      tax,
      shipping: SHIPPING_FEE,
      total,
      currency: DEFAULT_CURRENCY,
      items: {
        create: orderItems.map((item) => ({
          ...item.payload,
        })),
      },
    },
    include: {
      items: true,
    },
  });

  for (const item of order.items) {
    const productRecord = catalog.find((entry) => entry.product.id === item.productId);
    if (!productRecord) {
      continue;
    }

    await prisma.stockReservation.create({
      data: {
        stockId: productRecord.stockId,
        orderId: order.id,
        quantity: item.quantity,
        status: StockReservationStatus.CONFIRMED,
      },
    });

    await prisma.stock.update({
      where: { id: productRecord.stockId },
      data: {
        quantity: { decrement: item.quantity },
        reserved: { increment: item.quantity },
      },
    });
  }

  return order;
}

async function main() {
  await resetDatabase();
  const users = await seedUsers();
  const categoryMap = await seedCategories();
  const catalog = await seedProducts(categoryMap);
  await seedOrder(users.client.id, catalog);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Seeding failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
