import "dotenv/config"
import { db } from "./index"
import { auth } from "@/lib/auth"
import {
  mosques,
  users,
  announcements,
  events,
  account,
  session,
  verification,
} from "./schema"
import { eq } from "drizzle-orm"

// Mot de passe commun aux comptes de démo (>= 8 caractères)
const DEMO_PASSWORD = "Password123"

// Crée un compte via Better-Auth (hash du mot de passe + table account),
// puis fixe role / mosqueId / emailVerified directement en base.
async function createAdmin(input: {
  name: string
  email: string
  role: string
  mosqueId: number
}): Promise<string> {
  await auth.api.signUpEmail({
    body: { name: input.name, email: input.email, password: DEMO_PASSWORD },
  })

  await db
    .update(users)
    .set({ role: input.role, mosqueId: input.mosqueId, emailVerified: true })
    .where(eq(users.email, input.email))

  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1)

  return row.id
}

async function seed() {
  console.log("🌱 Début du seeding...")

  try {
    // ── ÉTAPE 1 : Nettoyer (ordre important à cause des foreign keys)
    console.log("🧹 Nettoyage des tables...")
    await db.delete(events)
    await db.delete(announcements)
    await db.delete(account)
    await db.delete(session)
    await db.delete(verification)
    await db.delete(users)
    await db.delete(mosques)

    // ── ÉTAPE 2 : Mosquées
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

    console.log("✅ 2 mosquées insérées")

    // ── ÉTAPE 3 : Comptes (via Better-Auth, connectables)
    console.log("👥 Création des comptes...")
    const admin1Id = await createAdmin({
      name: "Abdoulaye Diallo",
      email: "abdoulaye@masdjid-taqwa.com",
      role: "admin",
      mosqueId: mosque1.id,
    })
    const member1Id = await createAdmin({
      name: "Mamadou Bah",
      email: "mamadou@masdjid-taqwa.com",
      role: "member",
      mosqueId: mosque1.id,
    })
    const admin2Id = await createAdmin({
      name: "Aissatou Sow",
      email: "aissatou@mosquee-labe.com",
      role: "admin",
      mosqueId: mosque2.id,
    })

    console.log("✅ 3 comptes créés (mot de passe :", DEMO_PASSWORD, ")")

    // ── ÉTAPE 4 : Annonces
    console.log("📢 Insertion des annonces...")
    await db.insert(announcements).values([
      {
        mosqueId: mosque1.id,
        title: "Horaires Ramadan 2027",
        content:
          "Les horaires spéciaux du Ramadan commenceront le 1er Ramadan 1449. Tarawih après Isha.",
        authorId: admin1Id,
        publishedAt: new Date("2026-05-01"),
        isPublished: true,
      },
      {
        mosqueId: mosque1.id,
        title: "Fermeture exceptionnelle",
        content: "La mosquée sera fermée pour travaux du 1er au 15 avril.",
        authorId: admin1Id,
        publishedAt: new Date("2026-04-01"),
        expiresAt: new Date("2026-04-15"),
        isPublished: true,
      },
      {
        mosqueId: mosque1.id,
        title: "Brouillon - Cours de Coran",
        content: "Contenu en cours de rédaction...",
        authorId: member1Id,
        publishedAt: new Date("2026-05-20"),
        isPublished: false,
      },
      {
        mosqueId: mosque2.id,
        title: "Nouveau programme éducatif",
        content:
          "Lancement d'un nouveau programme d'enseignement du Coran pour les enfants.",
        authorId: admin2Id,
        publishedAt: new Date("2026-05-15"),
        isPublished: true,
      },
    ])

    console.log("✅ 4 annonces insérées")

    // ── ÉTAPE 5 : Événements
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

    console.log("✅ 3 événements insérés")
    console.log("\n🎉 Seeding terminé avec succès !")
  } catch (error) {
    console.error("❌ Erreur lors du seeding:", error)
    throw error
  }
}

seed()
  .then(() => {
    console.log("✨ Base de données prête à l'emploi")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Échec du seeding:", error)
    process.exit(1)
  })
