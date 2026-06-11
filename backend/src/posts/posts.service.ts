import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, In } from 'typeorm';
import { Post, PostStatus } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { User } from '../users/entities/user.entity';
import { CategoriesService } from '../categories/categories.service';
import { TagsService } from '../tags/tags.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    private categoriesService: CategoriesService,
    private tagsService: TagsService,
  ) {}

  private generateSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      + '-' + Date.now();
  }

  async create(dto: CreatePostDto, author: User): Promise<Post> {
    const slug = this.generateSlug(dto.title);

    let category = null;
    if (dto.categoryId) {
      category = await this.categoriesService.findOne(dto.categoryId);
    }

    let tags = [];
    if (dto.tagIds?.length) {
      tags = await this.tagsService.findByIds(dto.tagIds);
    }

    const post = this.postsRepository.create({
      ...dto,
      slug,
      author,
      category,
      tags,
    });

    return this.postsRepository.save(post);
  }

  async findAll(query: QueryPostDto) {
    const { search, status, categorySlug, tagSlug, authorId, page = 1, limit = 10 } = query;

    const qb = this.postsRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tags', 'tags');

    if (search) {
      qb.andWhere('(post.title ILIKE :search OR post.content ILIKE :search)',
        { search: `%${search}%` });
    }

    if (status) {
      qb.andWhere('post.status = :status', { status });
    }

    if (categorySlug) {
      qb.andWhere('category.slug = :categorySlug', { categorySlug });
    }

    if (tagSlug) {
      qb.andWhere('tags.slug = :tagSlug', { tagSlug });
    }

    if (authorId) {
      qb.andWhere('author.id = :authorId', { authorId });
    }

    const total = await qb.getCount();
    const posts = await qb
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: { author: true, category: true, tags: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async findBySlug(slug: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { slug },
      relations: { author: true, category: true, tags: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    await this.postsRepository.increment({ id: post.id }, 'viewCount', 1);
    return post;
  }

  async update(id: string, dto: UpdatePostDto, user: User): Promise<Post> {
    const post = await this.findOne(id);

    if (post.author.id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You can only edit your own posts');
    }

    if (dto.categoryId) {
      post.category = await this.categoriesService.findOne(dto.categoryId);
    }

    if (dto.tagIds) {
      post.tags = await this.tagsService.findByIds(dto.tagIds);
    }

    Object.assign(post, dto);
    return this.postsRepository.save(post);
  }

  async remove(id: string, user: User): Promise<void> {
    const post = await this.findOne(id);

    if (post.author.id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postsRepository.remove(post);
  }

  async publish(id: string, user: User): Promise<Post> {
    const post = await this.findOne(id);

    if (post.author.id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Not authorized');
    }

    post.status = PostStatus.PUBLISHED;
    return this.postsRepository.save(post);
  }
}
