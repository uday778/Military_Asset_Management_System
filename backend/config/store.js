// In-memory data store — rich seed data for demo/portfolio
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const store = {
  users: [
    { _id: 'u1', username: 'admin',      password: bcrypt.hashSync('admin123', 10),     role: 'Admin',            base: 'HQ',           name: 'Maj. Gen. Robert Hayes'    },
    { _id: 'u2', username: 'commander1', password: bcrypt.hashSync('commander123', 10), role: 'Base Commander',   base: 'Alpha Base',   name: 'Col. James Hartley'        },
    { _id: 'u3', username: 'commander2', password: bcrypt.hashSync('commander123', 10), role: 'Base Commander',   base: 'Bravo Base',   name: 'Lt. Col. Sarah Nguyen'     },
    { _id: 'u4', username: 'logistics1', password: bcrypt.hashSync('logistics123', 10), role: 'Logistics Officer',base: 'Bravo Base',   name: 'Sgt. Maria Santos'         },
    { _id: 'u5', username: 'logistics2', password: bcrypt.hashSync('logistics123', 10), role: 'Logistics Officer',base: 'Charlie Base', name: 'Cpl. David Kim'            },
  ],

  assets: [
    // Alpha Base
    { _id:'a1',  name:'M1 Abrams Tank',       type:'Vehicle',    base:'Alpha Base',   quantity:12,    status:'Operational' },
    { _id:'a2',  name:'Humvee HMMWV',          type:'Vehicle',    base:'Alpha Base',   quantity:24,    status:'Operational' },
    { _id:'a3',  name:'M113 APC',              type:'Vehicle',    base:'Alpha Base',   quantity:6,     status:'Maintenance'  },
    { _id:'a4',  name:'AK-47 Rifle',           type:'Weapon',     base:'Alpha Base',   quantity:430,   status:'Operational' },
    { _id:'a5',  name:'M249 SAW',              type:'Weapon',     base:'Alpha Base',   quantity:45,    status:'Operational' },
    { _id:'a6',  name:'M40 Sniper Rifle',      type:'Weapon',     base:'Alpha Base',   quantity:18,    status:'Operational' },
    { _id:'a7',  name:'M67 Grenade',           type:'Weapon',     base:'Alpha Base',   quantity:570,   status:'Operational' },
    { _id:'a8',  name:'5.56mm Ammo',           type:'Ammunition', base:'Alpha Base',   quantity:32000, status:'Operational' },
    { _id:'a9',  name:'7.62mm Ammo',           type:'Ammunition', base:'Alpha Base',   quantity:25000, status:'Operational' },
    { _id:'a10', name:'.50 Cal Ammo',          type:'Ammunition', base:'Alpha Base',   quantity:8000,  status:'Operational' },
    { _id:'a11', name:'Night Vision Goggles',  type:'Equipment',  base:'Alpha Base',   quantity:108,   status:'Operational' },
    { _id:'a12', name:'Body Armor Vest',       type:'Equipment',  base:'Alpha Base',   quantity:310,   status:'Operational' },
    { _id:'a13', name:'Combat Radio PRC-152',  type:'Equipment',  base:'Alpha Base',   quantity:65,    status:'Operational' },
    // Bravo Base
    { _id:'b1',  name:'M2 Bradley IFV',        type:'Vehicle',    base:'Bravo Base',   quantity:8,     status:'Operational' },
    { _id:'b2',  name:'Humvee HMMWV',          type:'Vehicle',    base:'Bravo Base',   quantity:18,    status:'Operational' },
    { _id:'b3',  name:'M998 Utility Truck',    type:'Vehicle',    base:'Bravo Base',   quantity:10,    status:'Operational' },
    { _id:'b4',  name:'M16A4 Rifle',           type:'Weapon',     base:'Bravo Base',   quantity:240,   status:'Operational' },
    { _id:'b5',  name:'M9 Pistol',             type:'Weapon',     base:'Bravo Base',   quantity:150,   status:'Operational' },
    { _id:'b6',  name:'M240 Machine Gun',      type:'Weapon',     base:'Bravo Base',   quantity:22,    status:'Operational' },
    { _id:'b7',  name:'9mm Ammo',              type:'Ammunition', base:'Bravo Base',   quantity:28500, status:'Operational' },
    { _id:'b8',  name:'5.56mm Ammo',           type:'Ammunition', base:'Bravo Base',   quantity:14000, status:'Operational' },
    { _id:'b9',  name:'Tactical Helmet',       type:'Equipment',  base:'Bravo Base',   quantity:280,   status:'Operational' },
    { _id:'b10', name:'First Aid Kit IFAK',    type:'Equipment',  base:'Bravo Base',   quantity:200,   status:'Operational' },
    // Charlie Base
    { _id:'c1',  name:'UH-60 Black Hawk',      type:'Vehicle',    base:'Charlie Base', quantity:3,     status:'Operational' },
    { _id:'c2',  name:'M1126 Stryker',         type:'Vehicle',    base:'Charlie Base', quantity:6,     status:'Operational' },
    { _id:'c3',  name:'M35 Cargo Truck',       type:'Vehicle',    base:'Charlie Base', quantity:14,    status:'Maintenance'  },
    { _id:'c4',  name:'M4 Carbine',            type:'Weapon',     base:'Charlie Base', quantity:180,   status:'Operational' },
    { _id:'c5',  name:'M320 Grenade Launcher', type:'Weapon',     base:'Charlie Base', quantity:35,    status:'Operational' },
    { _id:'c6',  name:'40mm Grenade',          type:'Ammunition', base:'Charlie Base', quantity:3800,  status:'Operational' },
    { _id:'c7',  name:'5.56mm Ammo',           type:'Ammunition', base:'Charlie Base', quantity:22000, status:'Operational' },
    { _id:'c8',  name:'Tactical Drone RQ-11',  type:'Equipment',  base:'Charlie Base', quantity:5,     status:'Operational' },
    { _id:'c9',  name:'Satellite Phone',       type:'Equipment',  base:'Charlie Base', quantity:25,    status:'Operational' },
    // HQ
    { _id:'h1',  name:'Apache AH-64',          type:'Vehicle',    base:'HQ',           quantity:4,     status:'Maintenance'  },
    { _id:'h2',  name:'C-130 Hercules',        type:'Vehicle',    base:'HQ',           quantity:2,     status:'Operational' },
    { _id:'h3',  name:'M109 Howitzer',         type:'Weapon',     base:'HQ',           quantity:6,     status:'Operational' },
    { _id:'h4',  name:'155mm Artillery Shell', type:'Ammunition', base:'HQ',           quantity:3000,  status:'Operational' },
    { _id:'h5',  name:'Encrypted Laptop',      type:'Equipment',  base:'HQ',           quantity:50,    status:'Operational' },
    { _id:'h6',  name:'Tactical Command Unit', type:'Equipment',  base:'HQ',           quantity:10,    status:'Operational' },
  ],

  purchases: [
    { _id:'p1',  assetName:'AK-47 Rifle',           type:'Weapon',     base:'Alpha Base',   quantity:100,   unitCost:800,     totalCost:80000,    supplier:'DefenseTech Corp',         purchaseDate:'2024-01-10', createdBy:'admin',      notes:'Annual restocking Q1' },
    { _id:'p2',  assetName:'Humvee HMMWV',           type:'Vehicle',    base:'Bravo Base',   quantity:3,     unitCost:220000,  totalCost:660000,   supplier:'AM General LLC',           purchaseDate:'2024-01-18', createdBy:'admin',      notes:'Replacement units' },
    { _id:'p3',  assetName:'5.56mm Ammo',            type:'Ammunition', base:'Alpha Base',   quantity:20000, unitCost:1,       totalCost:20000,    supplier:'Orbital ATK',              purchaseDate:'2024-01-25', createdBy:'logistics1', notes:'Training season supply' },
    { _id:'p4',  assetName:'Night Vision Goggles',   type:'Equipment',  base:'Alpha Base',   quantity:50,    unitCost:3200,    totalCost:160000,   supplier:'L3 Technologies',          purchaseDate:'2024-02-05', createdBy:'admin',      notes:'Night ops upgrade' },
    { _id:'p5',  assetName:'Body Armor Vest',        type:'Equipment',  base:'Alpha Base',   quantity:150,   unitCost:1400,    totalCost:210000,   supplier:'Point Blank Enterprises',  purchaseDate:'2024-02-12', createdBy:'admin',      notes:'Level IV plates' },
    { _id:'p6',  assetName:'M16A4 Rifle',            type:'Weapon',     base:'Bravo Base',   quantity:75,    unitCost:1200,    totalCost:90000,    supplier:'Colt Defense',             purchaseDate:'2024-02-20', createdBy:'logistics1', notes:'Bravo reinforcement' },
    { _id:'p7',  assetName:'9mm Ammo',               type:'Ammunition', base:'Bravo Base',   quantity:15000, unitCost:0.5,     totalCost:7500,     supplier:'Federal Premium',          purchaseDate:'2024-02-28', createdBy:'logistics1', notes:'Sidearm training ammo' },
    { _id:'p8',  assetName:'M4 Carbine',             type:'Weapon',     base:'Charlie Base', quantity:80,    unitCost:1100,    totalCost:88000,    supplier:'Colt Defense',             purchaseDate:'2024-03-05', createdBy:'admin',      notes:'Charlie expansion' },
    { _id:'p9',  assetName:'Tactical Drone RQ-11',   type:'Equipment',  base:'Charlie Base', quantity:4,     unitCost:35000,   totalCost:140000,   supplier:'AeroVironment Inc',        purchaseDate:'2024-03-10', createdBy:'admin',      notes:'ISR recon drones' },
    { _id:'p10', assetName:'Combat Radio PRC-152',   type:'Equipment',  base:'Alpha Base',   quantity:30,    unitCost:4500,    totalCost:135000,   supplier:'Harris Corporation',       purchaseDate:'2024-03-15', createdBy:'logistics1', notes:'Comms upgrade' },
    { _id:'p11', assetName:'First Aid Kit IFAK',     type:'Equipment',  base:'Bravo Base',   quantity:100,   unitCost:85,      totalCost:8500,     supplier:'North American Rescue',    purchaseDate:'2024-03-20', createdBy:'logistics1', notes:'Field medic kits' },
    { _id:'p12', assetName:'M2 Bradley IFV',         type:'Vehicle',    base:'Bravo Base',   quantity:2,     unitCost:3200000, totalCost:6400000,  supplier:'BAE Systems',              purchaseDate:'2024-03-28', createdBy:'admin',      notes:'Fleet expansion Phase 2' },
  ],

  transfers: [
    { _id:'t1', assetName:'M16A4 Rifle',           type:'Weapon',     fromBase:'Alpha Base',  toBase:'Bravo Base',   quantity:50,   status:'Completed', transferDate:'2024-02-01', requestedBy:'commander1', approvedBy:'admin',      notes:'Bravo reinforcement'              },
    { _id:'t2', assetName:'5.56mm Ammo',           type:'Ammunition', fromBase:'Alpha Base',  toBase:'Charlie Base', quantity:5000, status:'Completed', transferDate:'2024-02-10', requestedBy:'logistics2', approvedBy:'admin',      notes:'Charlie resupply'                 },
    { _id:'t3', assetName:'Night Vision Goggles',  type:'Equipment',  fromBase:'Alpha Base',  toBase:'Bravo Base',   quantity:20,   status:'Completed', transferDate:'2024-02-18', requestedBy:'commander2', approvedBy:'admin',      notes:'Night ops joint exercise'         },
    { _id:'t4', assetName:'Humvee HMMWV',          type:'Vehicle',    fromBase:'Bravo Base',  toBase:'Charlie Base', quantity:2,    status:'Completed', transferDate:'2024-03-02', requestedBy:'logistics2', approvedBy:'admin',      notes:'Charlie patrol expansion'         },
    { _id:'t5', assetName:'Body Armor Vest',       type:'Equipment',  fromBase:'Alpha Base',  toBase:'Bravo Base',   quantity:40,   status:'Completed', transferDate:'2024-03-08', requestedBy:'commander2', approvedBy:'admin',      notes:'Bravo armor upgrade'              },
    { _id:'t6', assetName:'M249 SAW',              type:'Weapon',     fromBase:'Alpha Base',  toBase:'Charlie Base', quantity:5,    status:'Pending',   transferDate:'2024-04-01', requestedBy:'logistics2', approvedBy:null,         notes:'Charlie fire team support'        },
    { _id:'t7', assetName:'9mm Ammo',              type:'Ammunition', fromBase:'Bravo Base',  toBase:'HQ',           quantity:3000, status:'Pending',   transferDate:'2024-04-03', requestedBy:'commander2', approvedBy:null,         notes:'HQ security resupply'             },
    { _id:'t8', assetName:'Combat Radio PRC-152',  type:'Equipment',  fromBase:'Alpha Base',  toBase:'Charlie Base', quantity:10,   status:'Rejected',  transferDate:'2024-03-25', requestedBy:'logistics2', approvedBy:null, rejectedBy:'admin', notes:'Alpha below min threshold' },
  ],

  assignments: [
    { _id:'as1', assetName:'AK-47 Rifle',          type:'Weapon',    base:'Alpha Base',   assignedTo:'Delta Squad',            quantity:20, assignmentDate:'2024-02-05', returnDate:'2024-02-20', status:'Returned', purpose:'Patrol Mission Alpha-7',                 createdBy:'commander1', returnedAt:'2024-02-19T14:30:00Z' },
    { _id:'as2', assetName:'Night Vision Goggles', type:'Equipment', base:'Alpha Base',   assignedTo:'Recon Team Bravo',       quantity:12, assignmentDate:'2024-02-15', returnDate:'2024-03-01', status:'Returned', purpose:'Night Surveillance Operation',            createdBy:'commander1', returnedAt:'2024-02-28T09:00:00Z' },
    { _id:'as3', assetName:'M1 Abrams Tank',       type:'Vehicle',   base:'Alpha Base',   assignedTo:'3rd Armor Company',      quantity:4,  assignmentDate:'2024-03-01', returnDate:'2024-04-01', status:'Active',   purpose:'Border Security Exercise Falcon Strike',  createdBy:'commander1' },
    { _id:'as4', assetName:'M16A4 Rifle',          type:'Weapon',    base:'Bravo Base',   assignedTo:'2nd Infantry Platoon',   quantity:60, assignmentDate:'2024-03-05', returnDate:'2024-04-05', status:'Active',   purpose:'Operation Desert Shield Training',        createdBy:'commander2' },
    { _id:'as5', assetName:'Combat Radio PRC-152', type:'Equipment', base:'Alpha Base',   assignedTo:'Signal Corps Unit 7',    quantity:15, assignmentDate:'2024-03-10', returnDate:null,          status:'Active',   purpose:'Comms relay — FOB Outpost Alpha',         createdBy:'commander1' },
    { _id:'as6', assetName:'Humvee HMMWV',         type:'Vehicle',   base:'Bravo Base',   assignedTo:'Military Police Det.',   quantity:5,  assignmentDate:'2024-03-12', returnDate:'2024-03-26', status:'Returned', purpose:'VIP Convoy Security',                    createdBy:'commander2', returnedAt:'2024-03-26T16:00:00Z' },
    { _id:'as7', assetName:'Tactical Drone RQ-11', type:'Equipment', base:'Charlie Base', assignedTo:'ISR Flight Team',        quantity:3,  assignmentDate:'2024-03-18', returnDate:null,          status:'Active',   purpose:'Continuous surveillance — Sector 9',     createdBy:'admin' },
    { _id:'as8', assetName:'M4 Carbine',           type:'Weapon',    base:'Charlie Base', assignedTo:'Quick Reaction Force',   quantity:40, assignmentDate:'2024-03-20', returnDate:'2024-04-20', status:'Active',   purpose:'Standby QRF — Charlie Sector',           createdBy:'commander1' },
  ],

  expenditures: [
    { _id:'e1', assetName:'5.56mm Ammo',  type:'Ammunition', base:'Alpha Base',   quantity:5000, expenditureDate:'2024-02-08', purpose:'Monthly Training Exercise',      authorizedBy:'commander1', notes:'Live-fire range Bravo Company'         },
    { _id:'e2', assetName:'9mm Ammo',     type:'Ammunition', base:'Bravo Base',   quantity:2000, expenditureDate:'2024-02-14', purpose:'Qualification Shoot',            authorizedBy:'commander2', notes:'Annual marksmanship qualification'     },
    { _id:'e3', assetName:'7.62mm Ammo', type:'Ammunition', base:'Alpha Base',   quantity:3000, expenditureDate:'2024-02-22', purpose:'Combat Training Exercise',       authorizedBy:'commander1', notes:'Squad live-fire Alpha-3'               },
    { _id:'e4', assetName:'5.56mm Ammo',  type:'Ammunition', base:'Bravo Base',   quantity:4000, expenditureDate:'2024-03-01', purpose:'Joint Training Operation',       authorizedBy:'commander2', notes:'Exercise Falcon Strike — Bravo element'},
    { _id:'e5', assetName:'M67 Grenade',  type:'Weapon',     base:'Alpha Base',   quantity:30,   expenditureDate:'2024-03-07', purpose:'Demo Training',                  authorizedBy:'commander1', notes:'EOD and infantry demo range'           },
    { _id:'e6', assetName:'40mm Grenade', type:'Ammunition', base:'Charlie Base', quantity:200,  expenditureDate:'2024-03-12', purpose:'Grenadier Qualification',        authorizedBy:'logistics2', notes:'M320 operator qual course'             },
    { _id:'e7', assetName:'5.56mm Ammo',  type:'Ammunition', base:'Alpha Base',   quantity:8000, expenditureDate:'2024-03-18', purpose:'Operation Desert Shield Live Fire',authorizedBy:'commander1',notes:'Full company engagement'              },
    { _id:'e8', assetName:'9mm Ammo',     type:'Ammunition', base:'Bravo Base',   quantity:1500, expenditureDate:'2024-03-25', purpose:'Security Patrol Training',       authorizedBy:'commander2', notes:'MP detachment drills'                  },
    { _id:'e9', assetName:'.50 Cal Ammo', type:'Ammunition', base:'Alpha Base',   quantity:2000, expenditureDate:'2024-03-29', purpose:'Heavy Weapons Training',         authorizedBy:'commander1', notes:'M2 Browning qual — Weapons Platoon'    },
  ],

  auditLogs: [
    { _id:'log1', action:'LOGIN',            entity:'User',        entityId:'u1',  performedBy:'admin',      details:'User admin logged in',                                       timestamp:'2024-01-10T08:00:00Z' },
    { _id:'log2', action:'PURCHASE',         entity:'Purchase',    entityId:'p1',  performedBy:'admin',      details:'Purchased 100x AK-47 Rifle for Alpha Base — $80000',         timestamp:'2024-01-10T09:15:00Z' },
    { _id:'log3', action:'PURCHASE',         entity:'Purchase',    entityId:'p2',  performedBy:'admin',      details:'Purchased 3x Humvee HMMWV for Bravo Base — $660000',         timestamp:'2024-01-18T10:00:00Z' },
    { _id:'log4', action:'TRANSFER_REQUEST', entity:'Transfer',    entityId:'t1',  performedBy:'commander1', details:'Transfer 50x M16A4 Rifle from Alpha to Bravo Base',          timestamp:'2024-02-01T11:00:00Z' },
    { _id:'log5', action:'TRANSFER_APPROVE', entity:'Transfer',    entityId:'t1',  performedBy:'admin',      details:'Approved transfer of 50x M16A4 Rifle',                       timestamp:'2024-02-01T11:45:00Z' },
    { _id:'log6', action:'ASSIGNMENT',       entity:'Assignment',  entityId:'as3', performedBy:'commander1', details:'Assigned 4x M1 Abrams Tank to 3rd Armor Company',            timestamp:'2024-03-01T08:30:00Z' },
    { _id:'log7', action:'EXPENDITURE',      entity:'Expenditure', entityId:'e7',  performedBy:'commander1', details:'Expended 8000x 5.56mm Ammo — Operation Desert Shield',       timestamp:'2024-03-18T15:00:00Z' },
    { _id:'log8', action:'TRANSFER_REJECT',  entity:'Transfer',    entityId:'t8',  performedBy:'admin',      details:'Rejected transfer — Alpha Base below minimum radio threshold',timestamp:'2024-03-25T13:00:00Z' },
  ],
};

store.addAuditLog = function(action, entity, entityId, performedBy, details) {
  store.auditLogs.push({ _id: uuidv4(), action, entity, entityId, performedBy, details, timestamp: new Date().toISOString() });
};

module.exports = { store, uuidv4 };
