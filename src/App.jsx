import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertOctagon,
  X
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Parking from './pages/Parking';
import Admin from './pages/Admin';
import Footer from './components/Footer';
import LoginPortal from './pages/LoginPortal';
import './App.css';

const INDIA_CITIES = {
  'New Delhi': {
    name: 'New Delhi',
    center: { lat: 28.6304, lng: 77.2177 },
    zoom: 16,
    controllers: [
      { id: 'delhi-cp-1', name: 'Connaught Place Junction A', position: { lat: 28.6328, lng: 77.2198 }, locationName: 'Outer Circle & Barakhamba Rd' },
      { id: 'delhi-cp-2', name: 'Connaught Place Junction B', position: { lat: 28.6285, lng: 77.2135 }, locationName: 'Outer Circle & Janpath Rd' },
      { id: 'delhi-cp-3', name: 'Connaught Place Junction C', position: { lat: 28.6295, lng: 77.2240 }, locationName: 'Outer Circle & Kasturba Gandhi Marg' },
      { id: 'delhi-cp-4', name: 'Connaught Place Junction D', position: { lat: 28.6348, lng: 77.2162 }, locationName: 'Outer Circle & Chelmsford Rd' },
      { id: 'delhi-cp-5', name: 'Connaught Place Junction E', position: { lat: 28.6310, lng: 77.2215 }, locationName: 'Outer Circle & Minto Rd' },
      { id: 'delhi-cp-6', name: 'Connaught Place Junction F', position: { lat: 28.6270, lng: 77.2188 }, locationName: 'Outer Circle & Parliament St' }
    ],
    parkingLots: [
      { name: 'Lot A', position: { lat: 28.6355, lng: 77.2215 } },
      { name: 'Lot B', position: { lat: 28.6258, lng: 77.2175 } },
      { name: 'Lot C', position: { lat: 28.6310, lng: 77.2105 } }
    ],
    incidents: [
      { id: 'delhi-inc-1', name: 'Connaught Place Slow Traffic', position: { lat: 28.6315, lng: 77.2162 }, details: 'Congestion spike. AI Adaptive signal controls adjusting timings.' }
    ],
    checkpoints: [
      { id: 'delhi-chk-1', name: 'Delhi Police Checkpoint', position: { lat: 28.6288, lng: 77.2210 }, details: 'Routine smart telemetry validation active.' }
    ]
  },
  'Mumbai': {
    name: 'Mumbai',
    center: { lat: 19.0435, lng: 72.8405 },
    zoom: 15,
    controllers: [
      { id: 'mumbai-bandra-1', name: 'Bandra West Intersection A', position: { lat: 19.0435, lng: 72.8405 }, locationName: 'Bandra Reclamation' },
      { id: 'mumbai-linking-2', name: 'Linking Road Intersection B', position: { lat: 19.0585, lng: 72.8390 }, locationName: 'Linking Rd & Waterfield Rd' },
      { id: 'mumbai-carter-3', name: 'Carter Road Intersection C', position: { lat: 19.0660, lng: 72.8220 }, locationName: 'Carter Rd & Perry Cross Rd' },
      { id: 'mumbai-svroad-4', name: 'SV Road Intersection D', position: { lat: 19.0520, lng: 72.8415 }, locationName: 'SV Rd & Turner Rd' },
      { id: 'mumbai-hillroad-5', name: 'Hill Road Intersection E', position: { lat: 19.0552, lng: 72.8330 }, locationName: 'Hill Rd & St John Baptist Rd' },
      { id: 'mumbai-reclamation-6', name: 'Bandra Reclamation Crossing F', position: { lat: 19.0405, lng: 72.8465 }, locationName: 'Bandra Reclamation Toll Link' }
    ],
    parkingLots: [
      { name: 'Lot A', position: { lat: 19.0410, lng: 72.8440 } },
      { name: 'Lot B', position: { lat: 19.0610, lng: 72.8360 } },
      { name: 'Lot C', position: { lat: 19.0645, lng: 72.8240 } }
    ],
    incidents: [
      { id: 'mumbai-inc-1', name: 'Bandra Junction Delay', position: { lat: 19.0505, lng: 72.8410 }, details: 'Minor congestion due to localized delay. AI prioritizing EW lanes.' }
    ],
    checkpoints: [
      { id: 'mumbai-chk-1', name: 'Bandra Police Checkpost', position: { lat: 19.0450, lng: 72.8420 }, details: 'Speed monitoring and signal sync check.' }
    ]
  },
  'Bangalore': {
    name: 'Bangalore',
    center: { lat: 12.9176, lng: 77.6244 },
    zoom: 15,
    controllers: [
      { id: 'blr-silk-1', name: 'Silk Board Junction North A', position: { lat: 12.9176, lng: 77.6244 }, locationName: 'Silk Board Flyover Ramp' },
      { id: 'blr-silk-2', name: 'Silk Board Junction South B', position: { lat: 12.9150, lng: 77.6220 }, locationName: 'Hosur Road Intersection' },
      { id: 'blr-silk-3', name: 'Silk Board Junction East C', position: { lat: 12.9185, lng: 77.6265 }, locationName: 'Outer Ring Rd to HSR' },
      { id: 'blr-silk-4', name: 'Silk Board Junction West D', position: { lat: 12.9160, lng: 77.6200 }, locationName: 'BTM Layout Link' },
      { id: 'blr-hsr-5', name: 'HSR Layout Sector 7 Crossing E', position: { lat: 12.9130, lng: 77.6320 }, locationName: '14th Main Rd & 19th Cross' },
      { id: 'blr-btm-6', name: 'BTM Layout 2nd Stage Junction F', position: { lat: 12.9198, lng: 77.6110 }, locationName: '16th Main Rd & Outer Ring Rd' }
    ],
    parkingLots: [
      { name: 'Lot A', position: { lat: 12.9200, lng: 77.6300 } },
      { name: 'Lot B', position: { lat: 12.9340, lng: 77.6180 } },
      { name: 'Lot C', position: { lat: 12.9140, lng: 77.6080 } }
    ],
    incidents: [
      { id: 'blr-inc-1', name: 'Silk Board Jam', position: { lat: 12.9165, lng: 77.6235 }, details: 'Heavy gridlock reported. Dispatching green wave overrides.' }
    ],
    checkpoints: [
      { id: 'blr-chk-1', name: 'HSR Ring Rd Checkpoint', position: { lat: 12.9190, lng: 77.6260 }, details: 'AI camera traffic violation scan operational.' }
    ]
  },
  'Noida': {
    name: 'Noida',
    center: { lat: 28.6210, lng: 77.3780 },
    zoom: 15,
    controllers: [
      { id: 'noida-62-1', name: 'Sector 62 Crossing A', position: { lat: 28.6225, lng: 77.3810 }, locationName: 'Sector 62 Main Crossing' },
      { id: 'noida-62-2', name: 'Sector 62 Underpass Crossing B', position: { lat: 28.6185, lng: 77.3755 }, locationName: 'NH-24 Sector 62 Loop' },
      { id: 'noida-62-3', name: 'Sector 62 Fortis Hospital Chowk C', position: { lat: 28.6198, lng: 77.3725 }, locationName: 'Fortis Hospital Rd' },
      { id: 'noida-62-4', name: 'Sector 62 JSS Academy Junction D', position: { lat: 28.6215, lng: 77.3870 }, locationName: 'JSS Academy Rd' },
      { id: 'noida-62-5', name: 'Sector 62 PM Mall Junction E', position: { lat: 28.6255, lng: 77.3800 }, locationName: 'NH-24 Service Lane Link' },
      { id: 'noida-62-6', name: 'Sector 62 Park Crossing F', position: { lat: 28.6155, lng: 77.3790 }, locationName: 'Block C Crossing' }
    ],
    parkingLots: [
      { name: 'Lot A', position: { lat: 28.6240, lng: 77.3790 } },
      { name: 'Lot B', position: { lat: 28.6190, lng: 77.3830 } },
      { name: 'Lot C', position: { lat: 28.6120, lng: 77.3690 } }
    ],
    incidents: [
      { id: 'noida-inc-1', name: 'Fortis Road Lane Closure', position: { lat: 28.6205, lng: 77.3775 }, details: 'Lane restricted on Fortis road. Smart cycles active.' }
    ],
    checkpoints: [
      { id: 'noida-chk-1', name: 'UP Police Border Patrol', position: { lat: 28.6230, lng: 77.3840 }, details: 'Pollution certificate checks under smart telemetry.' }
    ]
  },
  'Uttarakhand': {
    name: 'Uttarakhand',
    center: { lat: 30.3165, lng: 78.0322 },
    zoom: 8,
    controllers: [
      { id: 'dehradun-isbt', name: 'Dehradun ISBT Junction', position: { lat: 30.2872, lng: 78.0012 }, locationName: 'ISBT Bypass Rd' },
      { id: 'haridwar-har-ki-pauri', name: 'Haridwar Har Ki Pauri Crossing', position: { lat: 29.9642, lng: 78.1706 }, locationName: 'National Highway 58' },
      { id: 'rishikesh-lakshman-jhula', name: 'Rishikesh Lakshman Jhula Chowk', position: { lat: 30.1245, lng: 78.3262 }, locationName: 'Badrinath Marg' },
      { id: 'haldwani-kathgodam', name: 'Haldwani Kathgodam Intersection', position: { lat: 29.2555, lng: 79.5401 }, locationName: 'Nainital Road' },
      { id: 'roorkee-iit-gate', name: 'Roorkee IIT Main Gate Crossing', position: { lat: 29.8665, lng: 77.8962 }, locationName: 'Civil Lines Rd' },
      { id: 'nainital-mall-road', name: 'Nainital Tallital Crossing', position: { lat: 29.3820, lng: 79.4582 }, locationName: 'Mall Road South' }
    ],
    parkingLots: [
      { name: 'Lot A', position: { lat: 30.3200, lng: 78.0400 } },
      { name: 'Lot B', position: { lat: 29.9600, lng: 78.1600 } }
    ],
    incidents: [
      { id: 'utk-inc-1', name: 'Rishikesh Tourist Jam', position: { lat: 30.1200, lng: 78.3200 }, details: 'Heavy tourist vehicle inflow.' }
    ],
    checkpoints: [
      { id: 'utk-chk-1', name: 'Haridwar Border Patrol', position: { lat: 29.8000, lng: 77.8500 }, details: 'Green tax verification checkpoint.' }
    ]
  },
  'Jammu and Kashmir': {
    name: 'Jammu and Kashmir',
    center: { lat: 34.0837, lng: 74.7973 },
    zoom: 8,
    controllers: [
      { id: 'srinagar-lal-chowk', name: 'Srinagar Lal Chowk Crossing', position: { lat: 34.0722, lng: 74.8111 }, locationName: 'Residency Road' },
      { id: 'jammu-gandhi-nagar', name: 'Jammu Gandhi Nagar Junction', position: { lat: 32.7095, lng: 74.8682 }, locationName: 'Apsara Road Crossing' },
      { id: 'anantnag-khanabal', name: 'Anantnag Khanabal Chowk', position: { lat: 33.7431, lng: 75.1299 }, locationName: 'KP Road' },
      { id: 'baramulla-main', name: 'Baramulla NH Crossing', position: { lat: 34.1982, lng: 74.3592 }, locationName: 'Srinagar-Uri Rd' },
      { id: 'kathua-highway', name: 'Kathua Toll Plazas Junction', position: { lat: 32.3725, lng: 75.5288 }, locationName: 'NH-44 Corridor' },
      { id: 'sopore-iqbal-market', name: 'Sopore Iqbal Market Crossing', position: { lat: 34.2952, lng: 74.4789 }, locationName: 'Bypass Road' }
    ],
    parkingLots: [
      { name: 'Lot A', position: { lat: 34.0700, lng: 74.8100 } },
      { name: 'Lot B', position: { lat: 32.7100, lng: 74.8600 } }
    ],
    incidents: [
      { id: 'jk-inc-1', name: 'Srinagar Bypass Slowdown', position: { lat: 34.0500, lng: 74.8300 }, details: 'Adaptive cycle adjusting signal times.' }
    ],
    checkpoints: [
      { id: 'jk-chk-1', name: 'NH-44 Security Checkpost', position: { lat: 32.5000, lng: 75.2000 }, details: 'Smart ANPR checkpoints.' }
    ]
  },
  'Himachal Pradesh': {
    name: 'Himachal Pradesh',
    center: { lat: 31.1048, lng: 77.1734 },
    zoom: 8,
    controllers: [
      { id: 'shimla-victory-tunnel', name: 'Shimla Victory Tunnel Crossing', position: { lat: 31.1065, lng: 77.1685 }, locationName: 'Cart Road NH-5' },
      { id: 'dharamshala-kotwali', name: 'Dharamshala Kotwali Bazaar Crossing', position: { lat: 32.2178, lng: 76.3268 }, locationName: 'Temple Road Junction' },
      { id: 'manali-mall-road', name: 'Manali Mall Road Crossing', position: { lat: 32.2415, lng: 77.1895 }, locationName: 'Rohtang Highway Bypass' },
      { id: 'solan-bypass', name: 'Solan Bypass NH-5 Crossing', position: { lat: 30.9082, lng: 77.0911 }, locationName: 'Kumarhatti Bypass' },
      { id: 'mandi-bus-stand', name: 'Mandi Bus Stand Junction', position: { lat: 31.5902, lng: 76.9212 }, locationName: 'Pathankot-Mandi Highway' },
      { id: 'hamirpur-gandhi-chowk', name: 'Hamirpur Gandhi Chowk Crossing', position: { lat: 31.6875, lng: 76.5235 }, locationName: 'Main Bazar Road' }
    ],
    parkingLots: [
      { name: 'Lot A', position: { lat: 31.1000, lng: 77.1600 } },
      { name: 'Lot B', position: { lat: 32.2400, lng: 77.1900 } }
    ],
    incidents: [
      { id: 'hp-inc-1', name: 'Shimla Tourist Congestion', position: { lat: 31.1030, lng: 77.1710 }, details: 'Tourist influx adaptive cycles active.' }
    ],
    checkpoints: [
      { id: 'hp-chk-1', name: 'Solan Police Checkpoint', position: { lat: 30.8500, lng: 77.0500 }, details: 'State entry verification checkpoint.' }
    ]
  },
  'Gujarat': {
    name: 'Gujarat',
    center: { lat: 23.0225, lng: 72.5714 },
    zoom: 8,
    controllers: [
      { id: 'ahmedabad-iskcon', name: 'Ahmedabad Iskcon Cross Road', position: { lat: 23.0265, lng: 72.5028 }, locationName: 'SG Highway & Iskcon Rd' },
      { id: 'gandhinagar-ch-3', name: 'Gandhinagar CH-3 Circle Junction', position: { lat: 23.2205, lng: 72.6412 }, locationName: 'K Road & CH Highway' },
      { id: 'surat-majura-gate', name: 'Surat Majura Gate Crossing', position: { lat: 21.1782, lng: 72.8222 }, locationName: 'Ring Road Interchange' },
      { id: 'vadodara-alkapuri', name: 'Vadodara Alkapuri Genda Circle', position: { lat: 22.3168, lng: 73.1785 }, locationName: 'RC Dutt Road' },
      { id: 'rajkot-yagnik-road', name: 'Rajkot Yagnik Road Crossing', position: { lat: 22.2982, lng: 70.7962 }, locationName: 'Dr. Yagnik Road' },
      { id: 'bhavnagar-ruvapari', name: 'Bhavnagar Ruvapari Road Crossing', position: { lat: 21.7712, lng: 72.1602 }, locationName: 'Highway bypass link' }
    ],
    parkingLots: [
      { name: 'Lot A', position: { lat: 23.0250, lng: 72.5000 } },
      { name: 'Lot B', position: { lat: 21.1800, lng: 72.8300 } }
    ],
    incidents: [
      { id: 'guj-inc-1', name: 'Surat Commuter Jam', position: { lat: 21.1700, lng: 72.8100 }, details: 'Rush hour commuter slowdown.' }
    ],
    checkpoints: [
      { id: 'guj-chk-1', name: 'Gift City Security Gate', position: { lat: 23.1600, lng: 72.6800 }, details: 'Smart ANPR cameras active.' }
    ]
  },
  'Rajasthan': {
    name: 'Rajasthan',
    center: { lat: 26.9124, lng: 75.7873 },
    zoom: 8,
    controllers: [
      { id: 'jaipur-rambagh', name: 'Jaipur Rambagh Circle Crossing', position: { lat: 26.8972, lng: 75.8085 }, locationName: 'Tonk Road' },
      { id: 'jodhpur-sojati-gate', name: 'Jodhpur Sojati Gate Junction', position: { lat: 26.2905, lng: 73.0299 }, locationName: 'Station Road' },
      { id: 'udaipur-chetak-circle', name: 'Udaipur Chetak Circle Crossing', position: { lat: 24.5932, lng: 73.6892 }, locationName: 'Hospital Road Link' },
      { id: 'kota-aerodrome', name: 'Kota Aerodrome Circle Junction', position: { lat: 25.1722, lng: 75.8501 }, locationName: 'Jhalawar Road' },
      { id: 'ajmer-kutchery', name: 'Ajmer Kutchery Road Junction', position: { lat: 26.4682, lng: 74.6342 }, locationName: 'Collectorate Circle' },
      { id: 'bikaner-soorsagar', name: 'Bikaner Soorsagar Circle Crossing', position: { lat: 28.0195, lng: 73.3152 }, locationName: 'Jaipur Road Link' }
    ],
    parkingLots: [
      { name: 'Lot A', position: { lat: 26.9100, lng: 75.8000 } },
      { name: 'Lot B', position: { lat: 26.2800, lng: 73.0200 } }
    ],
    incidents: [
      { id: 'raj-inc-1', name: 'Jaipur Walled City Congestion', position: { lat: 26.9200, lng: 75.8200 }, details: 'Tourist flow priority routing active.' }
    ],
    checkpoints: [
      { id: 'raj-chk-1', name: 'NH-48 Border Checkpoint', position: { lat: 26.9800, lng: 75.8800 }, details: 'Routine smart registration check.' }
    ]
  },
  'Kolkata': {
    name: 'Kolkata',
    center: { lat: 22.5645, lng: 88.3522 },
    zoom: 14,
    controllers: [
      { id: 'kol-esplanade', name: 'Esplanade Metro Junction', position: { lat: 22.5645, lng: 88.3522 }, locationName: 'Chowringhee Road' },
      { id: 'kol-howrah-bridge', name: 'Howrah Bridge Approach Crossing', position: { lat: 22.5855, lng: 88.3470 }, locationName: 'Brabourne Road' },
      { id: 'kol-park-street', name: 'Park Street & Camac St Junction', position: { lat: 22.5532, lng: 88.3533 }, locationName: 'Park Street Corridor' },
      { id: 'kol-gariahat', name: 'Gariahat Crossing', position: { lat: 22.5186, lng: 88.3683 }, locationName: 'Rashbehari Avenue' },
      { id: 'kol-shyambazar', name: 'Shyambazar Five Point Crossing', position: { lat: 22.6001, lng: 88.3698 }, locationName: 'APC Road' },
      { id: 'kol-salt-lake', name: 'Salt Lake Sector V Crossing', position: { lat: 22.5735, lng: 88.4331 }, locationName: 'College More Sector V' }
    ],
    parkingLots: [
      { name: 'Lot A', position: { lat: 22.5600, lng: 88.3500 } },
      { name: 'Lot B', position: { lat: 22.5700, lng: 88.4300 } }
    ],
    incidents: [
      { id: 'kol-inc-1', name: 'Shyambazar Slowdown', position: { lat: 22.5990, lng: 88.3680 }, details: 'Bus disruption. Diverting traffic.' }
    ],
    checkpoints: [
      { id: 'kol-chk-1', name: 'Salt Lake Speed Check', position: { lat: 22.5710, lng: 88.4280 }, details: 'Speed radar scan operational.' }
    ]
  },
  'Odisha': {
    name: 'Odisha',
    center: { lat: 20.2721, lng: 85.8400 },
    zoom: 8,
    controllers: [
      { id: 'bbsr-master-canteen', name: 'Bhubaneswar Master Canteen Junction', position: { lat: 20.2721, lng: 85.8400 }, locationName: 'Janpath Main Road' },
      { id: 'cuttack-link-road', name: 'Cuttack Link Road Crossing', position: { lat: 20.4439, lng: 85.8752 }, locationName: 'NH-16 Junction' },
      { id: 'rkl-bisra-road', name: 'Rourkela Bisra Road Intersection', position: { lat: 22.2269, lng: 84.8519 }, locationName: 'Main Station Road' },
      { id: 'puri-grand-road', name: 'Puri Grand Road Crossing', position: { lat: 19.8049, lng: 85.8178 }, locationName: 'Bada Danda Marg' },
      { id: 'sambalpur-golbazar', name: 'Sambalpur Golbazar Crossing', position: { lat: 21.4669, lng: 83.9812 }, locationName: 'G.M. College Road Link' },
      { id: 'berhampur-kamapalli', name: 'Berhampur Kamapalli Main Crossing', position: { lat: 19.3149, lng: 84.7925 }, locationName: 'Gopalpur Road Link' }
    ],
    parkingLots: [
      { name: 'Lot A', position: { lat: 20.2700, lng: 85.8300 } },
      { name: 'Lot B', position: { lat: 19.8000, lng: 85.8200 } }
    ],
    incidents: [
      { id: 'odi-inc-1', name: 'Cuttack Highway Congestion', position: { lat: 20.4400, lng: 85.8700 }, details: 'Freight traffic build up.' }
    ],
    checkpoints: [
      { id: 'odi-chk-1', name: 'Bhubaneswar Airport Entry', position: { lat: 20.2500, lng: 85.8100 }, details: 'Surveillance checkpost.' }
    ]
  },
  'Chennai': {
    name: 'Chennai',
    center: { lat: 13.0418, lng: 80.2341 },
    zoom: 14,
    controllers: [
      { id: 'che-tnagar', name: 'T. Nagar Duraiswamy Road Crossing', position: { lat: 13.0418, lng: 80.2341 }, locationName: 'Usman Road Interchange' },
      { id: 'che-adyar', name: 'Adyar Junction Crossing', position: { lat: 13.0063, lng: 80.2575 }, locationName: 'Lattice Bridge Rd' },
      { id: 'che-koyambedu', name: 'Koyambedu Roundtana Crossing', position: { lat: 13.0694, lng: 80.1948 }, locationName: 'Inner Ring Road' },
      { id: 'che-guindy', name: 'Guindy Kathipara Interchange Link', position: { lat: 13.0067, lng: 80.2206 }, locationName: 'GST Road Interchange' },
      { id: 'che-mylapore', name: 'Mylapore Luz Corner Crossing', position: { lat: 13.0308, lng: 80.2628 }, locationName: 'Royapettah High Road' },
      { id: 'che-tambaram', name: 'Tambaram Main Signal Crossing', position: { lat: 12.9229, lng: 80.1275 }, locationName: 'Velachery Main Rd' }
    ],
    parkingLots: [
      { name: 'Lot A', position: { lat: 13.0400, lng: 80.2300 } },
      { name: 'Lot B', position: { lat: 13.0000, lng: 80.2200 } }
    ],
    incidents: [
      { id: 'che-inc-1', name: 'Kathipara Commuter Backlog', position: { lat: 13.0100, lng: 80.2100 }, details: 'Heavy gridlock. Diverting traffic.' }
    ],
    checkpoints: [
      { id: 'che-chk-1', name: 'Tambaram Highway Outpost', position: { lat: 12.9200, lng: 80.1200 }, details: 'Smart emission monitoring active.' }
    ]
  },
  'Hyderabad': {
    name: 'Hyderabad',
    center: { lat: 17.4401, lng: 78.3489 },
    zoom: 14,
    controllers: [
      { id: 'hyd-charminar', name: 'Charminar Main Crossing', position: { lat: 17.3616, lng: 78.4747 }, locationName: 'Pathargatti Rd' },
      { id: 'hyd-gachibowli', name: 'Gachibowli ORR Junction', position: { lat: 17.4401, lng: 78.3489 }, locationName: 'Gachibowli Flyover Ramp' },
      { id: 'hyd-madhapur', name: 'Madhapur Cyber Towers Crossing', position: { lat: 17.4506, lng: 78.3807 }, locationName: 'Hitech City Road' },
      { id: 'hyd-secunderabad', name: 'Secunderabad Patny Circle Crossing', position: { lat: 17.4436, lng: 78.4983 }, locationName: 'MG Road' },
      { id: 'hyd-begumpet', name: 'Begumpet Airport Plaza Junction', position: { lat: 17.4375, lng: 78.4619 }, locationName: 'Begumpet Road' },
      { id: 'hyd-jubilee', name: 'Jubilee Hills Checkpost Circle', position: { lat: 17.4262, lng: 78.4116 }, locationName: 'Road No 36 Junction' }
    ],
    parkingLots: [
      { name: 'Lot A', position: { lat: 17.4400, lng: 78.3800 } },
      { name: 'Lot B', position: { lat: 17.4400, lng: 78.3500 } }
    ],
    incidents: [
      { id: 'hyd-inc-1', name: 'Madhapur Traffic Peak', position: { lat: 17.4510, lng: 78.3810 }, details: 'Queue optimizer adjusting cycle timings.' }
    ],
    checkpoints: [
      { id: 'hyd-chk-1', name: 'Gachibowli Security Scan', position: { lat: 17.4300, lng: 78.3400 }, details: 'Surveillance cameras active.' }
    ]
  },
  'Madhya Pradesh': {
    name: 'Madhya Pradesh',
    center: { lat: 23.2324, lng: 77.4326 },
    zoom: 8,
    controllers: [
      { id: 'bhopal-board-office', name: 'Bhopal Board Office Crossing', position: { lat: 23.2324, lng: 77.4326 }, locationName: 'Link Road 1' },
      { id: 'indore-rajwada', name: 'Indore Rajwada Palace Chowk', position: { lat: 22.7196, lng: 75.8577 }, locationName: 'MG Road Crossing' },
      { id: 'gwalior-maharaj-bada', name: 'Gwalior Maharaj Bada Crossing', position: { lat: 26.2039, lng: 78.1576 }, locationName: 'Bada Bazar Road' },
      { id: 'jabalpur-civic-center', name: 'Jabalpur Civic Center Junction', position: { lat: 23.1678, lng: 79.9328 }, locationName: 'Marhatal Road' },
      { id: 'ujjain-mahakal', name: 'Ujjain Mahakal Temple Crossing', position: { lat: 23.1827, lng: 75.7682 }, locationName: 'Hari Phatak Overbridge' },
      { id: 'sagar-teen-batti', name: 'Sagar Teen Batti Crossing', position: { lat: 23.8388, lng: 78.7378 }, locationName: 'Main Market Link' }
    ],
    parkingLots: [
      { name: 'Lot A', position: { lat: 23.2300, lng: 77.4300 } },
      { name: 'Lot B', position: { lat: 22.7200, lng: 75.8600 } }
    ],
    incidents: [
      { id: 'mp-inc-1', name: 'Indore Highway Congestion', position: { lat: 22.7500, lng: 75.8900 }, details: 'Adaptive scheduling active.' }
    ],
    checkpoints: [
      { id: 'mp-chk-1', name: 'Bhopal Security Checkpost', position: { lat: 23.2200, lng: 77.4400 }, details: 'Telemetry verification online.' }
    ]
  },
  'Uttar Pradesh': {
    name: 'Uttar Pradesh',
    center: { lat: 26.8467, lng: 80.9462 },
    zoom: 8,
    controllers: [
      { id: 'lucknow-hazratganj', name: 'Lucknow Hazratganj Crossing', position: { lat: 26.8467, lng: 80.9462 }, locationName: 'Vidhan Sabha Marg' },
      { id: 'kanpur-bada-chauraha', name: 'Kanpur Bada Chauraha Junction', position: { lat: 26.4719, lng: 80.3512 }, locationName: 'Mall Road Link' },
      { id: 'noida-sec-18', name: 'Noida Sector 18 Crossing', position: { lat: 28.5708, lng: 77.3261 }, locationName: 'Atta Market Corridor' },
      { id: 'g-noida-pari-chowk', name: 'Greater Noida Pari Chowk Junction', position: { lat: 28.4671, lng: 77.5135 }, locationName: 'Yamuna Expressway Link' },
      { id: 'ghaziabad-hapur', name: 'Ghaziabad Hapur Chauraha Crossing', position: { lat: 28.6629, lng: 77.4378 }, locationName: 'Grand Trunk Road' },
      { id: 'varanasi-godowlia', name: 'Varanasi Godowlia Crossing', position: { lat: 25.3082, lng: 83.0039 }, locationName: 'Dashashwamedh Road' }
    ],
    parkingLots: [
      { name: 'Lot A', position: { lat: 26.8400, lng: 80.9400 } },
      { name: 'Lot B', position: { lat: 28.5700, lng: 77.3200 } }
    ],
    incidents: [
      { id: 'up-inc-1', name: 'Varanasi Tourist Influx', position: { lat: 25.3100, lng: 83.0100 }, details: 'Tourist bottleneck. Holding lanes.' }
    ],
    checkpoints: [
      { id: 'up-chk-1', name: 'Noida Border Checkpoint', position: { lat: 28.5900, lng: 77.3000 }, details: 'License plate verification checkpoint.' }
    ]
  },
  'Bihar': {
    name: 'Bihar',
    center: { lat: 25.6096, lng: 85.1376 },
    zoom: 8,
    controllers: [
      { id: 'patna-dak-bungalow', name: 'Patna Dak Bungalow Crossing', position: { lat: 25.6096, lng: 85.1376 }, locationName: 'Bailey Road' },
      { id: 'gaya-gol-bagicha', name: 'Gaya Gol Bagicha Crossing', position: { lat: 24.7955, lng: 84.9994 }, locationName: 'Station Road link' },
      { id: 'bhagalpur-station', name: 'Bhagalpur Station Chowk Crossing', position: { lat: 25.2445, lng: 87.0135 }, locationName: 'Khalifa Bagh Rd Link' },
      { id: 'muzaffarpur-kalyani', name: 'Muzaffarpur Kalyani Chowk Junction', position: { lat: 26.1209, lng: 85.3837 }, locationName: 'Saraiyaganj Road' },
      { id: 'darbhanga-lalbagh', name: 'Darbhanga Lalbagh Crossing', position: { lat: 26.1542, lng: 85.8918 }, locationName: 'Donar Road link' },
      { id: 'ara-ramna-ground', name: 'Ara Ramna Ground Crossing', position: { lat: 25.5583, lng: 84.6681 }, locationName: 'Arrah Bypass Link' }
    ],
    parkingLots: [
      { name: 'Lot A', position: { lat: 25.6100, lng: 85.1400 } },
      { name: 'Lot B', position: { lat: 24.8000, lng: 85.0000 } }
    ],
    incidents: [
      { id: 'bih-inc-1', name: 'Patna Station Congestion', position: { lat: 25.6050, lng: 85.1300 }, details: 'Rickshaw queue bottleneck. AI adjusting cycles.' }
    ],
    checkpoints: [
      { id: 'bih-chk-1', name: 'Gaya Highway Patrol Gate', position: { lat: 24.7500, lng: 84.9500 }, details: 'Pollution scan operational.' }
    ]
  }
};

function App() {
  // Role-based auth
  const [role, setRole] = useState(null); // null | 'admin' | 'user'
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  const handleLogin = (selectedRole, userData) => {
    setRole(selectedRole);
    setLoggedInUser(userData);
    setActiveTab(selectedRole === 'admin' ? 'dashboard' : 'home');
  };

  const handleLogout = () => {
    setRole(null);
    setLoggedInUser(null);
    setActiveTab('home');
  };

  const token = 'mock-token'; // Fallback token since auth was removed

  // Custom Cursor Eyecatcher Refs and States
  const cursorRingRef = useRef(null);
  const [cursorHovered, setCursorHovered] = useState(false);
  const [cursorClicked, setCursorClicked] = useState(false);
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    // Physics / Position variables
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringVel = { x: 0, y: 0 };
    
    // Smooth Scale state inside the loop
    let currentScale = 1.0;
    let isVisible = false;
    let isOverInput = false;
    let animationFrameId = null;

    // Synchronous state mirror flags to avoid stale closure state values in RAF loop
    let isHovered = false;
    let isClicked = false;

    const updateCursorOpacity = (opacityVal) => {
      if (cursorRingRef.current) cursorRingRef.current.style.opacity = opacityVal;
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!isVisible && !isOverInput) {
        isVisible = true;
        updateCursorOpacity(1);
      }
    };

    const handleMouseDown = (e) => {
      isClicked = true;
      setCursorClicked(true);

      // Spawn click shockwave ripple at mouse coordinates
      const newRipple = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY
      };
      setRipples((prev) => [...prev, newRipple]);

      // Automatically clean up ripple from DOM after animation completes (600ms)
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    };
    
    const handleMouseUp = () => {
      isClicked = false;
      setCursorClicked(false);
    };

    const handleMouseLeave = () => {
      isVisible = false;
      updateCursorOpacity(0);
    };

    const handleMouseEnter = () => {
      isVisible = true;
      if (!isOverInput) updateCursorOpacity(1);
    };

    const tick = () => {
      // Interpolate Aura position with spring physics
      const ease = 0.12; // slightly slower trailing for smoother fluid tail feel
      const dx = mouse.x - ring.x;
      const dy = mouse.y - ring.y;

      ringVel.x = dx * ease;
      ringVel.y = dy * ease;

      ring.x += ringVel.x;
      ring.y += ringVel.y;

      if (cursorRingRef.current) {
        // Calculate velocity magnitude (speed)
        const speed = Math.sqrt(ringVel.x * ringVel.x + ringVel.y * ringVel.y);
        
        // Calculate direction angle of movement
        const angle = Math.atan2(ringVel.y, ringVel.x);
        
        // Squash / stretch factors based on speed (organic teardrop deformation)
        const maxStretch = 0.4;
        const stretch = Math.min(speed * 0.04, maxStretch);
        const scaleX = 1 + stretch;
        const scaleY = 1 - stretch;

        // Smoothly interpolate scale for hovered / clicked states
        let targetScale = 1.0;
        if (isClicked) {
          targetScale = 0.7;
        } else if (isHovered) {
          targetScale = 1.6;
        }

        currentScale += (targetScale - currentScale) * 0.15;

        const finalScaleX = currentScale * scaleX;
        const finalScaleY = currentScale * scaleY;

        // Translate the ring to the coordinates, apply movement rotation, and scale
        cursorRingRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) rotate(${angle}rad) scale(${finalScaleX}, ${finalScaleY})`;
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    // Run tick loop
    animationFrameId = requestAnimationFrame(tick);

    // Event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      const isInput = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'SELECT' || 
        target.closest('input') || 
        target.closest('textarea') ||
        target.closest('select');
      
      isOverInput = !!isInput;
      if (isInput) {
        updateCursorOpacity(0);
      } else if (isVisible) {
        updateCursorOpacity(1);
      }
      
      let isInteractive = false;
      try {
        const computedStyle = window.getComputedStyle(target);
        if (computedStyle && computedStyle.cursor === 'pointer') {
          isInteractive = true;
        }
      } catch (err) {}

      if (!isInteractive) {
        isInteractive = 
          target.tagName === 'BUTTON' || 
          target.tagName === 'A' || 
          target.closest('a') ||
          target.closest('button') ||
          target.closest('.nav-item') ||
          target.closest('.stat-card') ||
          target.closest('.parking-slot') ||
          target.closest('.action-btn') ||
          target.closest('.toast-close') ||
          target.closest('.dismiss-btn');
      }

      isHovered = !!isInteractive;
      setCursorHovered(!!isInteractive);
    };

    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  // Connection State
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);

  // Floating Toast Notifications state
  const [notifications, setNotifications] = useState([]);

  // Lifted Traffic simulation states
  const [phase, setPhase] = useState('NS-GREEN');
  const [timeLeft, setTimeLeft] = useState(15);
  const [isOverride, setIsOverride] = useState(false);
  const [overrideTarget, setOverrideTarget] = useState(null); // 'NS' or 'EW'
  const [carsNS, setCarsNS] = useState(6);
  const [carsEW, setCarsEW] = useState(8);
  const [throughput, setThroughput] = useState(1420);
  const timerRef = useRef(null);

  // India City & Traffic Junction Selection States
  const [selectedCityName, setSelectedCityName] = useState('New Delhi');
  const [selectedControllerId, setSelectedControllerId] = useState('delhi-cp-1');

  // Cache individual telemetry states for all controllers
  const [controllersState, setControllersState] = useState(() => {
    const initial = {};
    Object.values(INDIA_CITIES).forEach(city => {
      city.controllers.forEach((ctrl, index) => {
        initial[ctrl.id] = {
          phase: index % 2 === 0 ? 'NS-GREEN' : 'EW-GREEN',
          timeLeft: index % 2 === 0 ? 15 : 12,
          isOverride: false,
          overrideTarget: null,
          carsNS: index % 2 === 0 ? 6 : 4,
          carsEW: index % 2 === 0 ? 8 : 5,
          throughput: index % 2 === 0 ? 1420 : 980
        };
      });
    });
    return initial;
  });

  const prevControllerIdRef = useRef(selectedControllerId);

  // Sync state variables to state map on controller ID switch
  useEffect(() => {
    const prevId = prevControllerIdRef.current;
    
    // Save current active state parameters
    setControllersState(prev => ({
      ...prev,
      [prevId]: {
        phase,
        timeLeft,
        isOverride,
        overrideTarget,
        carsNS,
        carsEW,
        throughput
      }
    }));

    // Load selected controller state properties
    const newState = controllersState[selectedControllerId];
    if (newState) {
      setPhase(newState.phase);
      setTimeLeft(newState.timeLeft);
      setIsOverride(newState.isOverride);
      setOverrideTarget(newState.overrideTarget);
      setCarsNS(newState.carsNS);
      setCarsEW(newState.carsEW);
      setThroughput(newState.throughput);
    }

    prevControllerIdRef.current = selectedControllerId;
  }, [selectedControllerId]);

  // Switch default controller when city changes
  useEffect(() => {
    const cityData = INDIA_CITIES[selectedCityName];
    if (cityData && cityData.controllers.length > 0) {
      setSelectedControllerId(cityData.controllers[0].id);
    }
  }, [selectedCityName]);

  // Background simulation for inactive controllers (OFFLINE FALLBACK)
  useEffect(() => {
    if (socketConnected) return;

    const interval = setInterval(() => {
      setControllersState(prev => {
        const next = { ...prev };
        let updated = false;

        Object.keys(next).forEach(id => {
          if (id === selectedControllerId) return; // skip active one, handled by active simulator

          const ctrl = next[id];
          if (ctrl.isOverride) return; // skip if overridden

          updated = true;
          // Decrement time
          let nextTimeLeft = ctrl.timeLeft - 1;
          let nextPhase = ctrl.phase;
          if (nextTimeLeft <= 0) {
            switch (ctrl.phase) {
              case 'NS-GREEN':
                nextTimeLeft = 3;
                nextPhase = 'NS-YELLOW';
                break;
              case 'NS-YELLOW':
                nextTimeLeft = 15;
                nextPhase = 'EW-GREEN';
                break;
              case 'EW-GREEN':
                nextTimeLeft = 3;
                nextPhase = 'EW-YELLOW';
                break;
              case 'EW-YELLOW':
                nextTimeLeft = 15;
                nextPhase = 'NS-GREEN';
                break;
              default:
                nextTimeLeft = 15;
                nextPhase = 'NS-GREEN';
            }
          }

          // Cars arriving/departing
          let nextCarsNS = ctrl.carsNS;
          let nextCarsEW = ctrl.carsEW;
          let nextThroughput = ctrl.throughput;

          if (Math.random() > 0.5) {
            nextCarsNS = Math.min(nextCarsNS + 1, 25);
          }
          if (Math.random() > 0.5) {
            nextCarsEW = Math.min(nextCarsEW + 1, 25);
          }

          if (nextPhase === 'NS-GREEN') {
            const removed = Math.min(nextCarsNS, Math.floor(Math.random() * 2) + 1);
            nextCarsNS -= removed;
            nextThroughput += removed;
          } else if (nextPhase === 'EW-GREEN') {
            const removed = Math.min(nextCarsEW, Math.floor(Math.random() * 2) + 1);
            nextCarsEW -= removed;
            nextThroughput += removed;
          }

          next[id] = {
            ...ctrl,
            timeLeft: nextTimeLeft,
            phase: nextPhase,
            carsNS: nextCarsNS,
            carsEW: nextCarsEW,
            throughput: nextThroughput
          };
        });

        return updated ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedControllerId, socketConnected]);

  // Generate unique, realistic initial parking slot setups for each city dynamically
  const generateCitySlots = (cityName) => {
    const city = INDIA_CITIES[cityName];
    const initial = {};
    if (!city) return initial;
    
    (city.parkingLots || []).forEach((lot, lotIndex) => {
      const slotPrefix = lot.name.split(' ').pop(); // e.g. "A", "B", "C"
      const numSlots = lotIndex === 0 ? 16 : lotIndex === 1 ? 12 : 8;
      
      const slots = [];
      for (let i = 1; i <= numSlots; i++) {
        const id = `${slotPrefix}-${i < 10 ? '0' + i : i}`;
        
        let status = 'available';
        const rand = (i + lotIndex + cityName.length) % 4; // Add cityName.length to ensure diversity across cities
        if (rand === 0) status = 'occupied';
        else if (rand === 1 && i % 3 === 0) status = 'charging';
        else if (rand === 2 && i % 5 === 0) status = 'reserved';
        
        const isEV = i % 2 === 0;
        const chargeLevel = status === 'charging' ? (20 + (i * 7) % 70) : undefined;
        
        slots.push({ id, status, isEV, chargeLevel });
      }
      initial[lot.name] = slots;
    });
    return initial;
  };

  // Cache state for all cities' parking slots
  const [citiesParkingState, setCitiesParkingState] = useState(() => {
    const initial = {};
    Object.keys(INDIA_CITIES).forEach(cityName => {
      initial[cityName] = generateCitySlots(cityName);
    });
    return initial;
  });

  // Cache state for all cities' bookings
  const [citiesBookingsState, setCitiesBookingsState] = useState(() => {
    const initial = {};
    Object.keys(INDIA_CITIES).forEach(cityName => {
      initial[cityName] = {};
    });
    return initial;
  });

  // Current active city parking lots & bookings
  const [lotsData, setLotsData] = useState(() => generateCitySlots('New Delhi'));
  const [bookings, setBookings] = useState({}); // Stores confirmation info per slot for the active city

  const prevCityNameRef = useRef(selectedCityName);

  // Sync parking lots and bookings when city changes
  useEffect(() => {
    const prevCity = prevCityNameRef.current;
    
    // Save current active state parameters of previous city to cache
    setCitiesParkingState(prev => ({
      ...prev,
      [prevCity]: lotsData
    }));
    setCitiesBookingsState(prev => ({
      ...prev,
      [prevCity]: bookings
    }));

    // Load newly selected city's parking lot data and bookings
    const newCityParking = citiesParkingState[selectedCityName];
    if (newCityParking) {
      setLotsData(newCityParking);
    } else {
      const generated = generateCitySlots(selectedCityName);
      setLotsData(generated);
    }

    const newCityBookings = citiesBookingsState[selectedCityName];
    if (newCityBookings) {
      setBookings(newCityBookings);
    } else {
      setBookings({});
    }

    prevCityNameRef.current = selectedCityName;
  }, [selectedCityName]);

  // Lifted Alerts state
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', text: 'Heavy congestion detected on Main St (Westbound). AI routing adjustment active.', time: 'Just now' },
    { id: 2, type: 'info', text: 'Signal Intersection B switched to automatic AI optimization mode.', time: '5 mins ago' },
    { id: 3, type: 'success', text: 'Smart Parking Lot C sensor diagnostics complete. 100% operational.', time: '12 mins ago' },
    { id: 4, type: 'danger', text: 'Emergency override triggered for signal B: Fire department vehicle priority.', time: '25 mins ago' }
  ]);

  // Timers to prevent congestion notifications spamming in offline mode
  const lastOfflineCongestionTime = useRef(0);

  // Add notification to Toast stack
  const addNotification = (notif) => {
    const id = notif.id || Date.now();
    setNotifications((prev) => [
      ...prev,
      { id, type: notif.type, title: notif.title, desc: notif.desc }
    ]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  // Remove notification from Toast stack
  const removeNotification = (id) => {
    setNotifications((prev) => prev.map(n => n.id === id ? { ...n, dismissing: true } : n));
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 300);
  };

  // Establish Socket.io connection
  useEffect(() => {
    if (!token) {
      setSocketConnected(false);
      return;
    }

    const socket = io('http://localhost:5000', {
      auth: { token },
      reconnectionAttempts: 3,
      timeout: 5000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to traffic telemetry server.');
      setSocketConnected(true);
      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'Telemetry Synced',
        desc: 'Connected to live municipal Socket.io server. Synchronizing grid telemetry.'
      });
    });

    socket.on('initialState', (state) => {
      setPhase(state.phase);
      setTimeLeft(state.timeLeft);
      setIsOverride(state.isOverride);
      setOverrideTarget(state.overrideTarget);
      setCarsNS(state.carsNS);
      setCarsEW(state.carsEW);
      setThroughput(state.throughput);
      setLotsData(state.lotsData);
      setBookings(state.bookings);
      setAlerts(state.alerts);
    });

    socket.on('trafficUpdate', (data) => {
      setPhase(data.phase);
      setTimeLeft(data.timeLeft);
      setIsOverride(data.isOverride);
      setOverrideTarget(data.overrideTarget);
      setCarsNS(data.carsNS);
      setCarsEW(data.carsEW);
      setThroughput(data.throughput);
    });

    socket.on('parkingUpdate', (data) => {
      setLotsData(data.lotsData);
      setBookings(data.bookings);
    });

    socket.on('alertsUpdate', (data) => {
      setAlerts(data);
    });

    socket.on('smartNotification', (notif) => {
      addNotification(notif);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server.');
      setSocketConnected(false);
      addNotification({
        id: Date.now(),
        type: 'danger',
        title: 'Telemetry Offline',
        desc: 'Disconnected from telemetry server. Switching to local grid simulator.'
      });
    });

    socket.on('connect_error', () => {
      console.log('Telemetry server offline. Running in local fallback mode.');
      setSocketConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // Local countdown timer logic (OFFLINE FALLBACK)
  useEffect(() => {
    if (socketConnected) return;

    if (isOverride) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Transition phases
          setPhase((currentPhase) => {
            switch (currentPhase) {
              case 'NS-GREEN':
                setTimeLeft(3);
                return 'NS-YELLOW';
              case 'NS-YELLOW':
                setTimeLeft(15);
                return 'EW-GREEN';
              case 'EW-GREEN':
                setTimeLeft(3);
                return 'EW-YELLOW';
              case 'EW-YELLOW':
                setTimeLeft(15);
                return 'NS-GREEN';
              default:
                setTimeLeft(15);
                return 'NS-GREEN';
            }
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, isOverride, socketConnected]);

  // Local traffic simulation (OFFLINE FALLBACK)
  useEffect(() => {
    if (socketConnected) return;

    const trafficInterval = setInterval(() => {
      // 1. Cars arriving randomly
      let updatedCarsNS = carsNS;
      let updatedCarsEW = carsEW;
      if (Math.random() > 0.4) {
        updatedCarsNS = Math.min(carsNS + Math.floor(Math.random() * 2) + 1, 25);
        setCarsNS(updatedCarsNS);
      }
      if (Math.random() > 0.4) {
        updatedCarsEW = Math.min(carsEW + Math.floor(Math.random() * 2) + 1, 25);
        setCarsEW(updatedCarsEW);
      }

      // 2. Cars departing based on green phase
      if (phase === 'NS-GREEN') {
        setCarsNS(prev => {
          const removed = Math.min(prev, Math.floor(Math.random() * 3) + 2);
          if (removed > 0) setThroughput(t => t + removed);
          return Math.max(prev - removed, 0);
        });
      } else if (phase === 'EW-GREEN') {
        setCarsEW(prev => {
          const removed = Math.min(prev, Math.floor(Math.random() * 3) + 2);
          if (removed > 0) setThroughput(t => t + removed);
          return Math.max(prev - removed, 0);
        });
      }

      // Offline Smart Notification: Congestion alert
      if ((updatedCarsNS > 12 || updatedCarsEW > 12) && (Date.now() - lastOfflineCongestionTime.current > 20000)) {
        const target = updatedCarsNS > 12 ? 'Intersection A (North-South)' : 'Intersection B (East-West)';
        lastOfflineCongestionTime.current = Date.now();
        addNotification({
          id: Date.now(),
          type: 'warning',
          title: 'AI Queue Optimization (Offline)',
          desc: `Backlog detected at ${target}. Adjusting signal cycles.`
        });
      }
    }, 2000);

    return () => clearInterval(trafficInterval);
  }, [phase, carsNS, carsEW, socketConnected]);

  // Local EV Battery charging progression simulator (OFFLINE FALLBACK)
  useEffect(() => {
    if (socketConnected) return;

    const chargeInterval = setInterval(() => {
      let updated = false;
      let finishedLot = null;
      let finishedSlotId = null;

      setLotsData(prev => {
        const nextState = {};
        Object.entries(prev).forEach(([lotName, slots]) => {
          nextState[lotName] = slots.map(slot => {
            if (slot.isEV && slot.status === 'charging') {
              const step = Math.floor(Math.random() * 4) + 4;
              const newLevel = Math.min((slot.chargeLevel || 0) + step, 100);
              updated = true;

              if (newLevel >= 100) {
                finishedLot = lotName;
                finishedSlotId = slot.id;
                return { ...slot, status: 'charged', chargeLevel: 100 };
              }
              return { ...slot, chargeLevel: newLevel };
            }
            return slot;
          });
        });
        return updated ? nextState : prev;
      });

      if (finishedSlotId) {
        // Create alert
        const completedAlert = {
          id: Date.now(),
          type: 'success',
          text: `EV Charging completed in ${finishedLot} Bay ${finishedSlotId} (Offline).`,
          time: 'Just now'
        };
        setAlerts(prev => [completedAlert, ...prev.slice(0, 19)]);

        // Display toast
        addNotification({
          id: Date.now() + 1,
          type: 'success',
          title: 'EV Charging Complete (Offline)',
          desc: `Vehicle in ${finishedLot} Bay ${finishedSlotId} fully charged. Connection detaching.`
        });
      }
    }, 3000);

    return () => clearInterval(chargeInterval);
  }, [socketConnected]);

  // Trigger override
  const triggerOverride = (direction) => {
    if (socketConnected && socketRef.current) {
      socketRef.current.emit('overrideSignal', direction);
    } else {
      // Fallback
      setIsOverride(true);
      setOverrideTarget(direction);
      setPhase(direction === 'NS' ? 'NS-GREEN' : 'EW-GREEN');
      setTimeLeft(0);

      const newAlert = {
        id: Date.now(),
        type: 'danger',
        text: `Emergency manual override triggered for Signal ${direction === 'NS' ? 'A (North-South)' : 'B (East-West)'} (Offline).`,
        time: 'Just now'
      };
      setAlerts(prev => [newAlert, ...prev.slice(0, 19)]);

      addNotification({
        id: Date.now() + 1,
        type: 'danger',
        title: 'Emergency Signal Override',
        desc: `Signal corridor overridden for ${direction === 'NS' ? 'North-South' : 'East-West'} route priority (Offline).`
      });
    }
  };

  // Reset override
  const releaseOverride = () => {
    if (socketConnected && socketRef.current) {
      socketRef.current.emit('releaseOverride');
    } else {
      // Fallback
      setIsOverride(false);
      setOverrideTarget(null);
      setTimeLeft(15);
      setPhase('NS-GREEN');

      const newAlert = {
        id: Date.now(),
        type: 'info',
        text: `Signal override released. Resumed local simulation AI control.`,
        time: 'Just now'
      };
      setAlerts(prev => [newAlert, ...prev.slice(0, 19)]);

      addNotification({
        id: Date.now() + 1,
        type: 'info',
        title: 'AI Scheduler Resumed',
        desc: 'Local signal override cleared. Traffic flow returned to adaptive model control (Offline).'
      });
    }
  };

  // Handle parking reservation
  const handleBookSlot = (lotName, bookingDetails) => {
    if (socketConnected && socketRef.current) {
      socketRef.current.emit('bookSlot', {
        lotName,
        slotId: bookingDetails.slotId,
        plate: bookingDetails.plate,
        duration: bookingDetails.duration,
        vehicleType: bookingDetails.vehicleType
      });
    } else {
      // Fallback local updates
      setLotsData(prev => {
        const updatedLot = prev[lotName].map(slot => {
          if (slot.id === bookingDetails.slotId) {
            return { ...slot, status: 'reserved', chargeLevel: slot.isEV ? 0 : undefined };
          }
          return slot;
        });
        return {
          ...prev,
          [lotName]: updatedLot
        };
      });

      setBookings(prev => ({
        ...prev,
        [bookingDetails.slotId]: {
          plate: bookingDetails.plate,
          duration: bookingDetails.duration,
          vehicleType: bookingDetails.vehicleType,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      }));

      const newAlert = {
        id: Date.now(),
        type: 'success',
        text: `Smart Bay ${bookingDetails.slotId} reserved in ${lotName} for plate ${bookingDetails.plate} (Offline).`,
        time: 'Just now'
      };
      setAlerts(prev => [newAlert, ...prev.slice(0, 19)]);

      addNotification({
        id: Date.now() + 1,
        type: 'success',
        title: 'Smart Bay Booked',
        desc: `Bay ${bookingDetails.slotId} in ${lotName} reserved successfully.`
      });

      // Local Routing recommendation trigger
      const lotSlots = lotsData[lotName];
      const vacantCount = lotSlots.filter(s => s.status === 'available').length;
      const capacity = lotSlots.length;
      const occupancyPercentage = ((capacity - vacantCount) / capacity) * 100;

      if (occupancyPercentage > 85) {
        let bestAltLot = null;
        let maxVacancy = 0;
        Object.entries(lotsData).forEach(([altLotName, altSlots]) => {
          if (altLotName !== lotName) {
            const avail = altSlots.filter(s => s.status === 'available').length;
            if (avail > maxVacancy) {
              maxVacancy = avail;
              bestAltLot = altLotName;
            }
          }
        });

        if (bestAltLot && maxVacancy > 2) {
          addNotification({
            id: Date.now() + 2,
            type: 'warning',
            title: 'AI Smart Routing Recommendation',
            desc: `${lotName} is at ${Math.round(occupancyPercentage)}% capacity. Recommend routing vehicles to ${bestAltLot} (${maxVacancy} vacancies).`
          });
        }
      }
    }
  };

  // Start EV charging
  const handleStartCharging = (lotName, slotId) => {
    if (socketConnected && socketRef.current) {
      socketRef.current.emit('startCharging', { lotName, slotId });
    } else {
      // Fallback local updates
      setLotsData(prev => {
        const updatedLot = prev[lotName].map(slot => {
          if (slot.id === slotId && slot.isEV) {
            return { ...slot, status: 'charging', chargeLevel: 0 };
          }
          return slot;
        });
        return {
          ...prev,
          [lotName]: updatedLot
        };
      });

      const newAlert = {
        id: Date.now(),
        type: 'info',
        text: `EV charging sequence started for ${lotName} Bay ${slotId} (Offline mode).`,
        time: 'Just now'
      };
      setAlerts(prev => [newAlert, ...prev.slice(0, 19)]);

      addNotification({
        id: Date.now() + 1,
        type: 'info',
        title: 'EV Charging Started',
        desc: `Charging initiated for ${lotName} Bay ${slotId} (Offline mode).`
      });
    }
  };

  // Handle alert dismissal
  const handleDismissAlert = (id) => {
    if (socketConnected && socketRef.current) {
      socketRef.current.emit('dismissAlert', id);
    } else {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }
  };

  // Helper to determine light state for a specific signal
  const getLightState = (signal) => {
    if (signal === 'NS') {
      if (phase === 'NS-GREEN') return 'green';
      if (phase === 'NS-YELLOW') return 'yellow';
      return 'red';
    } else { // EW
      if (phase === 'EW-GREEN') return 'green';
      if (phase === 'EW-YELLOW') return 'yellow';
      return 'red';
    }
  };

  const nsLightState = getLightState('NS');
  const ewLightState = getLightState('EW');

  // Compute parking vacancy map dynamically
  const parkingSlotsVacancies = {};
  Object.entries(lotsData).forEach(([lotName, slots]) => {
    parkingSlotsVacancies[lotName] = (slots || []).filter(s => s.status === 'available').length;
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Home
            setActiveTab={setActiveTab}
            nsLightState={nsLightState}
            ewLightState={ewLightState}
            carsNS={carsNS}
            carsEW={carsEW}
            parkingSlots={parkingSlotsVacancies}
            alerts={alerts}
            onDismissAlert={handleDismissAlert}
            selectedCityName={selectedCityName}
            selectedControllerId={selectedControllerId}
            setSelectedControllerId={setSelectedControllerId}
            INDIA_CITIES={INDIA_CITIES}
            controllersState={controllersState}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            phase={phase}
            timeLeft={timeLeft}
            isOverride={isOverride}
            overrideTarget={overrideTarget}
            carsNS={carsNS}
            carsEW={carsEW}
            throughput={throughput}
            nsLightState={nsLightState}
            ewLightState={ewLightState}
            triggerOverride={triggerOverride}
            releaseOverride={releaseOverride}
            selectedCityName={selectedCityName}
            selectedControllerId={selectedControllerId}
            setSelectedControllerId={setSelectedControllerId}
            INDIA_CITIES={INDIA_CITIES}
          />
        );
      case 'parking':
        return (
          <Parking
            lotsData={lotsData}
            bookings={bookings}
            onBookSlot={handleBookSlot}
            onStartCharging={handleStartCharging}
          />
        );
      case 'admin':
        return <Admin />;
      default:
        return (
          <Home
            setActiveTab={setActiveTab}
            nsLightState={nsLightState}
            ewLightState={ewLightState}
            carsNS={carsNS}
            carsEW={carsEW}
            parkingSlots={parkingSlotsVacancies}
            alerts={alerts}
            onDismissAlert={handleDismissAlert}
            selectedCityName={selectedCityName}
            selectedControllerId={selectedControllerId}
            setSelectedControllerId={setSelectedControllerId}
            INDIA_CITIES={INDIA_CITIES}
            controllersState={controllersState}
          />
        );
    }
  };

  // Show login portal if not authenticated
  if (!role) {
    return (
      <div className="app-container" style={{ display: 'block' }}>
        <div ref={cursorRingRef} className={`custom-cursor-aura ${cursorHovered ? 'hovered' : ''} ${cursorClicked ? 'clicked' : ''}`}></div>
        {ripples.map((ripple) => (
          <span key={ripple.id} className="click-ripple" style={{ left: ripple.x, top: ripple.y }} />
        ))}
        <LoginPortal onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Ambient Cyber-Glow Aura trailing standard OS cursor */}
      <div ref={cursorRingRef} className={`custom-cursor-aura ${cursorHovered ? 'hovered' : ''} ${cursorClicked ? 'clicked' : ''}`}></div>

      {/* Click Shockwave Ripples */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="click-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
          }}
        />
      ))}

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role={role} loggedInUser={loggedInUser} onLogout={handleLogout} />
      <div className="main-content">
        <Navbar 
          activeTab={activeTab} 
          socketConnected={socketConnected} 
          selectedCityName={selectedCityName}
          setSelectedCityName={setSelectedCityName}
          INDIA_CITIES={INDIA_CITIES}
          role={role}
        />
        {renderContent()}
        <Footer />
      </div>

      {/* Floating Smart Toast Notifications Container */}
      <div className="toast-container">
        {notifications.map((notif) => {
          let IconComp = Info;
          if (notif.type === 'success') IconComp = CheckCircle2;
          if (notif.type === 'warning') IconComp = AlertTriangle;
          if (notif.type === 'danger') IconComp = AlertOctagon;

          const themeColor =
            notif.type === 'success' ? 'var(--success)' :
              notif.type === 'warning' ? 'var(--warning)' :
                notif.type === 'danger' ? 'var(--danger)' : 'var(--primary)';

          return (
            <div
              key={notif.id}
              className={`toast-notification ${notif.type || 'info'} ${notif.dismissing ? 'fade-out' : ''}`}
            >
              <div className="toast-icon" style={{ color: themeColor }}>
                <IconComp size={18} />
              </div>
              <div className="toast-body">
                <span className="toast-title">{notif.title}</span>
                <span className="toast-desc">{notif.desc}</span>
              </div>
              <button
                className="toast-close"
                onClick={() => removeNotification(notif.id)}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
