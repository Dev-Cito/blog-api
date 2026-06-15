import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { Post, PostStatus } from '../../posts/entities/post.entity';
import * as bcrypt from 'bcrypt';

config();
const configService = new ConfigService();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: [User, Category, Tag, Post],
  synchronize: false,
  ssl: configService.get('NODE_ENV') === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

async function runSeeds() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const userRepo = AppDataSource.getRepository(User);
    const categoryRepo = AppDataSource.getRepository(Category);
    const tagRepo = AppDataSource.getRepository(Tag);
    const postRepo = AppDataSource.getRepository(Post);

    // Users
    let admin = await userRepo.findOne({ where: { email: 'admin@blog.com' } });
    if (!admin) {
      admin = userRepo.create({
        email: 'admin@blog.com',
        password: await bcrypt.hash('Admin@123456', 12),
        name: 'Admin',
        role: 'admin',
      });
      await userRepo.save(admin);
      console.log('Created user: admin@blog.com');
    }

    let author = await userRepo.findOne({ where: { email: 'author@blog.com' } });
    if (!author) {
      author = userRepo.create({
        email: 'author@blog.com',
        password: await bcrypt.hash('Author@123456', 12),
        name: 'John Author',
        role: 'user',
      });
      await userRepo.save(author);
      console.log('Created user: author@blog.com');
    }

    // Categories
    const categoriesData = [
      { name: 'Technology', slug: 'technology', description: 'Tech articles' },
      { name: 'Programming', slug: 'programming', description: 'Programming tutorials' },
      { name: 'Design', slug: 'design', description: 'Design articles' },
    ];

    const categories: Category[] = [];
    for (const cat of categoriesData) {
      let category = await categoryRepo.findOne({ where: { slug: cat.slug } });
      if (!category) {
        category = categoryRepo.create(cat);
        await categoryRepo.save(category);
        console.log(`Created category: ${cat.name}`);
      }
      categories.push(category);
    }

    // Tags
    const tagsData = [
      { name: 'NestJS', slug: 'nestjs' },
      { name: 'Next.js', slug: 'nextjs' },
      { name: 'TypeScript', slug: 'typescript' },
      { name: 'PostgreSQL', slug: 'postgresql' },
      { name: 'Docker', slug: 'docker' },
    ];

    const tags: Tag[] = [];
    for (const t of tagsData) {
      let tag = await tagRepo.findOne({ where: { slug: t.slug } });
      if (!tag) {
        tag = tagRepo.create(t);
        await tagRepo.save(tag);
        console.log(`Created tag: ${t.name}`);
      }
      tags.push(tag);
    }

    // Posts
    const postsData = [
      {
        title: 'Getting Started with NestJS',
        slug: 'getting-started-with-nestjs',
        content: 'NestJS is a progressive Node.js framework for building efficient and scalable server-side applications. In this article we will explore the core concepts of NestJS including modules, controllers, and services.',
        excerpt: 'Learn the basics of NestJS framework',
        status: PostStatus.PUBLISHED,
        author: admin,
        category: categories[1],
        tags: [tags[0], tags[2]],
      },
      {
        title: 'Building a Blog with Next.js',
        slug: 'building-a-blog-with-nextjs',
        content: 'Next.js is a React framework that enables server-side rendering and static site generation. In this tutorial we will build a complete blog application with Next.js and TypeScript.',
        excerpt: 'Build a full blog with Next.js',
        status: PostStatus.PUBLISHED,
        author: author,
        category: categories[0],
        tags: [tags[1], tags[2]],
      },
      {
        title: 'PostgreSQL Best Practices',
        slug: 'postgresql-best-practices',
        content: 'PostgreSQL is one of the most powerful open-source relational databases. Learn about indexing, query optimization, and best practices for production deployments.',
        excerpt: 'PostgreSQL tips for production',
        status: PostStatus.DRAFT,
        author: admin,
        category: categories[1],
        tags: [tags[3]],
      },
    ];

    for (const p of postsData) {
      const exists = await postRepo.findOne({ where: { slug: p.slug } });
      if (!exists) {
        const post = postRepo.create(p);
        await postRepo.save(post);
        console.log(`Created post: ${p.title}`);
      }
    }

    console.log('Seeding complete ✅');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

runSeeds();
