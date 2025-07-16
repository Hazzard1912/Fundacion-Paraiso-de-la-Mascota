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
  }[]>> {
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
    pet: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    hasPets: string;
    adoptionReason: string;
  }): Promise<StrapiResponse<any>> {
    console.log("Datos que se envían a Strapi:", JSON.stringify(data, null, 2));
    try {
      // 1. Crear el adoptante
      const adopterResponse = await this.post('/adopters', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address
      });
      const adopterDocId = (adopterResponse.data as any).documentId;
      const requestResponse = await this.post('/adoption-requests', {
        pet: data.pet,
        adopter: adopterDocId,
        hasPets: data.hasPets,
        adoptionReason: data.adoptionReason
      });
      return requestResponse as any;
    } catch (error) {
      console.error("Error completo de Strapi:", error);
      throw error;
    }
  }

  // Método para crear solicitudes de apadrinamiento
  async createSponsorRequest(data: {
    pet: string; // documentId
    name: string;
    email: string;
    phone: string;
    address: string;
    monthlyAmount: number;
  }): Promise<StrapiResponse<any>> {
    console.log("Datos que se envían a Strapi:", JSON.stringify(data, null, 2));
    try {
      const sponsorResponse = await this.post('/sponsors', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address
      });
      const sponsorDocId = (sponsorResponse.data as any).documentId;
      const requestResponse = await this.post('/sponsor-requests', {
        pet: data.pet,
        sponsor: sponsorDocId,
        monthlyAmount: data.monthlyAmount
      });
      console.log("Solicitud de apadrinamiento creada:", requestResponse);
      return requestResponse as any;
    } catch (error) {
      console.error("Error completo de Strapi:", error);
      throw error;
    }
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
    photos: Array<{
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

  // Método para obtener las últimas adopciones con información relacionada
  async getLatestAdoptions(): Promise<StrapiResponse<{
    id: number;
    adoptionDate: string;
    pet: {
      id: number;
      name: string;
      description: string;
      photos: Array<{
        id: number;
        documentId: string;
        url: string;
        alternativeText: string | null;
      }>;
    };
    adopter: {
      id: number;
      name: string;
    };
  }[]>> {
    const url = `${this.baseUrl}/api/pet-adoptions?populate[pet][fields]=name,description&populate[pet][populate][photos][fields]=url,alternativeText&populate[adopter][fields]=name&sort=adoptionDate:desc&pagination[limit]=3`;

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

  // Método para obtener todas las mascotas disponibles para adopción
  async getAllPets(): Promise<StrapiResponse<{
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
    photos: Array<{
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

  // Método para obtener una mascota específica por ID
  async getPetById(documentId: string): Promise<StrapiResponse<{
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
    photos: Array<{
      id: number;
      documentId: string;
      url: string;
      alternativeText: string | null;
    }>;
  }[]>> {
    const url = `${this.baseUrl}/api/pets?filters[documentId][$eq]=${documentId}&populate[photos][fields]=url,alternativeText`;

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

  // Método para obtener una mascota específica por documentId
  async getPetByDocumentId(documentId: string): Promise<StrapiResponse<any>> {
    const url = `${this.baseUrl}/api/pets?filters[documentId][$eq]=${documentId}&populate[photos][fields]=url,alternativeText`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.readToken) {
      headers['Authorization'] = `Bearer ${this.readToken}`;
    }
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async getMision(): Promise<StrapiResponse<{
    desde: string;
    titulo: string;
    subtitulo: string;
    cards: Array<{
      titulo: string;
      descripcion: string;
      icono: string;
    }>;
  }>> {
    return this.fetchSingle('/mision?populate[cards][fields]=titulo,descripcion,icono&fields=desde,titulo,subtitulo');
  }

  async getHistoria(): Promise<StrapiResponse<{
    titulo: string;
    introduccion: string;
    objetivos: Array<{
      texto: string;
    }>;
    frase: string;
    imagenRefugio: Array<{
      id: number;
      url: string;
      alternativeText?: string;
    }>;
    centroTitulo: string;
    centroDescripcion: string;
    imagenCentro: Array<{
      id: number;
      url: string;
      alternativeText?: string;
    }>;
    fundadoraTitulo: string;
    fundadoraDescripcion: string;
    imagenFundadora: Array<{
      id: number;
      url: string;
      alternativeText?: string;
    }>;
  }>> {
    return this.fetchSingle('/historia?populate[objetivos][fields]=texto&populate[imagenRefugio][fields]=url,alternativeText&populate[imagenCentro][fields]=url,alternativeText&populate[imagenFundadora][fields]=url,alternativeText&fields=titulo,introduccion,frase,centroTitulo,centroDescripcion,fundadoraTitulo,fundadoraDescripcion');
  }

  async getTestimonios(): Promise<StrapiResponse<{
    titulo: string;
    subtitulo: string;
    descripcion: string;
    testimonios: Array<{
      nombre: string;
      rol: string;
      imagen: {
        id: number;
        url: string;
        alternativeText?: string;
      };
      texto: string;
    }>;
  }>> {
    return this.fetchSingle('/testimonio?populate[testimonios][fields]=nombre,rol,texto&populate[testimonios][populate][imagen][fields]=url,alternativeText&fields=titulo,subtitulo,descripcion');
  }

  async getFAQ(): Promise<StrapiResponse<{
    titulo: string;
    preguntas: Array<{
      pregunta: string;
      respuesta: string;
    }>;
  }>> {
    return this.fetchSingle('/faq?populate[preguntas][fields]=pregunta,respuesta&fields=titulo');
  }

  async getNoticias(): Promise<{ data: Array<{
    id: number;
    titulo: string;
    slug: string;
    resumen: string;
    contenido: string;
    imagen: {
      url: string;
      alternativeText?: string;
    } | null;
    fecha: string;
  }>; meta: any; }> {
    const response = await this.fetch('/noticias?populate=imagen&fields=titulo,slug,resumen,contenido,fecha');
    const baseUrl = import.meta.env.STRAPI_URL || 'http://localhost:1337';
    return {
      data: Array.isArray(response.data) ? response.data.map((item: any) => ({
        id: item.id,
        ...item,
        imagen: item.imagen && item.imagen.url
          ? {
              url: `${baseUrl}${item.imagen.url}`,
              alternativeText: item.imagen.alternativeText || ''
            }
          : null
      })) : [],
      meta: response.meta
    };
  }

  async getNoticiaBySlug(slug: string): Promise<{ data: Array<{
    id: number;
    titulo: string;
    slug: string;
    resumen: string;
    contenido: string;
    imagen: {
      url: string;
      alternativeText?: string;
    } | null;
    fecha: string;
  }>; meta: any; }> {
    const response = await this.fetch(`/noticias?filters[slug][$eq]=${slug}&populate=imagen&fields=titulo,slug,resumen,contenido,fecha`);
    const baseUrl = import.meta.env.STRAPI_URL || 'http://localhost:1337';
    return {
      data: Array.isArray(response.data) ? response.data.map((item: any) => ({
        id: item.id,
        ...item,
        imagen: item.imagen && item.imagen.url
          ? {
              url: `${baseUrl}${item.imagen.url}`,
              alternativeText: item.imagen.alternativeText || ''
            }
          : null
      })) : [],
      meta: response.meta
    };
  }
}

export const strapiService = new StrapiService(); 