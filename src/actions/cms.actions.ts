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
          const baseUrl = import.meta.env.STRAPI_URL || 'http://localhost:1337';
          backgroundImageUrl = `${baseUrl}${image.url}`;
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

      console.log(response);

      if (!response.data || response.data.length === 0) {
        return {
          success: false,
          error: "No se encontraron slides",
          data: []
        };
      }

      // Procesar el array de imágenes del primer (y único) registro
      const slides = [];
      const slideRecord = response.data[0]; // Solo hay un registro
      
      if (slideRecord && slideRecord.image && Array.isArray(slideRecord.image)) {

        for (const image of slideRecord.image) {
          const baseUrl = import.meta.env.STRAPI_URL || 'http://localhost:1337';
          slides.push({
            id: image.id,
            imageUrl: `${baseUrl}${image.url}`,
            alternativeText: image.alternativeText || ""
          });
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

      console.log("mascotas", response);

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
        
        if (pet.image && Array.isArray(pet.image) && pet.image.length > 0) {
          const image = pet.image[0];
          const baseUrl = import.meta.env.STRAPI_URL || 'http://localhost:1337';
          imageUrl = `${baseUrl}${image.url}`;
          alternativeText = image.alternativeText || "";
        }

        return {
          id: pet.id,
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