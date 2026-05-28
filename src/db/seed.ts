import "dotenv/config"
import { db } from "./index"
import { mosques, users, announcements, events } from "./schema"

async function seed() {
  console.log("🌱 Début du seeding...")

  try {
    // ── ÉTAPE 1 : Nettoyer les tables (ordre important à cause des foreign keys)
    console.log("🧹 Nettoyage des tables...")
    await db.delete(events)
    await db.delete(announcements)
    await db.delete(users)
    await db.delete(mosques)

    // ── ÉTAPE 2 : Insérer les mosquées
    console.log("🕌 Insertion des mosquées...")
    const [mosque1, mosque2] = await db
      .insert(mosques)
      .values([
        {
          slug: "masdjid-taqwa",
          name: "Masdjid TAQWA",
          city: "Conakry",
          country: "Guinée",
          latitude: 9.537,
          longitude: -13.6773,
          timezone: "Africa/Conakry",
          calculationMethod: "MWL",
          adminEmail: "admin@masdjid-taqwa.com",
          isVerified: true,
        },
        {
          slug: "grande-mosquee-labe",
          name: "Grande Mosquée de Labé",
          city: "Labé",
          country: "Guinée",
          latitude: 11.3181,
          longitude: -12.2895,
          timezone: "Africa/Conakry",
          calculationMethod: "MWL",
          adminEmail: "admin@mosquee-labe.com",
          isVerified: true,
        },
      ])
      .returning()

    console.log(`✅ ${2} mosquées insérées`)

    // ── ÉTAPE 3 : Insérer les utilisateurs
    console.log("👥 Insertion des utilisateurs...")
    const [admin1, member1, admin2] = await db
      .insert(users)
      .values([
        {
          name: "Abdoulaye Diallo",
          email: "abdoulaye@masdjid-taqwa.com",
          role: "admin",
          mosqueId: mosque1.id,
        },
        {
          name: "Mamadou Bah",
          email: "mamadou@masdjid-taqwa.com",
          role: "member",
          mosqueId: mosque1.id,
        },
        {
          name: "Aissatou Sow",
          email: "aissatou@mosquee-labe.com",
          role: "admin",
          mosqueId: mosque2.id,
        },
      ])
      .returning()

    console.log(`✅ ${3} utilisateurs insérés`)

    // ── ÉTAPE 4 : Insérer les annonces
    console.log("📢 Insertion des annonces...")
    await db.insert(announcements).values([
      {
        mosqueId: mosque1.id,
        title: "Horaires Ramadan 2027",
        content:
          "Les horaires spéciaux du Ramadan commenceront le 1er Ramadan 1449. Tarawih après Isha.",
        authorId: admin1.id,
        publishedAt: new Date("2026-05-01"),
        isPublished: true,
      },
      {
        mosqueId: mosque1.id,
        title: "Fermeture exceptionnelle",
        content: "La mosquée sera fermée pour travaux du 1er au 15 avril.",
        authorId: admin1.id,
        publishedAt: new Date("2026-04-01"),
        expiresAt: new Date("2026-04-15"),
        isPublished: true,
      },
      {
        mosqueId: mosque1.id,
        title: "Brouillon - Cours de Coran",
        content: "Contenu en cours de rédaction...",
        authorId: member1.id,
        publishedAt: new Date("2026-05-20"),
        isPublished: false,
      },
      {
        mosqueId: mosque2.id,
        title: "Nouveau programme éducatif",
        content:
          "Lancement d'un nouveau programme d'enseignement du Coran pour les enfants.",
        authorId: admin2.id,
        publishedAt: new Date("2026-05-15"),
        isPublished: true,
      },
    ])

    console.log(`✅ ${4} annonces insérées`)

    // ── ÉTAPE 5 : Insérer les événements
    console.log("📅 Insertion des événements...")
    await db.insert(events).values([
      {
        mosqueId: mosque1.id,
        title: "Conférence : Les valeurs de l'Islam",
        description:
          "Conférence animée par l'Imam sur les valeurs fondamentales de l'Islam.",
        location: "Salle principale de la mosquée",
        startAt: new Date("2026-06-15T19:00:00"),
        endAt: new Date("2026-06-15T21:00:00"),
        isPublished: true,
      },
      {
        mosqueId: mosque1.id,
        title: "Iftar communautaire",
        description: "Repas de rupture du jeûne ouvert à tous.",
        location: "À la mosquée",
        startAt: new Date("2026-06-20T19:30:00"),
        endAt: new Date("2026-06-20T21:00:00"),
        isPublished: true,
      },
      {
        mosqueId: mosque2.id,
        title: "Journée portes ouvertes",
        description:
          "Venez découvrir notre mosquée et échanger avec la communauté.",
        location: "Grande Mosquée de Labé",
        startAt: new Date("2026-06-10T10:00:00"),
        endAt: new Date("2026-06-10T17:00:00"),
        isPublished: true,
      },
    ])

    console.log(`✅ ${3} événements insérés`)

    console.log("\n🎉 Seeding terminé avec succès !")
  } catch (error) {
    console.error("❌ Erreur lors du seeding:", error)
    throw error
  }
}

// Exécuter le seeding
seed()
  .then(() => {
    console.log("✨ Base de données prête à l'emploi")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Échec du seeding:", error)
    process.exit(1)
  })
