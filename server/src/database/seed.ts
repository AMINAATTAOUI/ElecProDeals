import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from '../database/entities/user.entity';
import { ProductEntity } from '../database/entities/product.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const usersRepo = app.get<Repository<UserEntity>>(
    getRepositoryToken(UserEntity),
  );
  const productsRepo = app.get<Repository<ProductEntity>>(
    getRepositoryToken(ProductEntity),
  );

  // --- Users ---
  const existingUsers = await usersRepo.count();
  if (existingUsers === 0) {
    const hash = await bcrypt.hash('password123', 10);

    await usersRepo.save([
      {
        email: 'client@demo.fr',
        passwordHash: hash,
        role: 'client',
        firstName: 'Jean',
        lastName: 'Martin',
        companyName: 'Martin Electricite SARL',
        siret: '12345678901234',
        isActive: true,
        customerType: 'artisan',
        pricingSheetId: 'sheet-artisan-standard',
        isPaymentDeferred: false,
        assignedCommercialId: null,
        assignedClientIds: null,
      },
      {
        email: 'gros-installateur@demo.fr',
        passwordHash: hash,
        role: 'client',
        firstName: 'Sophie',
        lastName: 'Bernard',
        companyName: 'BTP Electrique Nord SAS',
        siret: '98765432109876',
        isActive: true,
        customerType: 'large_installer',
        pricingSheetId: 'sheet-gros-installateur',
        isPaymentDeferred: true,
        assignedCommercialId: null,
        assignedClientIds: null,
      },
      {
        email: 'commercial@demo.fr',
        passwordHash: hash,
        role: 'commercial',
        firstName: 'Marie',
        lastName: 'Dupont',
        companyName: 'ElecProDeals',
        siret: '11111111111111',
        isActive: true,
        customerType: null,
        pricingSheetId: null,
        isPaymentDeferred: false,
        assignedCommercialId: null,
        assignedClientIds: [],
      },
      {
        email: 'admin@demo.fr',
        passwordHash: hash,
        role: 'admin',
        firstName: 'Admin',
        lastName: 'Systeme',
        companyName: 'ElecProDeals',
        siret: '00000000000000',
        isActive: true,
        customerType: null,
        pricingSheetId: null,
        isPaymentDeferred: false,
        assignedCommercialId: null,
        assignedClientIds: null,
      },
    ]);
    console.log('Seeded 4 users');
  } else {
    console.log(`Users already seeded (${existingUsers} found), skipping.`);
  }

  // --- Products ---
  const existingProducts = await productsRepo.count();
  if (existingProducts === 0) {
    await productsRepo.save([
      {
        sageRef: 'DIS-63A-C',
        name: 'Disjoncteur 63A courbe C',
        description:
          'Disjoncteur unipolaire + neutre 63A courbe C, pouvoir de coupure 6kA',
        category: 'Protection electrique',
        publicPrice: 42.5,
        unit: 'piece',
        stockStatus: 'available',
        estimatedDeliveryDays: 1,
        isActive: true,
      },
      {
        sageRef: 'DIS-20A-B',
        name: 'Disjoncteur 20A courbe B',
        description:
          'Disjoncteur bipolaire 20A courbe B, pour circuits eclairage',
        category: 'Protection electrique',
        publicPrice: 28.9,
        unit: 'piece',
        stockStatus: 'available',
        estimatedDeliveryDays: 1,
        isActive: true,
      },
      {
        sageRef: 'DDR-40A-30MA',
        name: 'Interrupteur differentiel 40A 30mA Type A',
        description: 'IDR 40A 30mA type A, protection personnes et materiels',
        category: 'Protection electrique',
        publicPrice: 67.8,
        unit: 'piece',
        stockStatus: 'available',
        estimatedDeliveryDays: 2,
        isActive: true,
      },
      {
        sageRef: 'CPT-LINKY-MONO',
        name: 'Compteur Linky monophase',
        description: 'Compteur communicant Linky monophase, agree Enedis',
        category: 'Comptage',
        publicPrice: 189.0,
        unit: 'piece',
        stockStatus: 'on_order',
        estimatedDeliveryDays: 14,
        isActive: true,
      },
      {
        sageRef: 'CAB-H07VU-2.5',
        name: 'Cable H07V-U 2.5mm2 rouleau 100m',
        description:
          'Fil rigide H07V-U section 2.5mm2, rouleau de 100 metres, rouge',
        category: 'Cablage',
        publicPrice: 54.2,
        unit: 'rouleau',
        stockStatus: 'available',
        estimatedDeliveryDays: 1,
        isActive: true,
      },
      {
        sageRef: 'CAB-H07VR-6',
        name: 'Cable H07V-R 6mm2 rouleau 100m',
        description:
          'Fil souple H07V-R section 6mm2, rouleau de 100 metres, vert/jaune',
        category: 'Cablage',
        publicPrice: 98.5,
        unit: 'rouleau',
        stockStatus: 'available',
        estimatedDeliveryDays: 1,
        isActive: true,
      },
      {
        sageRef: 'GON-IP65-200',
        name: 'Goulotte IP65 200mm',
        description:
          'Goulotte de cablage IP65, section 200mm, longueur 2m, gris RAL 7035',
        category: 'Cheminement',
        publicPrice: 18.7,
        unit: 'metre',
        stockStatus: 'available',
        estimatedDeliveryDays: 3,
        isActive: true,
      },
      {
        sageRef: 'TAB-ABB-4G25',
        name: 'Tableau electrique 4 rangees 25 modules',
        description:
          'Coffret de distribution 4 rangees 25 modules, avec porte vitree',
        category: 'Tableaux electriques',
        publicPrice: 245.0,
        unit: 'piece',
        stockStatus: 'available',
        estimatedDeliveryDays: 2,
        isActive: true,
      },
      {
        sageRef: 'PRJ-LED-50W',
        name: 'Projecteur LED 50W chantier',
        description: 'Projecteur LED 50W 4000K, IP65, avec portee reglable',
        category: 'Eclairage',
        publicPrice: 89.9,
        unit: 'piece',
        stockStatus: 'available',
        estimatedDeliveryDays: 1,
        isActive: true,
      },
      {
        sageRef: 'PRI-16A-2P+T',
        name: 'Prise 16A 2P+T etanche IP44',
        description:
          'Prise de courant 16A 2P+T encastrable etanche IP44, blanc',
        category: 'Appareillage',
        publicPrice: 12.4,
        unit: 'piece',
        stockStatus: 'available',
        estimatedDeliveryDays: 1,
        isActive: true,
      },
      {
        sageRef: 'INT-VA-VT-10A',
        name: 'Interrupteur va-et-vient 10A',
        description: 'Interrupteur va-et-vient 10A 250V, finition blanc satin',
        category: 'Appareillage',
        publicPrice: 8.9,
        unit: 'piece',
        stockStatus: 'available',
        estimatedDeliveryDays: 1,
        isActive: true,
      },
      {
        sageRef: 'CHARG-VE-7KW',
        name: 'Borne de recharge VE 7kW',
        description:
          'Wallbox monophase 7kW Type 2, Wifi, avec cable 5m, norme IEC 61851',
        category: 'Mobilite electrique',
        publicPrice: 890.0,
        unit: 'piece',
        stockStatus: 'out_of_stock',
        estimatedDeliveryDays: 21,
        isActive: true,
      },
      {
        sageRef: 'CHARG-VE-22KW',
        name: 'Borne de recharge VE 22kW triphasee',
        description:
          'Borne recharge triphasee 22kW Type 2, RFID, 4G, parking professionnel',
        category: 'Mobilite electrique',
        publicPrice: 1890.0,
        unit: 'piece',
        stockStatus: 'on_order',
        estimatedDeliveryDays: 30,
        isActive: true,
      },
      {
        sageRef: 'CAP-400V-10KVAR',
        name: 'Condensateur compensation 10 kVAR',
        description:
          'Batterie de condensateurs 10 kVAR 400V, amelioration facteur de puissance',
        category: 'Compensateurs',
        publicPrice: 320.0,
        unit: 'piece',
        stockStatus: 'available',
        estimatedDeliveryDays: 5,
        isActive: true,
      },
      {
        sageRef: 'VFD-ABB-4KW',
        name: 'Variateur de frequence 4kW',
        description: 'Variateur de vitesse ABB ACS310 4kW 400V triphase, IP20',
        category: 'Automatisme',
        publicPrice: 480.0,
        unit: 'piece',
        stockStatus: 'available',
        estimatedDeliveryDays: 7,
        isActive: true,
      },
      {
        sageRef: 'TGBT-125A-4P',
        name: 'Interrupteur sectionneur 125A 4P',
        description:
          'Sectionneur 125A 4 poles en charge, coupure omnipolaire garantie',
        category: 'Protection electrique',
        publicPrice: 145.0,
        unit: 'piece',
        stockStatus: 'available',
        estimatedDeliveryDays: 3,
        isActive: true,
      },
      {
        sageRef: 'PARA-FOUDRE-T1T2',
        name: 'Parafoudre Type 1+2',
        description:
          'Parafoudre combine Type 1+2 pour installation triphasee, 25kA',
        category: 'Protection electrique',
        publicPrice: 210.0,
        unit: 'piece',
        stockStatus: 'available',
        estimatedDeliveryDays: 4,
        isActive: true,
      },
      {
        sageRef: 'SOUS-REPARTITEUR-63A',
        name: 'Sous-repartiteur 63A 18 modules',
        description:
          'Petit tableau secondaire 63A 1 rangee 18 modules, plastique gris',
        category: 'Tableaux electriques',
        publicPrice: 72.0,
        unit: 'piece',
        stockStatus: 'available',
        estimatedDeliveryDays: 1,
        isActive: true,
      },
      {
        sageRef: 'TUBE-LED-T8-18W',
        name: 'Tube fluorescent LED T8 18W 1200mm',
        description:
          'Tube LED T8 18W 1200mm 4000K, compatible ballast electronique, 2000lm',
        category: 'Eclairage',
        publicPrice: 14.9,
        unit: 'piece',
        stockStatus: 'available',
        estimatedDeliveryDays: 2,
        isActive: true,
      },
      {
        sageRef: 'DETECT-MVMT-IR-180',
        name: 'Detecteur de mouvement infrarouge 180',
        description:
          'Detecteur de presence PIR 180 IP44, portee 12m, pour exterieur',
        category: 'Domotique',
        publicPrice: 38.5,
        unit: 'piece',
        stockStatus: 'available',
        estimatedDeliveryDays: 1,
        isActive: true,
      },
    ]);
    console.log('Seeded 20 products');
  } else {
    console.log(
      `Products already seeded (${existingProducts} found), skipping.`,
    );
  }

  await app.close();
  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
