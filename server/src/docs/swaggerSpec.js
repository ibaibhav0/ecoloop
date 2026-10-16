export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'EcoLoop Public REST API & Campus Federation Service',
    version: '1.0.0',
    description: `
### Welcome to the EcoLoop Public REST API

The **EcoLoop Public REST API** enables other campuses (e.g., MIT Manipal, NITK Surathkal, RVCE), civic municipal corporations (e.g., Mangaluru City Corporation), and third-party mobile or web applications to integrate with the EcoLoop circular e-waste platform.

#### Key Capabilities:
- **Query Live E-Waste Records**: Retrieve real items from the database with multi-parameter filtering (status, type, hostel, weight ranges, search, pagination).
- **Register Items Remotely**: Register e-waste items from external partner campuses, automatically generating digital passports and QR codes.
- **Campus Statistics & Benchmarks**: Access real-time cumulative diversion weights, closed-loop verified recycling, and avoided greenhouse gas metrics calculated using the **UN Global E-waste Monitor 2024 (1.44 kg CO₂e / kg)** benchmark.

#### Authentication:
Access requires an API Key passed via:
1. **Header**: \`X-API-Key: <your_key>\`
2. **Query Parameter**: \`?apiKey=<your_key>\`
3. **HTTP Header**: \`Authorization: ApiKey <your_key>\`

*Pre-seeded Sandbox Key*: \`ecoloop_live_public_key_2026_demo\`
    `,
    contact: {
      name: 'EcoLoop Collegiate Technology Team • NMAMIT',
      email: 'api@ecoloop.campus',
      url: 'http://localhost:3000',
    },
    license: {
      name: 'MIT License',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local EcoLoop API Server',
    },
  ],
  security: [
    { ApiKeyAuth: [] },
    { ApiKeyQuery: [] },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'Provide your API key in the X-API-Key header (e.g., ecoloop_live_public_key_2026_demo).',
      },
      ApiKeyQuery: {
        type: 'apiKey',
        in: 'query',
        name: 'apiKey',
        description: 'Provide your API key as a query parameter (e.g., ?apiKey=ecoloop_live_public_key_2026_demo).',
      },
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Optional JWT Bearer token for authenticated EcoLoop campus users.',
      },
    },
    schemas: {
      EWasteItem: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: 'item_7f8a9b1c' },
          trackingCode: { type: 'string', example: 'ECO-2026-X9K2' },
          userId: { type: 'string', example: 'user_4NM22CS045' },
          userName: { type: 'string', example: 'Baibhav Kumar' },
          userEmail: { type: 'string', example: 'baibhav@ecoloop.campus' },
          userPhone: { type: 'string', example: '+919876543210' },
          userHostel: { type: 'string', example: 'Nandani' },
          type: {
            type: 'string',
            enum: [
              'Laptop / Computer',
              'Mobile Phone / Tablet',
              'Charger & Cables',
              'Battery / Power Bank',
              'Circuit Board / PCB',
              'Monitor / TV Display',
              'Home Appliance',
              'Other Electronics',
            ],
            example: 'Laptop / Computer',
          },
          approxWeight: { type: 'number', example: 2.5 },
          actualWeight: { type: 'number', nullable: true, example: 2.65 },
          status: {
            type: 'string',
            enum: ['registered', 'scheduled', 'collected', 'handed_over', 'verified_recycled'],
            example: 'collected',
          },
          qrCode: { type: 'string', description: 'Base64 Data URL of generated QR code' },
          location: { type: 'string', example: 'Hostel Nandani' },
          notes: { type: 'string', example: 'Defective motherboard, battery intact' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      RegisterItemRequest: {
        type: 'object',
        required: ['type', 'approxWeight'],
        properties: {
          type: {
            type: 'string',
            enum: [
              'Laptop / Computer',
              'Mobile Phone / Tablet',
              'Charger & Cables',
              'Battery / Power Bank',
              'Circuit Board / PCB',
              'Monitor / TV Display',
              'Home Appliance',
              'Other Electronics',
            ],
            example: 'Laptop / Computer',
          },
          approxWeight: {
            type: 'number',
            description: 'Estimated weight in kg (> 0.05)',
            example: 2.2,
          },
          registeredBy: {
            type: 'string',
            description: 'Contributor or Student Name',
            example: 'Arjun Rao',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'arjun.rao@mit.manipal.edu',
          },
          phone: {
            type: 'string',
            example: '+919845112233',
          },
          hostel: {
            type: 'string',
            description: 'Hostel, Campus Block, or Department',
            example: 'Nandani',
          },
          location: {
            type: 'string',
            example: 'Hostel Nandani Room 304',
          },
          notes: {
            type: 'string',
            example: 'Old Lenovo ThinkPad with charger',
          },
        },
      },
      TotalStatsResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          campus: { type: 'string', example: 'NMAMIT Campus Circular Network' },
          totalItems: { type: 'integer', example: 15 },
          totalWeightKg: { type: 'number', example: 24.8 },
          verifiedRecycledKg: { type: 'number', example: 9.5 },
          diversionRatePercent: { type: 'number', example: 38.3 },
          avoidedCo2eKg: { type: 'number', example: 35.71 },
          treesEquivalent: { type: 'number', example: 1.64 },
          itemsByStatus: {
            type: 'object',
            properties: {
              registered: { type: 'integer', example: 4 },
              scheduled: { type: 'integer', example: 2 },
              collected: { type: 'integer', example: 5 },
              handed_over: { type: 'integer', example: 2 },
              verified_recycled: { type: 'integer', example: 2 },
            },
          },
          itemsByType: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', example: 'Laptop / Computer' },
                count: { type: 'integer', example: 5 },
                totalKg: { type: 'number', example: 12.3 },
              },
            },
          },
          hostelRankings: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                hostel: { type: 'string', example: 'Nandani' },
                totalKg: { type: 'number', example: 9.2 },
                itemCount: { type: 'integer', example: 4 },
              },
            },
          },
          environmentalBenchmark: {
            type: 'object',
            properties: {
              factor: { type: 'string', example: '1.44 kg CO2e / kg e-waste' },
              citation: { type: 'string', example: 'Global E-waste Monitor 2024 (UNITAR / ITU)' },
              sourceUrl: { type: 'string', example: 'https://ewastemonitor.info' },
            },
          },
        },
      },
    },
  },
  paths: {
    '/api/items': {
      get: {
        summary: 'Query E-Waste Items (with filters)',
        description: 'Returns real e-waste records from the database with filtering and pagination.',
        tags: ['E-Waste Items'],
        parameters: [
          {
            name: 'status',
            in: 'query',
            description: 'Filter by item lifecycle status',
            schema: {
              type: 'string',
              enum: ['registered', 'scheduled', 'collected', 'handed_over', 'verified_recycled', 'all'],
            },
          },
          {
            name: 'type',
            in: 'query',
            description: 'Filter by electronic category',
            schema: {
              type: 'string',
              enum: [
                'Laptop / Computer',
                'Mobile Phone / Tablet',
                'Charger & Cables',
                'Battery / Power Bank',
                'Circuit Board / PCB',
                'Monitor / TV Display',
                'Home Appliance',
                'Other Electronics',
                'all',
              ],
            },
          },
          {
            name: 'hostel',
            in: 'query',
            description: 'Filter by campus hostel',
            schema: {
              type: 'string',
              enum: ['Nandani', 'Kaveri', 'Kumardhara', 'Saupernikha', 'Shambhavi', 'Netravati', 'all'],
            },
          },
          {
            name: 'minWeight',
            in: 'query',
            description: 'Minimum weight in kg',
            schema: { type: 'number' },
          },
          {
            name: 'maxWeight',
            in: 'query',
            description: 'Maximum weight in kg',
            schema: { type: 'number' },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Number of items per page (default 50, max 100)',
            schema: { type: 'integer', default: 50 },
          },
          {
            name: 'page',
            in: 'query',
            description: 'Page number (default 1)',
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'sort',
            in: 'query',
            description: 'Sort ordering',
            schema: {
              type: 'string',
              enum: ['date_desc', 'date_asc', 'weight_desc', 'weight_asc'],
              default: 'date_desc',
            },
          },
          {
            name: 'search',
            in: 'query',
            description: 'Text search matching tracking code, category, contributor, or location',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Successfully retrieved filtered e-waste items from database',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    count: { type: 'integer', example: 5 },
                    total: { type: 'integer', example: 12 },
                    page: { type: 'integer', example: 1 },
                    limit: { type: 'integer', example: 50 },
                    items: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/EWasteItem' },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Missing or invalid API key' },
        },
      },
    },
    '/api/items/register': {
      post: {
        summary: 'Register New E-Waste Item (Public / Federated Endpoint)',
        description:
          'Allows partner campuses or external applications to register an e-waste item into the EcoLoop network. Automatically generates unique tracking code, QR code data URL, and enters record in the database.',
        tags: ['E-Waste Items'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterItemRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Item successfully registered in database with QR code',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'E-waste item registered successfully' },
                    item: { $ref: '#/components/schemas/EWasteItem' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error: missing required fields or invalid weight' },
          401: { description: 'Missing or invalid API key' },
        },
      },
    },
    '/api/stats/total': {
      get: {
        summary: 'Get Total Campus E-Waste & Carbon Statistics',
        description:
          'Returns real-time cumulative statistics directly from the database including gross diverted kg, certified recycled kg, avoided CO2e, and hostel leaderboard.',
        tags: ['Campus Statistics'],
        responses: {
          200: {
            description: 'Live cumulative campus statistics from active database',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TotalStatsResponse' },
              },
            },
          },
          401: { description: 'Missing or invalid API key' },
        },
      },
    },
    '/api/keys/generate': {
      post: {
        summary: 'Generate New Developer / Campus API Key',
        description:
          'Provision a new active API key for collegiate partners, municipal bodies, or external developer applications.',
        tags: ['Developer Keys'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'ownerEmail'],
                properties: {
                  name: {
                    type: 'string',
                    description: 'Application or Campus Name',
                    example: 'RVCE Bangalore Eco-Club',
                  },
                  ownerEmail: {
                    type: 'string',
                    format: 'email',
                    example: 'ecoclub@rvce.edu.in',
                  },
                  role: {
                    type: 'string',
                    enum: ['external_campus', 'developer', 'municipality'],
                    default: 'external_campus',
                  },
                  notes: {
                    type: 'string',
                    example: 'Inter-collegiate hackathon integration key',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'API Key successfully provisioned',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    apiKey: { type: 'string', example: 'ecoloop_live_8f3a9b1c2d4e5f6a' },
                    name: { type: 'string', example: 'RVCE Bangalore Eco-Club' },
                    ownerEmail: { type: 'string', example: 'ecoclub@rvce.edu.in' },
                    documentation: { type: 'string', example: '/api/docs' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
