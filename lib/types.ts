export interface Review {
    id: number;
    title: string;
    publisher: string;
    author: string;
    deadline: string;
    url: string;
    genre: string
    author_gender: string
    nationality: string
    type: string        
    category: string
    source?: string
    registration_id?: number
    created_at?: string
  }