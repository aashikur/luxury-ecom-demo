import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  convertInchesToTwip
} from 'docx';
import fs from 'fs';

const FONT_FAMILY = 'Times New Roman';

function titlePara(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 200, line: 360 },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: 52, // 26pt
        bold: true,
        color: '000000'
      })
    ]
  });
}

function h1Para(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 140 },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: 36, // 18pt
        bold: true,
        color: '000000'
      })
    ]
  });
}

function h2Para(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: 28, // 14pt
        bold: true,
        color: '000000'
      })
    ]
  });
}

function bodyPara(runs, spacing = { after: 140, line: 276 }) {
  const children = Array.isArray(runs)
    ? runs
    : [
        new TextRun({
          text: runs,
          font: FONT_FAMILY,
          size: 24, // 12pt
          color: '000000'
        })
      ];
  return new Paragraph({
    spacing,
    children
  });
}

function bulletPara(leadText, normalText) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 100, line: 276 },
    children: [
      new TextRun({
        text: leadText + ' ',
        font: FONT_FAMILY,
        size: 24,
        bold: true,
        color: '000000'
      }),
      new TextRun({
        text: normalText,
        font: FONT_FAMILY,
        size: 24,
        color: '000000'
      })
    ]
  });
}

function subBulletPara(leadText, normalText) {
  return new Paragraph({
    bullet: { level: 1 },
    spacing: { after: 80, line: 276 },
    children: [
      new TextRun({
        text: leadText ? leadText + ' ' : '',
        font: FONT_FAMILY,
        size: 24,
        bold: !!leadText,
        color: '000000'
      }),
      new TextRun({
        text: normalText,
        font: FONT_FAMILY,
        size: 24,
        color: '000000'
      })
    ]
  });
}

function reqPara(reqId, reqDesc) {
  return new Paragraph({
    spacing: { before: 100, after: 120, line: 276 },
    children: [
      new TextRun({
        text: reqId + ': ',
        font: FONT_FAMILY,
        size: 24,
        bold: true,
        color: '000000'
      }),
      new TextRun({
        text: reqDesc,
        font: FONT_FAMILY,
        size: 24,
        color: '000000'
      })
    ]
  });
}

function noteBoxPara(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 200 },
    children: [
      new TextRun({
        text: `[ ${text} ]`,
        font: FONT_FAMILY,
        size: 22,
        italics: true,
        color: '555555'
      })
    ]
  });
}

function createTable(rowsData) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rowsData.map((row, rIdx) => {
      const isHeader = rIdx === 0;
      return new TableRow({
        tableHeader: isHeader,
        children: row.map((cellText, cIdx) => {
          return new TableCell({
            width: cIdx === 0 ? { size: 25, type: WidthType.PERCENTAGE } : { size: 75, type: WidthType.PERCENTAGE },
            margins: { top: 120, bottom: 120, left: 140, right: 140 },
            shading: isHeader ? { fill: 'F1F5F9' } : undefined,
            children: [
              new Paragraph({
                spacing: { after: 0, line: 260 },
                children: [
                  new TextRun({
                    text: cellText,
                    font: FONT_FAMILY,
                    size: 22,
                    bold: isHeader || cIdx === 0,
                    color: '000000'
                  })
                ]
              })
            ]
          });
        })
      });
    })
  });
}

// Assemble Document
const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: FONT_FAMILY,
          size: 24,
          color: '000000'
        }
      }
    }
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1),
            right: convertInchesToTwip(1)
          }
        }
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: FONT_FAMILY,
                  size: 20
                })
              ]
            })
          ]
        })
      },
      children: [
        // Title
        new Paragraph({ spacing: { before: 400, after: 100 } }),
        titlePara('Software Requirements Specification for'),
        titlePara('Online Product Catalog System'),
        new Paragraph({ spacing: { before: 200, after: 400 } }),

        // Table of Contents
        h1Para('Table of Contents'),
        bodyPara([
          new TextRun({ text: '1. Introduction  ', bold: true, font: FONT_FAMILY }),
          new TextRun({ text: '1.1 Purpose  1.2 Document Conventions  1.3 Intended Audience  1.4 Project Scope  1.5 References', font: FONT_FAMILY })
        ]),
        bodyPara([
          new TextRun({ text: '2. Overall Description  ', bold: true, font: FONT_FAMILY }),
          new TextRun({ text: '2.1 Product Perspective  2.2 Product Features  2.3 User Classes and Characteristics  2.4 Operating Environment  2.5 Constraints  2.6 Assumptions', font: FONT_FAMILY })
        ]),
        bodyPara([
          new TextRun({ text: '3. System Features (Functional Requirements)  ', bold: true, font: FONT_FAMILY }),
          new TextRun({ text: '3.1 Feature 1: Taxonomy Management  3.2 Feature 2: Product & Media Management  3.3 Feature 3: Catalog Browsing & Search  3.4 Feature 4: Detail & Specifications  3.5 Feature 5: Authentication', font: FONT_FAMILY })
        ]),
        bodyPara([
          new TextRun({ text: '4. External Interface Requirements  ', bold: true, font: FONT_FAMILY }),
          new TextRun({ text: '4.1 User Interfaces  4.2 Hardware Interfaces  4.3 Software Interfaces  4.4 Communications Interfaces', font: FONT_FAMILY })
        ]),
        bodyPara([
          new TextRun({ text: '5. Non-Functional Requirements  ', bold: true, font: FONT_FAMILY }),
          new TextRun({ text: '5.1 Performance  5.2 Security  5.3 Scalability  5.4 Usability  5.5 Reliability', font: FONT_FAMILY })
        ]),
        bodyPara([
          new TextRun({ text: '6. Other Requirements & Models  ', bold: true, font: FONT_FAMILY }),
          new TextRun({ text: '6.1 Data Model (ERD)  6.2 Data Flow Diagram (DFD)', font: FONT_FAMILY })
        ]),
        new Paragraph({ spacing: { before: 200, after: 300 } }),

        // 1. Introduction
        h1Para('1. Introduction'),
        h2Para('1.1 Purpose'),
        bodyPara(
          'This document specifies the software requirements for the "Online Product Catalog System" (OPCS). The OPCS is an interactive multimedia platform developed to centralize, structure, and showcase products across high-variance consumer and commercial domains, including home appliances, automobiles, mobile phones, consumer electronics, and apparel. It replaces traditional paper catalogs and disparate spreadsheets with a dynamic digital showcase providing multi-angle photographs, video demonstrations, and structured technical specifications.'
        ),

        h2Para('1.2 Document Conventions'),
        bulletPara('OPCS:', 'Online Product Catalog System.'),
        bulletPara('SRS:', 'Software Requirements Specification.'),
        bulletPara('DFD:', 'Data Flow Diagram.'),
        bulletPara('ERD:', 'Entity-Relationship Diagram.'),
        bulletPara('PDP:', 'Product Detail Page.'),
        bulletPara('User Roles:', 'System Administrator, Catalog Manager (Staff), Visitor (Public Consumer).'),

        h2Para('1.3 Intended Audience'),
        bulletPara('Project Developers:', "To implement the system's database schema, RESTful APIs, responsive interfaces, and filtering logic."),
        bulletPara('Project Evaluators & Faculty:', 'To assess architectural rigor, functional completeness, and adherence to software engineering standards.'),
        bulletPara('Quality Assurance (QA) Engineers:', 'To develop automated integration and UI test cases verifying search precision, media loading, and access control.'),
        bulletPara('Merchandising & Catalog Teams:', 'To understand data entry conventions for taxonomy trees, media attachments, and specification groups.'),

        h2Para('1.4 Project Scope'),
        bodyPara('The Online Product Catalog System encompasses the following functional capabilities:'),
        bulletPara('•', 'Hierarchical category tree management supporting multi-level parent-child classifications.'),
        bulletPara('•', 'Brand directory indexing with logos and manufacturer profiles.'),
        bulletPara('•', 'Comprehensive product records with pricing, discount calculations, descriptions, and bullet highlights.'),
        bulletPara('•', 'Dynamic technical specification grouping supporting modular fact sheets (e.g., Performance, Dimensions, Engine, Battery, Warranty).'),
        bulletPara('•', 'High-definition responsive multimedia galleries supporting photo zoom and streaming video demonstrations.'),
        bulletPara('•', 'Faceted catalog browsing, keyword search, brand filtering, and real-time sorting.'),
        bulletPara('•', 'Role-based authentication ensuring administrative actions are restricted to authorized personnel.'),
        bodyPara(
          'Negative Scope (Deliberate Boundary): To maintain high performance and dedicated catalog intelligence, the system intentionally excludes financial payment processing, banking gateway settlements, courier parcel tracking, and warehouse fulfillment dispatch.'
        ),

        h2Para('1.5 References'),
        bulletPara('•', 'IEEE Std 830-1998 Recommended Practice for Software Requirements Specifications.'),
        bulletPara('•', 'System Entity-Relationship Diagram (ERD) (Detailed in Section 6.1).'),
        bulletPara('•', 'System Data Flow Diagrams (DFD Level 0 & Level 1) (Detailed in Section 6.2).'),

        // 2. Overall Description
        h1Para('2. Overall Description'),
        h2Para('2.1 Product Perspective'),
        bodyPara(
          'The OPCS operates as a standalone, cloud-native web application serving as the authoritative single source of truth for all product information. Developed on a modern decoupled architecture, it leverages Next.js 16 with TypeScript for high-speed Server-Side Rendering (SSR), MongoDB Atlas as the primary persistence layer, and Cloudflare R2 / CDN for high-throughput media asset delivery.'
        ),

        h2Para('2.2 Product Features'),
        bodyPara('The primary capabilities of OPCS include:'),
        bulletPara('Taxonomy Setup:', 'Allows Administrators to structure categories, subcategories, and brand affiliations.'),
        bulletPara('Multimedia Management:', 'Allows Staff to upload multi-angle WebP photographs and attach streaming video links.'),
        bulletPara('Specifications Engine:', 'Allows defining arbitrary key-value specification matrices categorized by group.'),
        bulletPara('Discovery & Search:', 'Enables visitors to locate products instantly via text search and category facets.'),
        bulletPara('Product Detail Showcase:', 'Renders complete specifications, dynamic galleries, and pricing transparency.'),

        h2Para('2.3 User Classes and Characteristics'),
        createTable([
          ['User Class', 'Characteristics & Responsibilities'],
          [
            'System Administrator',
            'Technical superuser responsible for platform configuration, staff account management, database health, and master taxonomy structure. Has full Read/Write access across all system entities.'
          ],
          [
            'Catalog Manager (Staff)',
            'Operational merchandising staff responsible for creating product entries, uploading multimedia photographs, updating specification matrices, and managing stock badges. Has Read/Write access to catalog entities.'
          ],
          [
            'Visitor / Consumer',
            'Public retail and commercial visitors browsing the catalog across mobile and desktop devices. Responsible for researching specifications and comparing products. Has Read-Only access to published catalog data.'
          ]
        ]),

        new Paragraph({ spacing: { before: 200, after: 100 } }),
        noteBoxPara('Figure 2.1: Use Case Diagram for Online Product Catalog System'),
        new Paragraph({ spacing: { before: 100, after: 200 } }),

        h2Para('2.4 Operating Environment'),
        bodyPara(
          'The system is accessible through all modern standard web browsers (Google Chrome, Safari, Mozilla Firefox, Microsoft Edge) across mobile (iOS/Android), tablet, and desktop viewports. The backend runs on a Node.js cloud server cluster with MongoDB Atlas high-availability clusters and Edge CDN asset caching.'
        ),

        h2Para('2.5 Design and Implementation Constraints'),
        bulletPara('•', 'The system must utilize a schema-enforced document or relational store ensuring unique slug and SKU constraints.'),
        bulletPara('•', 'Catalog cards and media galleries must adhere to locked aspect ratios (3:4 portrait or 16:9 landscape) to guarantee zero Cumulative Layout Shift (CLS = 0).'),
        bulletPara('•', 'Images must be optimized to WebP format capped under 200 KB per asset to protect mobile bandwidth.'),
        bulletPara('•', 'Storefront pages must be rendered server-side with sub-second time-to-first-byte (TTFB).'),

        h2Para('2.6 Assumptions and Dependencies'),
        bulletPara('•', 'Users possess standard digital literacy for web browsing and mobile interaction.'),
        bulletPara('•', 'Client browsers maintain an active internet connection to stream media and retrieve catalog data.'),
        bulletPara('•', 'Product specifications provided by Catalog Managers comply with verified manufacturer documentation.'),

        // 3. System Features
        h1Para('3. System Features (Functional Requirements)'),
        h2Para('3.1 Feature 1: Taxonomy and Brand Management (Admin)'),
        bodyPara('Corresponds to DFD Process 1.0 (Manage Taxonomies & Brands).'),
        reqPara('FR-1.1', 'The Administrator shall be able to create, read, update, and delete Category records with fields for Name, Slug, Description, and Parent Category.'),
        reqPara('FR-1.2', 'The system shall prevent circular hierarchical relationships when updating parent-child category trees.'),
        reqPara('FR-1.3', 'The Administrator shall be able to create, view, update, and archive Brand records, including Brand Name, Slug, Logo URL, and Website.'),
        reqPara('FR-1.4', 'The system shall reject deletion of any Category or Brand currently associated with active products.'),

        h2Para('3.2 Feature 2: Product and Multimedia Catalog Management (Staff)'),
        bodyPara('Corresponds to DFD Process 2.0 (Manage Products & Media).'),
        reqPara('FR-2.1', 'The Catalog Manager shall be able to create and edit Product profiles with title, auto-generated slug, summary, and rich description.'),
        reqPara('FR-2.2', 'The Catalog Manager shall be able to configure base pricing, promotional discount pricing, and stock status badges (In Stock, Out of Stock, Pre-Order).'),
        reqPara('FR-2.3', 'The system shall allow uploading multiple high-resolution photographs per product, storing them on the CDN, and setting display ordering.'),
        reqPara('FR-2.4', 'The system shall support linking external streaming video demonstrations (YouTube, Vimeo, CDN MP4) within the product gallery.'),
        reqPara('FR-2.5', 'The Catalog Manager shall be able to add grouped technical specifications (e.g., Group: "Engine" → Label: "Displacement", Value: "1998 cc").'),

        h2Para('3.3 Feature 3: Catalog Browsing and Faceted Discovery (Visitor)'),
        bodyPara('Corresponds to DFD Process 3.0 (Search & Filter Catalog).'),
        reqPara('FR-3.1', 'The system shall present a responsive catalog grid displaying product cards with thumbnail image, title, brand, category, and price.'),
        reqPara('FR-3.2', 'The Visitor shall be able to browse products filtered by selected Category, Subcategory, or Brand.'),
        reqPara('FR-3.3', 'The Visitor shall be able to execute keyword search queries matching across product titles, brands, and descriptions.'),
        reqPara('FR-3.4', 'The Visitor shall be able to sort catalog items by price (ascending/descending), novelty (newest first), and alphabetical order.'),

        h2Para('3.4 Feature 4: Product Detail and Specification Inspection (Visitor)'),
        bodyPara('Corresponds to DFD Process 4.0 (Retrieve Product Details & Specifications).'),
        reqPara('FR-4.1', 'The system shall render a dedicated Product Detail Page (PDP) accessible through the unique URL slug.'),
        reqPara('FR-4.2', 'The Visitor shall be able to interact with the multimedia viewer: switching image thumbnails, magnifying details, and playing video demos.'),
        reqPara('FR-4.3', 'The system shall present a structured Technical Specifications table grouping specs into readable modules (Performance, Dimensions, Power, Warranty).'),
        reqPara('FR-4.4', 'The system shall display promotional savings percentage and original price strike-through whenever a discount is active.'),

        h2Para('3.5 Feature 5: Role-Based User Authentication (Admin & Staff)'),
        bodyPara('Corresponds to DFD Process 5.0 (Authenticate Users & Sessions).'),
        reqPara('FR-5.1', 'All administrative personnel must authenticate using a unique email address and secure password.'),
        reqPara('FR-5.2', 'The system shall protect administrative studio routes (/admin/**), redirecting unauthenticated requests to the login screen.'),
        reqPara('FR-5.3', 'The system shall enforce role segregation: Catalog Managers are restricted to catalog editing, while Administrators manage users and system configuration.'),

        // 4. External Interface Requirements
        h1Para('4. External Interface Requirements'),
        h2Para('4.1 User Interfaces'),
        bodyPara(
          'Storefront Catalog Interface: Responsive mobile-first design with high-contrast typography, category pill filters, grid view toggle, search bar, and clean PDP specification tables.'
        ),
        bodyPara(
          'Admin Studio Interface: Structured management dashboard featuring a responsive navigation sidebar, paginated data tables, drag-and-drop media uploader, and dynamic specification form builder.'
        ),

        h2Para('4.2 Hardware Interfaces'),
        bodyPara('Server Hardware: Standard virtual machine or container instance (minimum 2 vCPU, 4GB RAM) on cloud hosting.'),
        bodyPara('Client Devices: Any standard mobile phone (screen width ≥ 360px), tablet, laptop, or desktop computer with standard input peripherals.'),

        h2Para('4.3 Software Interfaces'),
        bulletPara('Frontend Framework:', 'Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS.'),
        bulletPara('Backend Architecture:', 'Node.js runtime executing Server Components and Server Actions.'),
        bulletPara('Database Management:', 'MongoDB Atlas cloud database accessed via Mongoose ODM singleton client.'),
        bulletPara('Media Storage & CDN:', 'Cloudflare R2 object storage with global edge distribution.'),

        h2Para('4.4 Communications Interfaces'),
        bodyPara('Communication between client web browsers and server clusters operates strictly over HTTPS (TLS 1.3) protocol using RESTful JSON API payloads.'),

        // 5. Non-Functional Requirements
        h1Para('5. Non-Functional Requirements'),
        h2Para('5.1 Performance Requirements'),
        reqPara('Response Time', 'Catalog listing and product detail pages must achieve Largest Contentful Paint (LCP) in under 2.0 seconds.'),
        reqPara('Query Latency', 'Indexed database queries for catalog filtering and search must execute in under 100 milliseconds.'),
        reqPara('Concurrent Users', 'The platform must support at least 500 concurrent visitors without performance degradation.'),

        h2Para('5.2 Security Requirements'),
        reqPara('Authentication', 'Administrative sessions must utilize cryptographically signed session tokens or JWTs.'),
        reqPara('Data Protection', 'Passwords must be hashed using strong salt and hashing algorithms (Bcrypt/Argon2). All traffic must be encrypted over HTTPS.'),
        reqPara('Input Sanitization', 'All user and form inputs must be strictly validated and sanitized to prevent XSS and NoSQL injection vulnerabilities.'),

        h2Para('5.3 Scalability'),
        bodyPara(
          'The architecture is stateless at the web tier, enabling automatic horizontal scaling behind a reverse proxy. Database performance is safeguarded using compound indexes on categorySlug, brandSlug, and price.'
        ),

        h2Para('5.4 Usability'),
        bodyPara(
          'The user interface conforms to WCAG AA contrast standards. Touch interactions incorporate zero-delay mobile feedback, and all interactive controls provide clear visual feedback.'
        ),

        h2Para('5.5 Reliability and Availability'),
        bodyPara(
          'The system targets 99.9% uptime SLA. The database is configured with automated daily backups, multi-zone replica sets, and point-in-time recovery.'
        ),

        // 6. Other Requirements & Models
        h1Para('6. Other Requirements & Architectural Models'),
        h2Para('6.1 Data Model (ERD)'),
        bodyPara('The database architecture consists of clean, relational document entities:'),
        bulletPara('Categories:', 'Defines taxonomy hierarchy (_id, name, slug, parentId, ancestors, image).'),
        bulletPara('Brands:', 'Contains manufacturer information (_id, name, slug, logoUrl, website).'),
        bulletPara('Products:', 'Central catalog entity containing identification, pricing, description, highlights, media[], and specifications[].'),
        bulletPara('Users:', 'Stores administrative staff credentials (_id, name, email, passwordHash, role).'),

        new Paragraph({ spacing: { before: 200, after: 100 } }),
        noteBoxPara('Figure 6.1: Entity-Relationship Diagram (ERD) for Online Product Catalog System'),
        new Paragraph({ spacing: { before: 100, after: 200 } }),

        h2Para('6.2 Data Flow Diagram (DFD)'),
        bodyPara('The system data flow is organized into two primary levels:'),
        bulletPara('Level-0 DFD (Context Diagram):', 'Models external interactions between Visitor, Staff, Administrator, and the central Catalog System.'),
        bulletPara('Level-1 DFD (Decomposition):', 'Decomposes the system into 5 discrete processes: 1.0 Manage Taxonomies, 2.0 Manage Products & Media, 3.0 Search & Filter Catalog, 4.0 Retrieve Details & Specifications, and 5.0 Authenticate Staff.'),

        new Paragraph({ spacing: { before: 200, after: 100 } }),
        noteBoxPara('Figure 6.2: Level-0 & Level-1 Data Flow Diagram (DFD) for Online Product Catalog System'),
        new Paragraph({ spacing: { before: 100, after: 200 } })
      ]
    }
  ]
});

// Write to file
const outputPath = 'C:/WebDevs/luxury-ecom-demo/Lab-report-demo-refference/Online-Product-Catalog-System-SRS.docx';
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outputPath, buffer);
  console.log('Successfully generated Word document at:', outputPath);
});
