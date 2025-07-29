import { defineAction } from "astro:actions";
import { strapiService } from "../lib/strapi";

// Action para obtener datos del hero desde Strapi
export const getHeroData = defineAction({
    async handler() {
      try {
        const response = await strapiService.getHero();
        
        if (!response.data) {
          return {
            success: false,
            error: "No se encontraron datos del hero",
            data: null
          };
        }

        const heroData = response.data;
        
        // Obtener la URL de la imagen de fondo y el alternative text
        let backgroundImageUrl = null;
        let alternativeText = "";
        
        if (heroData.backgroundImage && Array.isArray(heroData.backgroundImage) && heroData.backgroundImage.length > 0) {
          const image = heroData.backgroundImage[0];
          backgroundImageUrl = image.url; // Cloudinary devuelve URLs absolutas
          alternativeText = image.alternativeText || "";
        }
        
        return {
          success: true,
          data: {
            title: heroData.title || "Dale una Segunda Oportunidad",
            subtitle: heroData.subtitle || "Cada mascota merece un hogar lleno de amor.",
            backgroundImage: backgroundImageUrl,
            alternativeText: alternativeText,
          },
          error: null
        };
      } catch (error) {
        return {
          success: false,
          error: "Error al obtener datos del hero",
          data: null
        };
      }
    }
  });

// Action para obtener slides desde Strapi
export const getSlidesData = defineAction({
  async handler() {
    try {
      const response = await strapiService.getSlides();

      if (!response.data || response.data.length === 0) {
        return {
          success: false,
          error: "No se encontraron slides",
          data: []
        };
      }

      const slides = [];
      
      for (const slideRecord of response.data) {
        if (slideRecord && slideRecord.image && Array.isArray(slideRecord.image)) {
          for (const image of slideRecord.image) {
            slides.push({
              id: image.id,
              imageUrl: image.url,
              alternativeText: image.alternativeText || "",
              url: slideRecord.url || null
            });
          }
        }
      }

      return {
        success: true,
        data: slides,
        error: null
      };
    } catch (error) {
      console.error("Error al obtener slides:", error);
      return {
        success: false,
        error: "Error al obtener slides",
        data: []
      };
    }
  }
});

// Action para obtener mascotas destacadas
export const getFeaturedPets = defineAction({
  async handler() {
    try {
      const response = await strapiService.getFeaturedPets();

      if (!response.data || response.data.length === 0) {
        return {
          success: false,
          error: "No se encontraron mascotas disponibles",
          data: { pets: [] }
        };
      }

      // Procesar las mascotas y seleccionar 4 al azar
      const allPets = response.data;
      const shuffledPets = allPets.sort(() => Math.random() - 0.5);
      const selectedPets = shuffledPets.slice(0, 4);

      const processedPets = selectedPets.map(pet => {
        // Obtener la URL de la imagen
        let imageUrl = "/images/shelter-dogs.jpg"; // imagen por defecto
        let alternativeText = "";
        
        if (pet.photos && Array.isArray(pet.photos) && pet.photos.length > 0) {
          const image = pet.photos[0];
          imageUrl = image.url; // Cloudinary devuelve URLs absolutas
          alternativeText = image.alternativeText || "";
        }

        return {
          documentId: pet.documentId,
          name: pet.name,
          description: pet.description,
          species: pet.species,
          ageGroup: pet.ageGroup,
          gender: pet.gender,
          size: pet.size,
          imageUrl: imageUrl,
          alternativeText: alternativeText,
        };
      });

      return {
        success: true,
        data: { pets: processedPets },
        error: null
      };
    } catch (error) {
      console.error("Error al obtener mascotas destacadas:", error);
      return {
        success: false,
        error: "Error al obtener mascotas destacadas",
        data: { pets: [] }
      };
    }
  }
});

// Action para obtener las últimas adopciones
export const getLatestAdoptions = defineAction({
  async handler() {
    try {
      const response = await strapiService.getLatestAdoptions();

      if (!response.data || response.data.length === 0) {
        return {
          success: false,
          error: "No se encontraron adopciones recientes",
          data: { adoptions: [] }
        };
      }

      const processedAdoptions = response.data.map(adoption => {
        // Obtener la URL de la imagen de la mascota
        let imageUrl = "/images/shelter-dogs.jpg"; // imagen por defecto
        let alternativeText = "";
        
        if (adoption.pet && adoption.pet.photos && Array.isArray(adoption.pet.photos) && adoption.pet.photos.length > 0) {
          const image = adoption.pet.photos[0];
          imageUrl = image.url; // Cloudinary devuelve URLs absolutas
          alternativeText = image.alternativeText || "";
        }

        return {
          id: adoption.id,
          adoptionDate: adoption.adoptionDate,
          pet: {
            id: adoption.pet?.id,
            name: adoption.pet?.name || "Mascota",
            description: adoption.pet?.description || "",
            imageUrl: imageUrl,
            alternativeText: alternativeText,
          },
          adopter: {
            id: adoption.adopter?.id,
            name: adoption.adopter?.name || "Adoptante",
          },
        };
      });

      return {
        success: true,
        data: { adoptions: processedAdoptions },
        error: null
      };
    } catch (error) {
      console.error("Error al obtener últimas adopciones:", error);
      return {
        success: false,
        error: "Error al obtener últimas adopciones",
        data: { adoptions: [] }
      };
    }
  }
});

// Action para obtener todas las mascotas disponibles para adopción
export const getPetsForAdoption = defineAction({
  async handler() {
    try {
      const response = await strapiService.getAllPets();

      if (!response.data || response.data.length === 0) {
        return {
          success: false,
          error: "No se encontraron mascotas disponibles",
          data: { pets: [] }
        };
      }

      const processedPets = response.data.map(pet => {
        // Obtener la URL de la imagen
        let imageUrl = "/images/shelter-dogs.jpg"; // imagen por defecto
        let alternativeText = "";
        
        if (pet.photos && Array.isArray(pet.photos) && pet.photos.length > 0) {
          const image = pet.photos[0];
          imageUrl = image.url; // Cloudinary devuelve URLs absolutas
          alternativeText = image.alternativeText || "";
        }

        return {
          documentId: pet.documentId,
          name: pet.name,
          description: pet.description,
          species: pet.species,
          ageGroup: pet.ageGroup,
          gender: pet.gender,
          size: pet.size,
          isAdopted: pet.isAdopted,
          adoptedDate: pet.adoptedDated,
          imageUrl: imageUrl,
          alternativeText: alternativeText,
        };
      });

      return {
        success: true,
        data: { pets: processedPets },
        error: null
      };
    } catch (error) {
      console.error("Error al obtener mascotas para adopción:", error);
      return {
        success: false,
        error: "Error al obtener mascotas para adopción",
        data: { pets: [] }
      };
    }
  }
});

// Action para obtener una mascota específica por documentId
export const getPet = defineAction({
  async handler({ documentId }) {
    try {
      const response = await strapiService.getPetByDocumentId(documentId);

      if (!response.data || response.data.length === 0) {
        return {
          success: false,
          error: "No se encontró la mascota",
          data: { pet: [] }
        };
      }

      const pet = response.data[0];
      
      // Obtener la URL de la imagen
      let imageUrl = "/images/shelter-dogs.jpg"; // imagen por defecto
      let alternativeText = "";
      
      if (pet.photos && Array.isArray(pet.photos) && pet.photos.length > 0) {
        const image = pet.photos[0];
        imageUrl = image.url; // Cloudinary devuelve URLs absolutas
        alternativeText = image.alternativeText || "";
      }

      const processedPet = {
        documentId: pet.documentId,
        name: pet.name,
        description: pet.description,
        species: pet.species,
        ageGroup: pet.ageGroup,
        gender: pet.gender,
        size: pet.size,
        isAdopted: pet.isAdopted,
        adoptedDate: pet.adoptedDated,
        imageUrl: imageUrl,
        alternativeText: alternativeText,
      };

      return {
        success: true,
        data: { pet: [processedPet] },
        error: null
      };
    } catch (error) {
      console.error("Error al obtener mascota:", error);
      return {
        success: false,
        error: "Error al obtener mascota",
        data: { pet: [] }
      };
    }
  }
});

export const getMisionData = defineAction({
  async handler() {
    try {
      const response = await strapiService.getMision();
      if (!response.data) {
        return {
          success: false,
          error: "No se encontraron datos de misión",
          data: null
        };
      }
      const misionData = response.data;
      return {
        success: true,
        data: {
          desde: misionData.desde || "DESDE 2003",
          titulo: misionData.titulo || "Nuestra Misión: Dar Esperanza a Cada Patita",
          subtitulo: misionData.subtitulo || "Trabajamos incansablemente por transformar la vida de los animales en situación de vulnerabilidad, creando historias de amor y segundas oportunidades.",
          cards: Array.isArray(misionData.cards) ? misionData.cards : [],
        },
        error: null
      };
    } catch (error) {
      return {
        success: false,
        error: "Error al obtener datos de misión",
        data: null
      };
    }
  }
});

export const getHistoriaData = defineAction({
  async handler() {
    try {
      const response = await strapiService.getHistoria();
      if (!response.data) {
        return {
          success: false,
          error: "No se encontraron datos de historia",
          data: null
        };
      }
      const historiaData = response.data;

      console.log("Datos de historia:", historiaData);
      
      // Procesar las imágenes - Cloudinary devuelve URLs absolutas
      let imagenRefugio = "/images/shelter-dogs.jpg";
      if (historiaData.imagenRefugio) {
        if (Array.isArray(historiaData.imagenRefugio) && historiaData.imagenRefugio.length > 0) {
          imagenRefugio = historiaData.imagenRefugio[0].url;
        } else if (typeof historiaData.imagenRefugio === 'object' && 'url' in historiaData.imagenRefugio) {
          imagenRefugio = (historiaData.imagenRefugio as any).url;
        }
      }
      
      let imagenCentro = "/images/kid-dog.jpg";
      if (historiaData.imagenCentro) {
        if (Array.isArray(historiaData.imagenCentro) && historiaData.imagenCentro.length > 0) {
          imagenCentro = historiaData.imagenCentro[0].url;
        } else if (typeof historiaData.imagenCentro === 'object' && 'url' in historiaData.imagenCentro) {
          imagenCentro = (historiaData.imagenCentro as any).url;
        }
      }
      
      let imagenFundadora = "/images/founder.jpg";
      if (historiaData.imagenFundadora) {
        if (Array.isArray(historiaData.imagenFundadora) && historiaData.imagenFundadora.length > 0) {
          imagenFundadora = historiaData.imagenFundadora[0].url;
        } else if (typeof historiaData.imagenFundadora === 'object' && 'url' in historiaData.imagenFundadora) {
          imagenFundadora = (historiaData.imagenFundadora as any).url;
        }
      }
      
      return {
        success: true,
        data: {
          titulo: historiaData.titulo || "Nuestra Historia",
          introduccion: historiaData.introduccion || "La Fundación Paraíso de la Mascota se creó en el año 2003 como una entidad sin ánimo de lucro, con la intención de:",
          objetivos: Array.isArray(historiaData.objetivos) ? historiaData.objetivos.map(obj => obj.texto) : [],
          frase: historiaData.frase || "¡Somos la voz de los que no tienen voz!",
          imagenRefugio: imagenRefugio,
          centroTitulo: historiaData.centroTitulo || "Nuestro Centro de Adopción",
          centroDescripcion: historiaData.centroDescripcion || "Esta labor la llevamos a cabo desde nuestro centro de adopción localizado en Cali, Colombia; donde tenemos a 300 animalitos entre perros y gatos, en proceso de ser adoptados. Todo esto es logrado con el esfuerzo y dedicación de aquellas personas que contribuyen voluntariamente, movidas por el amor incondicional hacia estos seres que sólo esperan ser tratados dignamente y tener la oportunidad de demostrar su eterna gratitud.",
          imagenCentro: imagenCentro,
          fundadoraTitulo: historiaData.fundadoraTitulo || "Nuestra Fundadora",
          fundadoraDescripcion: historiaData.fundadoraDescripcion || "El centro de adopción viene funcionando desde Noviembre de 1999, por iniciativa de nuestra Fundadora y actual Presidente, señora Ofelia Villegas, quien después de su jubilación, empezó a rescatar animalitos de la calle, llevándolos a su casa. Esta obra fue creciendo a través de los años, hasta alquilar un lugar con mayor espacio en Diciembre de 2001. Sin los recursos económicos suficientes, logró lo que siempre han querido hacer los protectores de animales: tener un Centro de Adopción sin ningún apoyo del estado, solo con el apoyo de las personas que aman y se preocupan por el bienestar animal. A las que agradecemos inmensamente su apoyo.",
          imagenFundadora: imagenFundadora
        },
        error: null
      };
    } catch (error) {
      return {
        success: false,
        error: "Error al obtener datos de historia",
        data: null
      };
    }
  }
});

export const getTestimoniosData = defineAction({
  async handler() {
    try {
      const response = await strapiService.getTestimonios();
      if (!response.data) {
        return {
          success: false,
          error: "No se encontraron datos de testimonios",
          data: null
        };
      }
      const testimoniosData = response.data;

      // Procesar las imágenes de los testimonios - Cloudinary devuelve URLs absolutas
      const testimoniosProcesados = Array.isArray(testimoniosData.testimonios) ? 
        testimoniosData.testimonios.map(testimonio => {
          let imagenUrl = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80"; // imagen por defecto
          if (testimonio.imagen && testimonio.imagen.url) {
            imagenUrl = testimonio.imagen.url;
          }
          return {
            nombre: testimonio.nombre,
            rol: testimonio.rol,
            imagen: imagenUrl,
            texto: testimonio.texto
          };
        }) : [];
      
      return {
        success: true,
        data: {
          titulo: testimoniosData.titulo || "TESTIMONIOS",
          subtitulo: testimoniosData.subtitulo || "Historias que Inspiran",
          descripcion: testimoniosData.descripcion || "Descubre cómo nuestro trabajo ha transformado vidas, uniendo familias y creando lazos inquebrantables",
          testimonios: testimoniosProcesados
        },
        error: null
      };
    } catch (error) {
      return {
        success: false,
        error: "Error al obtener datos de testimonios",
        data: null
      };
    }
  }
});

export const getFAQData = defineAction({
  async handler() {
    try {
      const response = await strapiService.getFAQ();
      if (!response.data) {
        return {
          success: false,
          error: "No se encontraron datos de FAQ",
          data: null
        };
      }
      const faqData = response.data;
      return {
        success: true,
        data: {
          titulo: faqData.titulo || "Preguntas Frecuentes",
          preguntas: Array.isArray(faqData.preguntas) ? faqData.preguntas : [],
        },
        error: null
      };
    } catch (error) {
      return {
        success: false,
        error: "Error al obtener datos de FAQ",
        data: null
      };
    }
  }
});

export const getNoticiasData = defineAction({
  async handler() {
    try {
      const response = await strapiService.getNoticias();
      console.log("Respuesta", response);
      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        error: "Error al obtener noticias",
        data: []
      };
    }
  }
});

export const getNoticiaBySlugData = defineAction({
  async handler({ slug }) {
    try {
      const response = await strapiService.getNoticiaBySlug(slug);
      console.log(response);
      return {
        success: true,
        data: response.data.length > 0 ? response.data[0] : null,
        error: null
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        error: "Error al obtener noticia",
        data: null
      };
    }
  }
});