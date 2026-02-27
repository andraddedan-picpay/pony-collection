export interface Pony {
    id: string;
    name: string;
    element: string;
    personality: string;
    talent: string;
    summary: string;
    imageUrl: string;
    isFavorite: boolean;
}

export interface UpdatePony {
    name?: string;
    element?: string;
    personality?: string;
    talent?: string;
    summary?: string;
    imageUrl?: string;
    isFavorite?: boolean;
}
