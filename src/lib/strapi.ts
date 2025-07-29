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
  data: T;
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
      const error = await response.json();
      throw error;
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
    url?: string; // URL opcional para redirección
    image: Array<{
      id: number;
      documentId: string;
      url: string;
      alternativeText: string | null;
    }>;
  }[]>> {
    const url = `${this.baseUrl}/api/slides?populate[image][fields]=url,alternativeText&fields=url`;

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
  }): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Buscar adoptante por email
      const existingAdopterResp = await this.fetch(`/adopters?filters[email][$eq]=${encodeURIComponent(data.email)}`);
      const existingAdopter = Array.isArray(existingAdopterResp.data) ? existingAdopterResp.data[0] : null;

      console.log('Existing adopter:', existingAdopter);

      let adopterDocId;
      if (existingAdopter) {
        adopterDocId = existingAdopter.documentId;
      } else {
        // 2. Crear el adoptante si no existe
        const adopterResponse = await this.post('/adopters', {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address
        });
        adopterDocId = (adopterResponse.data as any).documentId;
      }

      console.log('Adopter document ID:', adopterDocId);

      console.log("data a enviar:", {
        pet: data.pet,
        adopter: adopterDocId,
        hasPets: data.hasPets,
        adoptionReason: data.adoptionReason
      });

      // 3. Crear la solicitud de adopción
      const requestResponse = await this.post('/adoption-requests', {
        pet: data.pet,
        adopter: adopterDocId,
        hasPets: data.hasPets,
        adoptionReason: data.adoptionReason
      });

      return {
        success: true,
        message: "¡Solicitud enviada con éxito! Nuestro equipo revisará tu solicitud y se pondrá en contacto contigo en un máximo de 48 horas."
      };
    } catch (error) {
      let message = "Ocurrió un error al procesar tu solicitud. Por favor intenta nuevamente.";

      if (error?.error?.message) {
        message = error.error.message;
      }
      return {
        success: false,
        message
      };
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
  }): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Buscar sponsor por email
      const existingSponsorResp = await this.fetch(`/sponsors?filters[email][$eq]=${encodeURIComponent(data.email)}`);
      const existingSponsor = Array.isArray(existingSponsorResp.data) ? existingSponsorResp.data[0] : null;
      let sponsorDocId;
      if (existingSponsor) {
        sponsorDocId = existingSponsor.documentId;
      } else {
        // 2. Crear el sponsor si no existe
        const sponsorResponse = await this.post('/sponsors', {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address
        });
        sponsorDocId = (sponsorResponse.data as any).documentId;
      }
      // 3. Crear la solicitud de apadrinamiento
      const requestResponse = await this.post('/sponsor-requests', {
        pet: data.pet,
        sponsor: sponsorDocId,
        monthlyAmount: data.monthlyAmount
      });
      return {
        success: true,
        message: "¡Solicitud de padrinazgo enviada con éxito! Nuestro equipo revisará tu solicitud y se pondrá en contacto contigo en un máximo de 48 horas."
      };
    } catch (error) {
      let message = "Ocurrió un error al procesar tu solicitud. Por favor intenta nuevamente.";
      if (error?.error?.message) {
        message = error.error.message;
      }
      return {
        success: false,
        message
      };
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
  async getAllPets(limit: number = 100): Promise<StrapiResponse<{
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
    const url = `${this.baseUrl}/api/pets?filters[isAdopted][$eq]=false&populate[photos][fields]=url,alternativeText&sort=publishedAt:desc&pagination[limit]=${limit}`;

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
    return {
      data: Array.isArray(response.data) ? response.data.map((item: any) => ({
        id: item.id,
        ...item,
        imagen: item.imagen && item.imagen.url
          ? {
              url: item.imagen.url, // Cloudinary devuelve URLs absolutas
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
    return {
      data: Array.isArray(response.data) ? response.data.map((item: any) => ({
        id: item.id,
        ...item,
        imagen: item.imagen && item.imagen.url
          ? {
              url: item.imagen.url, // Cloudinary devuelve URLs absolutas
              alternativeText: item.imagen.alternativeText || ''
            }
          : null
      })) : [],
      meta: response.meta
    };
  }
}

export const strapiService = new StrapiService(); 