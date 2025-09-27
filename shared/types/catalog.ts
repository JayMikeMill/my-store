// Collection is now the base
export interface Collection {
  id?: string;
  parentId?: string;
  name: string;
  slug: string;
  images?: CollectionImageSet;
  description?: string;
  seo?: { title?: string; metaDescription?: string; keywords?: string[] };
}

// Category extends Collection
export interface Category extends Collection {}

// Product images
export interface CollectionImageSet {
  id?: Number;
  banner: string;
  preview: string;
  thumbnail: string;
}
