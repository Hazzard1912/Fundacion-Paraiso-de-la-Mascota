import { db, User, Pet, PetAdoption, Adopter, Slide } from 'astro:db';
import bcrypt from 'bcryptjs';
import { v4 as UUID } from 'uuid';

// Sample pet data including some already adopted pets
const samplePets = [
	// Existing pets
	{
		id: 1,
		name: 'Luna',
		species: 'Perro',
		breed: 'Mestizo',
		ageGroup: 'Adulto',
		gender: 'Hembra',
		size: 'Mediano',
		description: 'Perro amigable y juguetón en busca de un hogar amoroso.',
		imageUrl: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?q=80&w=500',
		isAdopted: false,
		isAvailableForSponsorship: true,
		createdAt: new Date()
	},
	{
		id: 2,
		name: 'Simba',
		species: 'Gato',
		breed: 'Naranja Atigrado',
		ageGroup: 'Joven',
		gender: 'Macho',
		size: 'Pequeño',
		description: 'Gato enérgico que adora jugar.',
		imageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=500',
		isAdopted: false,
		isAvailableForSponsorship: true,
		createdAt: new Date()
	},
	{
		id: 3,
		name: 'Max',
		species: 'Perro',
		breed: 'Labrador',
		ageGroup: 'Adulto',
		gender: 'Macho',
		size: 'Grande',
		description: 'Labrador leal y amigable que ama las actividades al aire libre.',
		imageUrl: 'https://images.unsplash.com/photo-1611003228941-98852ba62227?q=80&w=500',
		isAdopted: false,
		isAvailableForSponsorship: true,
		createdAt: new Date()
	},
	{
		id: 4,
		name: 'Bella',
		species: 'Gato',
		breed: 'Siamés',
		ageGroup: 'Cachorro',
		gender: 'Hembra',
		size: 'Pequeño',
		description: 'Gatita tranquila y cariñosa buscando un hogar tranquilo.',
		imageUrl: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=500',
		isAdopted: false,
		isAvailableForSponsorship: true,
		createdAt: new Date()
	},
	{
		id: 5,
		name: 'Rocky',
		species: 'Perro',
		breed: 'Bulldog',
		ageGroup: 'Senior',
		gender: 'Macho',
		size: 'Grande',
		description: 'Bulldog cariñoso y tranquilo en busca de un hogar tranquilo.',
		imageUrl: 'https://images.unsplash.com/photo-1560807707-9c4c79843c7d?q=80&w=500',
		isAdopted: false,
		isAvailableForSponsorship: true,
		createdAt: new Date()
	},
	{
		id: 6,
		name: 'Milo',
		species: 'Gato',
		breed: 'Mestizo',
		ageGroup: 'Adulto',
		gender: 'Macho',
		size: 'Mediano',
		description: 'Gato cariñoso y juguetón en busca de un hogar amoroso.',
		imageUrl: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=500',
		isAdopted: false,
		isAvailableForSponsorship: true,
		createdAt: new Date()
	},
	{
		id: 7,
		name: 'Coco',
		species: 'Perro',
		breed: 'Mestizo',
		ageGroup: 'Adulto',
		gender: 'Macho',
		size: 'Mediano',
		description: 'Perro amigable y juguetón en busca de un hogar amoroso.',
		imageUrl: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?q=80&w=500',
		isAdopted: false,
		isAvailableForSponsorship: true,
		createdAt: new Date()
	},
	// Adding adopted pets with adoption dates
	{
		id: 8,
		name: 'Tokio',
		species: 'Perro',
		breed: 'Beagle',
		ageGroup: 'Joven',
		gender: '',
		size: 'Mediano',
		description: 'Toby encontró un hogar lleno de amor y ahora disfruta de largas caminatas y juegos en el parque todos los días.',
		imageUrl: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?q=80&w=500',
		isAdopted: true,
		adoptedDate: new Date('2024-01-10'),
		isAvailableForSponsorship: false,
		createdAt: new Date('2023-12-01')
	},
	{
		id: 9,
		name: 'Mittens',
		species: 'Gato',
		breed: 'Atigrado',
		ageGroup: 'Adulto',
		gender: 'Hembra',
		size: 'Pequeño',
		description: 'Mittens ahora disfruta de un hogar acogedor donde recibe todo el cariño que merece y tiene su propio rincón soleado para tomar siestas.',
		imageUrl: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=500',
		isAdopted: true,
		adoptedDate: new Date('2024-02-05'),
		isAvailableForSponsorship: false,
		createdAt: new Date('2023-11-15')
	},
	{
		id: 10,
		name: 'Bruno',
		species: 'Perro',
		breed: 'Pastor Alemán',
		ageGroup: 'Adulto',
		gender: 'Macho',
		size: 'Grande',
		description: 'Bruno fue adoptado por una familia activa que lo lleva de aventuras todos los fines de semana. Ha descubierto su amor por nadar y correr junto a la bicicleta.',
		imageUrl: 'https://images.unsplash.com/photo-1611003228941-98852ba62227?q=80&w=500',
		isAdopted: true,
		adoptedDate: new Date('2024-03-01'),
		isAvailableForSponsorship: false,
		createdAt: new Date('2023-10-20')
	},
	{
		id: 11,
		name: 'Lola',
		species: 'Gato',
		breed: 'Persa',
		ageGroup: 'Cachorro',
		gender: 'Hembra',
		size: 'Pequeño',
		description: 'Lola fue adoptada por una familia cariñosa que le brinda un hogar cálido y acogedor. Ahora disfruta de juegos y mimos constantes.',
		imageUrl: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=500',
		isAdopted: true,
		adoptedDate: new Date('2024-02-15'),
		isAvailableForSponsorship: false,
		createdAt: new Date('2023-11-01')
	}
];

// Sample user data for seeding the database
const sampleUsers = [
	{
		id: UUID(),
		username: 'admin',
		password: bcrypt.hashSync('123456', 10),
		isSuperAdmin: true
	},
	{
		id: UUID(),
		username: 'user',
		password: bcrypt.hashSync('123456', 10),
		isSuperAdmin: false
	}
];

// Sample adopter data
const sampleAdopters = [
	{
		id: 1,
		name: 'Juan Pérez',
		email: 'juan.perez@example.com',
		phone: '+123456789',
		address: 'Calle Principal 123, Ciudad',
		createdAt: new Date('2023-12-15')
	},
	{
		id: 2,
		name: 'María González',
		email: 'maria.gonzalez@example.com',
		phone: '+987654321',
		address: 'Avenida Central 456, Ciudad',
		createdAt: new Date('2024-01-05')
	},
	{
		id: 3,
		name: 'Carlos Rodríguez',
		email: 'carlos.rodriguez@example.com',
		phone: '+567891234',
		address: 'Plaza Mayor 78, Ciudad',
		createdAt: new Date('2024-02-20')
	}
];

// Sample pet adoptions matching the adopted pets in samplePets
const samplePetAdoptions = [
	{
		id: 1,
		petId: 8, // Tokio
		adopterId: 1, // Juan Pérez
		adoptionDate: new Date('2024-01-10')
	},
	{
		id: 2,
		petId: 9, // Mittens
		adopterId: 2, // María González
		adoptionDate: new Date('2024-02-05')
	},
	{
		id: 3,
		petId: 10, // Bruno
		adopterId: 3, // Carlos Rodríguez
		adoptionDate: new Date('2024-03-01')
	}
];

// Sample slide data for homepage carousel
const sampleSlides = [
	{
		id: 1,
		imageUrl: 'https://images.unsplash.com/photo-1612460137028-a3c8c2e17758?q=80&w=2070&auto=format&fit=crop',
		active: true,
		createdAt: new Date()
	},
	{
		id: 2,
		imageUrl: 'https://images.unsplash.com/photo-1601758124316-3026abe11afe?q=80&w=2070&auto=format&fit=crop',
		active: true,
		createdAt: new Date()
	},
	{
		id: 3,
		imageUrl: null,
		active: false,
		createdAt: new Date()
	}
];

export default async function seed() {
	await db.insert(Pet).values(samplePets);
	await db.insert(User).values(sampleUsers);
	await db.insert(Adopter).values(sampleAdopters);
	await db.insert(PetAdoption).values(samplePetAdoptions);
	await db.insert(Slide).values(sampleSlides);
}
