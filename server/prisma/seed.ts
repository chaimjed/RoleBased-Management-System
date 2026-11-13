import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const dbUrl = new URL(process.env.DATABASE_URL!)
const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: Number(dbUrl.port) || 3306,
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.replace(/^\//, ''),
  allowPublicKeyRetrieval: true,
})
const prisma = new PrismaClient({ adapter })

const PERMISSION_LABELS: Record<string, string> = {
  'users:read': 'View users',
  'users:edit': 'Edit users',
  'users:create': 'Create users',
  'users:delete': 'Delete users',
  'users:export': 'Export users',
  'audit:read': 'View activity log',
  'roles:manage': 'Manage roles and permissions',
}

const PERMISSIONS = Object.keys(PERMISSION_LABELS);
const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: PERMISSIONS,
  USER: [],
}

async function main() {
const permissionRecords = await Promise.all(
  PERMISSIONS.map((name) =>
    prisma.permission.upsert({
      where: { name },
      update: { label: PERMISSION_LABELS[name] },
      create: { name, label: PERMISSION_LABELS[name] },
    }),
  ),
)

  const permissionsByName = Object.fromEntries(
    permissionRecords.map((p) => [p.name, p]),
  )

  for (const [roleName, permissionNames] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    })

    for (const permName of permissionNames) {
      const permission = permissionsByName[permName];
      await prisma.rolepermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      })
    }
  }

  console.log('Seed completed: permissions and roles created')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
