export type ArticlePreview = {
  preview_id: number;
  article_id: number;
  preview_by: string;
  preview_title: string;
  preview_subtitle: string;
  categories: string[];
  preview_images: string[];
};

export type Paginated<T> = {
  data: T[];
  meta: { totalPages: number; totalCount: number; page: number; limit: number };
};

export type User = {
  id: number;
  email: string;
  fname: string;
  lname: string;
  username: string;
  region: string;
  bio: string;
  avatar: string;
};
