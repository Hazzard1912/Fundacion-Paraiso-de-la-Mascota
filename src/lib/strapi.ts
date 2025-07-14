interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface StrapiData<T> {
  id: number;
  attributes: T;
}

export class StrapiService {
  private baseUrl: string;
  private readToken: string;  
  private requestToken: string; // Se usa unicamente para crear solicitudes de adopcion y apadrinamiento

  constructor() {
    this.baseUrl = import.meta.env.STRAPI_URL || 'http://localhost:1337';
    this.readToken = import.meta.env.STRAPI_READ_TOKEN || '';
    this.requestToken = import.meta.env.STRAPI_REQUEST_TOKEN || '';
  }

  private async fetch<T>(endpoint: string): Promise<StrapiResponse<StrapiData<T>[]>> {
    const url = `${this.baseUrl}/api${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.readToken) {
      headers['Authorization'] = `Bearer ${this.readToken}`;
    }

    const response = await fetch(url, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private async fetchSingle<T>(endpoint: string): Promise<StrapiResponse<T>> {
    const url = `${this.baseUrl}/api${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.readToken) {
      headers['Authorization'] = `Bearer ${this.readToken}`;
    }

    const response = await fetch(url, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private async post<T>(endpoint: string, data: any): Promise<StrapiResponse<T>> {
    const url = `${this.baseUrl}/api${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.requestToken) {
      headers['Authorization'] = `Bearer ${this.requestToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Strapi API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  async getHero(): Promise<StrapiResponse<{
    id: number;
    title: string;
    subtitle: string;
    backgroundImage: Array<{
      id: number;
      url: string;
      alternativeText?: string;
    }>;
  }>> {
    return this.fetchSingle('/hero?fields=title,subtitle&populate[backgroundImage][fields]=url,alternativeText');
  }

  // Obtener slides - cada slide tiene un array de imágenes
  async getSlides(): Promise<StrapiResponse<{
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    image: Array<{
      id: number;
      documentId: string;
      url: string;
      alternativeText: string | null;
    }>;
  }[]>>
  {
    const url = `${this.baseUrl}/api/slides?populate[image][fields]=url,alternativeText`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.readToken) {
      headers['Authorization'] = `Bearer ${this.readToken}`;
    }

    const response = await fetch(url, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Método para crear solicitudes de adopción
  async createAdoptionRequest(data: {
    petId: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    hasPets: string;
    adoptionReason?: string;
  }): Promise<StrapiResponse<{
    id: number;
    attributes: {
      petId: number;
      name: string;
      email: string;
      phone: string;
      address: string;
      hasPets: string;
      adoptionReason?: string;
      status: string;
      createdAt: string;
      updatedAt: string;
    };
  }>> {
    return this.post('/adoption-requests', data);
  }

  // Método para crear solicitudes de apadrinamiento
  async createSponsorRequest(data: {
    petId: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    monthlyAmount: number;
  }): Promise<StrapiResponse<{
    id: number;
    attributes: {
      petId: number;
      name: string;
      email: string;
      phone: string;
      address: string;
      monthlyAmount: number;
      status: string;
      createdAt: string;
      updatedAt: string;
    };
  }>> {
    return this.post('/sponsor-requests', data);
  }

  // Método para obtener mascotas destacadas (no adoptadas)
  async getFeaturedPets(): Promise<StrapiResponse<{
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    name: string;
    description: string;
    isAdopted: boolean;
    adoptedDated: string | null;
    gender: string;
    ageGroup: string;
    species: string;
    size: string;
    image: Array<{
      id: number;
      documentId: string;
      url: string;
      alternativeText: string | null;
    }>;
  }[]>> {
    const url = `${this.baseUrl}/api/pets?filters[isAdopted][$eq]=false&populate[photos][fields]=url,alternativeText&sort=publishedAt:desc`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.readToken) {
      headers['Authorization'] = `Bearer ${this.readToken}`;
    }

    const response = await fetch(url, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

export const strapiService = new StrapiService(); 