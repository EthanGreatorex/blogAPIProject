import { prisma } from "./prismaClient";

async function main() {
  const user = await prisma.user.findFirst({ where: { email: "test@gmail.com" } });

  if (!user) {
    throw new Error('User "ethan" not found');
  }

  await prisma.post.createMany({
    data: [
      {
        title: "First Test Post",
        content: "This is a test post by Ethan.",
        published: true,
        authorId: user.id,
      },
      {
        title: "Second Test Post",
        content: "Another post for testing.",
        published: true,
        authorId: user.id,
      },
      {
        title: "Third Test Post",
        content: "Another post for testing.",
        published: false,
        authorId: user.id,
      },
    ],
  });

  console.log("Test posts added!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
