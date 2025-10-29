export interface Post{
    id: number,
    title: string,
    content: string,
    publishedAt: boolean,
    createdAt: Date, 
    updatedAt: Date,
    authorId: number,
    author: Author,
    comments: Comment[]
}

export interface Author{
    username: string;
}

export interface Comment{
    id: number,
    content: string,
    createdAt: Date,
    postId: number,
    post: JSON,
    userId?: number,
    user: User
}

export interface User{
    id: number,
    email: string,
    username: string,
    password: string,
    role: string,
    posts: Post[],
    comments: Comment[]
}