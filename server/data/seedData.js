const bcrypt = require('bcryptjs');

const defaultPasswordHash = bcrypt.hashSync('password123', 10);

const initialCategories = [
  { id: 'cat-1', name: 'Power Tools', slug: 'power-tools', icon: 'Wrench', description: 'Drills, saws, sanders, pressure washers, and hand tools' },
  { id: 'cat-2', name: 'Camping & Outdoors', slug: 'camping-outdoors', icon: 'Tent', description: 'Tents, backpacks, sleeping bags, stoves, and hiking equipment' },
  { id: 'cat-3', name: 'Electronics & AV', slug: 'electronics-av', icon: 'Camera', description: 'Projectors, cameras, speakers, lighting, and audio equipment' },
  { id: 'cat-4', name: 'Lawn & Garden', slug: 'lawn-garden', icon: 'Sprout', description: 'Lawn mowers, weed trimmers, leaf blowers, and hedge clippers' },
  { id: 'cat-5', name: 'Party & Events', slug: 'party-events', icon: 'PartyPopper', description: 'Folding tables, party lights, sound systems, coolers, and banners' },
  { id: 'cat-6', name: 'Sports & Fitness', slug: 'sports-fitness', icon: 'Bike', description: 'Bicycles, kayaks, paddle boards, weights, and sports gear' }
];

const initialUsers = [
  {
    id: 'user-admin',
    name: 'Elena Vance (Admin)',
    email: 'admin@borrowly.com',
    password: defaultPasswordHash,
    role: 'admin',
    phone: '+1 555-019-8234',
    location: 'Manhattan, New York, NY',
    bio: 'Borrowly System Administrator & Community Lead.',
    reputation: { rating: 5.0, count: 42 },
    createdAt: new Date('2025-01-10T10:00:00Z').toISOString()
  },
  {
    id: 'user-owner',
    name: 'Marcus Rivera',
    email: 'owner@borrowly.com',
    password: defaultPasswordHash,
    role: 'owner',
    phone: '+1 555-234-5678',
    location: 'Brooklyn, New York, NY',
    bio: 'DIY enthusiast, maker, and avid camper. Happy to share my gear with fellow neighbors!',
    reputation: { rating: 4.9, count: 18 },
    createdAt: new Date('2025-02-15T12:00:00Z').toISOString()
  },
  {
    id: 'user-borrower',
    name: 'Sarah Jenkins',
    email: 'borrower@borrowly.com',
    password: defaultPasswordHash,
    role: 'borrower',
    phone: '+1 555-876-5432',
    location: 'Queens, New York, NY',
    bio: 'Gardener, photographer, and weekend hobbyist. Passionate about sustainable community sharing.',
    reputation: { rating: 4.8, count: 12 },
    createdAt: new Date('2025-03-01T15:30:00Z').toISOString()
  },
  {
    id: 'user-neighbor',
    name: 'David Chen',
    email: 'david@borrowly.com',
    password: defaultPasswordHash,
    role: 'borrower',
    phone: '+1 555-345-9876',
    location: 'Brooklyn, New York, NY',
    bio: 'Home renovator and weekend cyclist.',
    reputation: { rating: 4.7, count: 9 },
    createdAt: new Date('2025-03-12T09:15:00Z').toISOString()
  }
];

const initialItems = [
  {
    id: 'item-1',
    title: 'DeWalt 20V MAX Cordless Hammer Drill & Driver Kit',
    category: 'Power Tools',
    categoryId: 'cat-1',
    description: 'Heavy duty brushless cordless hammer drill with two 20V batteries, quick charger, and full drill bit set. Perfect for wood, metal, and masonry projects.',
    condition: 'Like New',
    location: 'Brooklyn, NY (Park Slope)',
    status: 'active',
    isRentable: true,
    pricePerDay: 12,
    deposit: 45,
    ownerId: 'user-owner',
    ownerName: 'Marcus Rivera',
    images: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['drill', 'dewalt', 'hammer drill', 'woodwork', 'tools'],
    rules: 'Please return clean and with both batteries charged. Safety glasses included.',
    createdAt: new Date('2025-03-10T10:00:00Z').toISOString()
  },
  {
    id: 'item-2',
    title: 'Coleman 6-Person Weatherproof Dome Tent',
    category: 'Camping & Outdoors',
    categoryId: 'cat-2',
    description: 'Spacious 6-person dome tent with WeatherTec system to stay dry. 10 x 9 ft floor footprint, easy 10-minute setup with snag-free continuous pole sleeves. Includes rainfly and stakes.',
    condition: 'Like New',
    location: 'Queens, NY (Astoria)',
    status: 'active',
    isRentable: true,
    pricePerDay: 18,
    deposit: 60,
    ownerId: 'user-owner',
    ownerName: 'Marcus Rivera',
    images: [
      'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['camping', 'tent', 'coleman', 'outdoors', 'hiking'],
    rules: 'Must be dried completely before folding and repacking to avoid mildew.',
    createdAt: new Date('2025-03-11T11:00:00Z').toISOString()
  },
  {
    id: 'item-3',
    title: 'Epson Home Cinema 1080p Full HD Projector + 100" Screen',
    category: 'Electronics & AV',
    categoryId: 'cat-3',
    description: 'Bright 3300-lumens full HD projector with HDMI input and built-in speaker. Comes with portable 100-inch foldable projection screen with tripod stand. Ideal for movie nights or presentations.',
    condition: 'Like New',
    location: 'Manhattan, NY (Chelsea)',
    status: 'active',
    isRentable: true,
    pricePerDay: 25,
    deposit: 100,
    ownerId: 'user-owner',
    ownerName: 'Marcus Rivera',
    images: [
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['projector', 'movie night', 'screen', 'audio video', 'presentation'],
    rules: 'Handle projector lens with care. Store in protective padded travel bag.',
    createdAt: new Date('2025-03-12T14:30:00Z').toISOString()
  },
  {
    id: 'item-4',
    title: 'Greenworks 40V Cordless Electric Lawn Mower (19-inch)',
    category: 'Lawn & Garden',
    categoryId: 'cat-4',
    description: 'Eco-friendly, quiet 40V battery powered push lawnmower with mulching and rear bag. Includes two 4Ah batteries and rapid dual charger. No gas, no oil, push button start.',
    condition: 'Good',
    location: 'Brooklyn, NY (Bay Ridge)',
    status: 'active',
    isRentable: false, // FREE COMMUNITY BORROWING!
    pricePerDay: 0,
    deposit: 50,
    ownerId: 'user-owner',
    ownerName: 'Marcus Rivera',
    images: [
      'https://images.unsplash.com/photo-1592417817098-8f3d6eb22513?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['lawn mower', 'gardening', 'yard', 'greenworks', 'grass cutting'],
    rules: 'Free community borrow! Just please rinse grass clippings under deck after use.',
    createdAt: new Date('2025-03-13T09:00:00Z').toISOString()
  },
  {
    id: 'item-5',
    title: 'Kärcher 2000 PSI Electric Pressure Washer Kit',
    category: 'Power Tools',
    categoryId: 'cat-5',
    description: 'Compact high pressure electric washer with turbo nozzle, soap tank, and 25-foot kink-resistant high-pressure hose. Great for patio cleaning, siding, and car washing.',
    condition: 'Good',
    location: 'Brooklyn, NY (Williamsburg)',
    status: 'active',
    isRentable: true,
    pricePerDay: 15,
    deposit: 40,
    ownerId: 'user-owner',
    ownerName: 'Marcus Rivera',
    images: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['pressure washer', 'cleaning', 'patio', 'car wash', 'outdoor cleaning'],
    rules: 'Connect water supply fully before turning motor on. Flush detergent after use.',
    createdAt: new Date('2025-03-14T16:20:00Z').toISOString()
  },
  {
    id: 'item-6',
    title: 'JBL PartyBox 310 Portable Bluetooth Party Speaker with Lights',
    category: 'Party & Events',
    categoryId: 'cat-5',
    description: 'Massive 240W RMS output with dynamic light synched show, karaoke mic input, guitar input, and 18-hour battery life with smooth-glide wheels and handle.',
    condition: 'Like New',
    location: 'Queens, NY (Sunnyside)',
    status: 'active',
    isRentable: true,
    pricePerDay: 28,
    deposit: 90,
    ownerId: 'user-owner',
    ownerName: 'Marcus Rivera',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['speaker', 'jbl', 'party', 'sound system', 'bluetooth', 'music'],
    rules: 'Keep away from heavy rain or direct water submersion. Charger included.',
    createdAt: new Date('2025-03-15T12:00:00Z').toISOString()
  },
  {
    id: 'item-7',
    title: 'Trek FX 2 Disc Hybrid Bicycle (Medium Frame, 18-Speed)',
    category: 'Sports & Fitness',
    categoryId: 'cat-6',
    description: 'Versatile hybrid bike with hydraulic disc brakes, lightweight aluminum frame, rear rack, and water bottle cage. Comes with Kryptonite U-Lock and helmet.',
    condition: 'Good',
    location: 'Manhattan, NY (East Village)',
    status: 'active',
    isRentable: true,
    pricePerDay: 14,
    deposit: 50,
    ownerId: 'user-owner',
    ownerName: 'Marcus Rivera',
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['bicycle', 'trek', 'bike', 'cycling', 'commute', 'sports'],
    rules: 'Always lock through frame and front wheel. Helmet provided and required.',
    createdAt: new Date('2025-03-16T15:00:00Z').toISOString()
  },
  {
    id: 'item-8',
    title: 'Foldable Heavy-Duty 6-Foot Event Table & 6 Padded Chairs',
    category: 'Party & Events',
    categoryId: 'cat-5',
    description: 'Sturdy banquet folding table that folds in half with carry handle, plus 6 comfortable commercial-grade folding chairs. Great for birthday parties, family gatherings, or yard sales.',
    condition: 'Good',
    location: 'Brooklyn, NY (Crown Heights)',
    status: 'active',
    isRentable: false, // FREE COMMUNITY BORROWING!
    pricePerDay: 0,
    deposit: 30,
    ownerId: 'user-owner',
    ownerName: 'Marcus Rivera',
    images: [
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['tables', 'chairs', 'party', 'event', 'folding table', 'gathering'],
    rules: 'Free community loan! Wipe down tables before returning.',
    createdAt: new Date('2025-03-17T09:30:00Z').toISOString()
  }
];

const initialBorrowRequests = [
  {
    id: 'req-101',
    itemId: 'item-1',
    itemTitle: 'DeWalt 20V MAX Cordless Hammer Drill & Driver Kit',
    borrowerId: 'user-borrower',
    borrowerName: 'Sarah Jenkins',
    ownerId: 'user-owner',
    ownerName: 'Marcus Rivera',
    startDate: '2025-04-05',
    endDate: '2025-04-07',
    durationDays: 2,
    type: 'rent',
    totalCost: 24,
    deposit: 45,
    message: 'Hi Marcus! Hanging heavy shelves in my apartment this weekend. Will take good care of it!',
    status: 'APPROVED',
    createdAt: new Date('2025-03-25T11:00:00Z').toISOString()
  },
  {
    id: 'req-102',
    itemId: 'item-2',
    itemTitle: 'Coleman 6-Person Weatherproof Dome Tent',
    borrowerId: 'user-neighbor',
    borrowerName: 'David Chen',
    ownerId: 'user-owner',
    ownerName: 'Marcus Rivera',
    startDate: '2025-04-12',
    endDate: '2025-04-14',
    durationDays: 2,
    type: 'rent',
    totalCost: 36,
    deposit: 60,
    message: 'Planning a weekend getaway in the Catskills. Is this available?',
    status: 'PENDING',
    createdAt: new Date('2025-03-28T16:15:00Z').toISOString()
  }
];

const initialTransactions = [
  {
    id: 'txn-201',
    requestId: 'req-101',
    itemId: 'item-1',
    itemTitle: 'DeWalt 20V MAX Cordless Hammer Drill & Driver Kit',
    borrowerId: 'user-borrower',
    borrowerName: 'Sarah Jenkins',
    ownerId: 'user-owner',
    ownerName: 'Marcus Rivera',
    startDate: '2025-04-05',
    endDate: '2025-04-07',
    actualReturnDate: null,
    type: 'rent',
    amountPaid: 24,
    depositHeld: 45,
    status: 'ACTIVE',
    createdAt: new Date('2025-03-25T14:00:00Z').toISOString(),
    updatedAt: new Date('2025-04-05T09:00:00Z').toISOString()
  },
  {
    id: 'txn-199',
    requestId: 'req-past-1',
    itemId: 'item-4',
    itemTitle: 'Greenworks 40V Cordless Electric Lawn Mower (19-inch)',
    borrowerId: 'user-borrower',
    borrowerName: 'Sarah Jenkins',
    ownerId: 'user-owner',
    ownerName: 'Marcus Rivera',
    startDate: '2025-03-20',
    endDate: '2025-03-21',
    actualReturnDate: '2025-03-21T17:30:00Z',
    type: 'borrow',
    amountPaid: 0,
    depositHeld: 0,
    status: 'COMPLETED',
    createdAt: new Date('2025-03-18T10:00:00Z').toISOString(),
    updatedAt: new Date('2025-03-21T18:00:00Z').toISOString()
  }
];

const initialReviews = [
  {
    id: 'rev-301',
    transactionId: 'txn-199',
    itemId: 'item-4',
    itemTitle: 'Greenworks 40V Cordless Electric Lawn Mower (19-inch)',
    reviewerId: 'user-borrower',
    reviewerName: 'Sarah Jenkins',
    revieweeId: 'user-owner',
    rating: 5,
    comment: 'Marcus was so kind and helpful! The mower worked like a charm and cut through my overgrown backyard with ease. Highly recommended community lender!',
    createdAt: new Date('2025-03-22T09:30:00Z').toISOString()
  }
];

const initialNotifications = [
  {
    id: 'notif-401',
    recipientId: 'user-borrower',
    title: 'Request Approved!',
    message: 'Marcus Rivera approved your rental request for DeWalt 20V Hammer Drill.',
    type: 'request_approved',
    link: '/dashboard',
    isRead: false,
    createdAt: new Date('2025-03-25T14:00:00Z').toISOString()
  },
  {
    id: 'notif-402',
    recipientId: 'user-owner',
    title: 'New Borrow Request',
    message: 'David Chen requested your Coleman 6-Person Dome Tent for Apr 12 - Apr 14.',
    type: 'request_created',
    link: '/owner/requests',
    isRead: false,
    createdAt: new Date('2025-03-28T16:15:00Z').toISOString()
  }
];

const initialReports = [
  {
    id: 'rep-501',
    reporterId: 'user-neighbor',
    reporterName: 'David Chen',
    targetType: 'item',
    targetId: 'item-7',
    targetTitle: 'Trek FX 2 Disc Hybrid Bicycle',
    reason: 'Condition Discrepancy',
    description: 'Minor brake pad squeak noted on listing, but owner fixed it promptly.',
    status: 'RESOLVED',
    adminAction: 'Owner verified maintenance check and updated safety note.',
    createdAt: new Date('2025-03-20T11:00:00Z').toISOString()
  }
];

const initialRiskFlags = [
  {
    id: 'risk-601',
    userId: 'user-neighbor',
    userName: 'David Chen',
    userEmail: 'david@borrowly.com',
    reason: 'Frequent Cancellations Pattern',
    severity: 'low',
    patterns: ['2 cancellations within 14 days'],
    relatedTransactions: ['txn-188'],
    status: 'REVIEWED',
    adminNotes: 'User had schedule conflict due to bad weather. No malicious intent.',
    createdAt: new Date('2025-03-24T18:00:00Z').toISOString()
  }
];

module.exports = {
  initialCategories,
  initialUsers,
  initialItems,
  initialBorrowRequests,
  initialTransactions,
  initialReviews,
  initialNotifications,
  initialReports,
  initialRiskFlags
};
