# 🎨 Complete Diagrams Guide, Mermaid Codes & Generation Prompts
**Project:** Online Product Catalog System (OPCS)  
**Target Document:** `Online-Product-Catalog-System-SRS.docx` / `Online-Product-Catalog-System-SRS.md`  
**Standard:** IEEE 830-1998 Software Requirements Specification

---

## 📌 Document Insertion Map (কোন ডায়াগ্রাম কোথায় বসবে?)

| Diagram Name | Report Section | Exact Location in Document | Figure Number & Recommended Caption |
| :--- | :--- | :--- | :--- |
| **Use Case Diagram** | **Section 2.3** *(User Classes and Characteristics)* | ঠিক User Classes টেবিলের নিচে, Section 2.4-এর আগে। | **Figure 2.1:** Use Case Diagram for Online Product Catalog System |
| **DFD Level-0** *(Context Diagram)* | **Section 6.2** *(Data Flow Diagram)* | Section 6.2-এর Level-0 বর্ণনার ঠিক নিচে। | **Figure 6.2(a):** Level-0 Context Data Flow Diagram |
| **DFD Level-1** *(Process Breakdown)* | **Section 6.2** *(Data Flow Diagram)* | Section 6.2-এর Level-1 বর্ণনার ঠিক নিচে। | **Figure 6.2(b):** Level-1 Detailed Data Flow Diagram |
| **Entity-Relationship Diagram (ERD)** | **Section 6.1** *(Data Model)* | Section 6.1-এর Entity তালিকা ও বর্ণনার নিচে। | **Figure 6.1:** Entity-Relationship Diagram (ERD) |
| **System Architecture Diagram** *(Bonus)* | **Section 2.1** *(Product Perspective)* | Section 2.1-এর প্যারাগ্রাফের ঠিক নিচে। | **Figure 2.0:** High-Level Cloud & Storage Architecture |

---

## 🛠️ ডায়াগ্রাম তৈরির সেরা পদ্ধতি (Step-by-Step Instructions)

### পদ্ধতি ১: Draw.io ব্যবহার করে (সবচেয়ে নিখুঁত, প্রফেশনাল ও একাডেমিক স্ট্যান্ডার্ড)
> **কেন এটি সেরা:** কোনো টেক্সট ঝাপসা হবে না, অ্যারো বা বক্স ভাঙবে না, এবং শিক্ষক ১০০% ফুল মার্কস দেবেন।

1. আপনার ব্রাউজারে **[draw.io](https://app.diagrams.net)** (অথবা diagrams.net) ওপেন করুন।
2. **"Create New Diagram"** ➔ **"Blank Diagram"** সিলেক্ট করুন।
3. উপরের মেনু বার থেকে ক্লিক করুন:  
   👉 **Arrange** ➔ **Insert** ➔ **Advanced** ➔ **Mermaid**
4. নিচের সেকশন থেকে সংশ্লিষ্ট ডায়াগ্রামের **Mermaid Code** কপি করে বক্সের ভেতর পেস্ট করুন এবং **Insert** বাটনে চাপ দিন।
5. সাথে সাথে সম্পূর্ণ ডায়াগ্রাম ড্র হয়ে যাবে! চাইলে কালার বা বক্সের সাইজ সামান্য ড্র্যাগ করে অ্যাডজাস্ট করতে পারেন।
6. এরপর মেনু থেকে: **File ➔ Export as ➔ PNG** (অথবা JPEG), DPI দিন `300` (প্রিন্টের জন্য ক্রিস্প কোয়ালিটি) এবং সেভ করুন।

---

### পদ্ধতি ২: Google Gemini Pro / AI Image Generator দিয়ে (Conceptual Visual Rendering)
> **সতর্কতা:** AI ইমেজ জেনারেটরে দেওয়ার জন্য এমন প্রম্পট দেওয়া হয়েছে যা ক্লিন ভেক্টর স্টাইল বজায় রাখবে।

---

## 1. Use Case Diagram

### 📍 বসবে: Section 2.3 (User Classes and Characteristics)

#### A. Draw.io Mermaid Code (সরাসরি পেস্ট করার জন্য):
```mermaid
flowchart LR
    %% Actors
    subgraph Actors [System Users]
        V["👤 Visitor / Consumer"]
        M["👨‍💼 Catalog Manager (Staff)"]
        A["👑 System Administrator"]
    end

    %% System Boundary
    subgraph OPCS ["Online Product Catalog System (OPCS) Boundary"]
        UC1(["Browse Catalog by Category"])
        UC2(["Filter Products (Brand & Price)"])
        UC3(["Search Products (Keyword Search)"])
        UC4(["View Product Detail & Image Gallery"])
        UC5(["Inspect Technical Specifications"])
        UC6(["Watch Product Video Demonstrations"])
        
        UC7(["Manage Product Entries (CRUD)"])
        UC8(["Upload & Sequence Media (Photos/Videos)"])
        UC9(["Configure Specifications Matrix"])
        UC10(["Update Stock & Availability Status"])
        
        UC11(["Manage Categories & Taxonomy Tree"])
        UC12(["Manage Brand & Manufacturer Directory"])
        UC13(["Manage Staff Accounts & Permissions"])
        UC14(["Authenticate User (Login / Logout)"])
    end

    %% Relationships Visitor
    V --> UC1
    V --> UC2
    V --> UC3
    V --> UC4
    V --> UC5
    V --> UC6

    %% Relationships Staff
    M --> UC14
    M --> UC7
    M --> UC8
    M --> UC9
    M --> UC10

    %% Relationships Admin
    A --> UC14
    A --> UC11
    A --> UC12
    A --> UC13
    A --> UC7

    %% Styling
    style OPCS fill:#f8fafc,stroke:#334155,stroke-width:2px;
    style V fill:#e0f2fe,stroke:#0284c7;
    style M fill:#fef3c7,stroke:#d97706;
    style A fill:#fee2e2,stroke:#dc2626;
```

#### B. Gemini Pro / AI Image Prompt (যদি AI জেনারেটর দিয়ে ছবি বানাতে চান):
> *"A professional UML Use Case Diagram for an 'Online Product Catalog System' on a clean white background. Shows three distinct human actors on the left: 'Visitor', 'Catalog Manager', and 'System Administrator'. In the center is a neat rectangular system boundary containing clear oval use cases: 'Browse Catalog', 'Search Products', 'Inspect Specifications', 'View Multimedia Gallery', 'Manage Products & Media', 'Manage Categories & Brands', and 'Authenticate User'. Clean solid association lines connecting actors to use cases. Technical software engineering drawing style, ultra-high resolution, black and white with subtle slate blue accents, crisp legible English typography."*

---

## 2. Data Flow Diagram (DFD) — Level 0 (Context Diagram)

### 📍 বসবে: Section 6.2 (Data Flow Diagram - Level 0)

#### A. Draw.io Mermaid Code:
```mermaid
flowchart TD
    %% External Entities
    Visitor["👤 Visitor / Consumer"]
    Staff["👨‍💼 Catalog Manager"]
    Admin["👑 System Administrator"]

    %% Central Process
    System(("0.0<br/><b>Online Product<br/>Catalog System<br/>(OPCS)</b>"))

    %% Inflows and Outflows for Visitor
    Visitor -->|"Search Keywords, Category & Brand Filters"| System
    System -->|"Catalog Cards, Product Details, Specifications & Media"| Visitor

    %% Inflows and Outflows for Staff
    Staff -->|"Credentials, Product Info, Media Uploads, Tech Specs"| System
    System -->|"Upload Status, Validation Errors, Catalog Previews"| Staff

    %% Inflows and Outflows for Admin
    Admin -->|"Admin Credentials, Taxonomy Tree, Brand Data, Roles"| System
    System -->|"System Configuration Reports, Audit & Health Status"| Admin

    %% Styling
    style System fill:#dbeafe,stroke:#1d4ed8,stroke-width:3px;
    style Visitor fill:#f1f5f9,stroke:#475569,stroke-width:2px;
    style Staff fill:#fef9c3,stroke:#ca8a04,stroke-width:2px;
    style Admin fill:#fee2e2,stroke:#b91c1c,stroke-width:2px;
```

#### B. Gemini Pro / AI Image Prompt:
> *"A Level-0 Context Data Flow Diagram (DFD) for an Online Product Catalog System. In the center is a large circle labeled '0.0 Online Product Catalog System'. Three external entities represented as sharp rectangles around it: 'Visitor' at the bottom, 'Catalog Manager' at top-left, and 'System Administrator' at top-right. Labeled directed arrows showing data flow: 'Search Keywords & Filters' flowing inward, 'Product Details, Specifications & Media' flowing outward to Visitor; 'Product Entries & Media Uploads' flowing inward from Staff; 'Taxonomy & System Config' flowing from Admin. Academic software engineering chart, clean white background, vector diagram."*

---

## 3. Data Flow Diagram (DFD) — Level 1 (Process Decomposition)

### 📍 বসবে: Section 6.2 (Data Flow Diagram - Level 1)

#### A. Draw.io Mermaid Code:
```mermaid
flowchart TD
    %% Entities
    Visitor["👤 Visitor"]
    Staff["👨‍💼 Catalog Staff"]
    Admin["👑 Administrator"]

    %% Data Stores
    D1[("D1: Categories & Brands")]
    D2[("D2: Products & Specifications")]
    D3[("D3: Media Assets Store / CDN")]
    D4[("D4: Users & Roles")]

    %% Processes
    P1(("1.0<br/>Manage<br/>Taxonomy"))
    P2(("2.0<br/>Manage<br/>Catalog & Media"))
    P3(("3.0<br/>Search & Filter<br/>Catalog"))
    P4(("4.0<br/>Retrieve PDP<br/>& Specifications"))
    P5(("5.0<br/>Authenticate<br/>Users"))

    %% Flows
    Admin -->|"Category & Brand Form Data"| P1
    P1 -->|"Write Category/Brand"| D1
    D1 -->|"Read Hierarchy"| P1

    Staff -->|"Login Credentials"| P5
    Admin -->|"Admin Credentials"| P5
    P5 -->|"Validate Credentials"| D4
    D4 -->|"Session / Role Token"| P5
    P5 -->|"Access Granted"| Staff
    P5 -->|"Access Granted"| Admin

    Staff -->|"Product Data & Specs"| P2
    Staff -->|"Photos & Video Embeds"| P2
    P2 -->|"Write Product & Spec Records"| D2
    P2 -->|"Upload Files & Keys"| D3
    D1 -.->|"Validate Category ID"| P2

    Visitor -->|"Search Query & Filter Criteria"| P3
    D2 -->|"Product Index Stream"| P3
    D1 -->|"Taxonomy Breadcrumbs"| P3
    P3 -->|"Filtered Catalog Results"| Visitor

    Visitor -->|"Select Product (Slug)"| P4
    D2 -->|"Fetch Full Specs & Details"| P4
    D3 -->|"Stream High-Res Photos & Videos"| P4
    P4 -->|"Formatted Product Detail Page (PDP)"| Visitor

    %% Styling
    style P1 fill:#e0e7ff,stroke:#4338ca;
    style P2 fill:#fef3c7,stroke:#b45309;
    style P3 fill:#dcfce7,stroke:#15803d;
    style P4 fill:#dbeafe,stroke:#1d4ed8;
    style P5 fill:#fee2e2,stroke:#b91c1c;
    style D1 fill:#f8fafc,stroke:#334155;
    style D2 fill:#f8fafc,stroke:#334155;
    style D3 fill:#f8fafc,stroke:#334155;
    style D4 fill:#f8fafc,stroke:#334155;
```

---

## 4. Entity-Relationship Diagram (ERD)

### 📍 বসবে: Section 6.1 (Data Model)

#### A. Draw.io Mermaid Code:
```mermaid
erDiagram
    CATEGORY ||--o{ CATEGORY : "parent_of"
    CATEGORY ||--o{ PRODUCT : "classifies"
    BRAND ||--o{ PRODUCT : "manufactures"
    PRODUCT ||--|{ PRODUCT_MEDIA : "contains"
    PRODUCT ||--|{ SPECIFICATION_GROUP : "has"
    SPECIFICATION_GROUP ||--|{ SPECIFICATION_ITEM : "includes"
    USER ||--o{ PRODUCT : "curates"

    CATEGORY {
        ObjectId _id PK
        string name "e.g. Mobile Phones"
        string slug UK
        ObjectId parentId FK "nullable"
        string[] ancestors
        string image
        datetime createdAt
    }

    BRAND {
        ObjectId _id PK
        string name "e.g. Samsung, Apple, Toyota"
        string slug UK
        string logoUrl
        string website
        datetime createdAt
    }

    PRODUCT {
        ObjectId _id PK
        string title "e.g. Galaxy S24 Ultra"
        string slug UK
        string sku UK
        string description
        string[] highlights "Key bullet points"
        string productType "GADGET, AUTOMOBILE, APPLIANCE"
        number price
        number discountPrice
        string stockStatus "IN_STOCK, OUT_OF_STOCK"
        ObjectId categoryId FK
        ObjectId brandId FK
        datetime createdAt
        datetime updatedAt
    }

    PRODUCT_MEDIA {
        ObjectId _id PK
        ObjectId productId FK
        string url
        string key "CDN storage key"
        string thumbnailUrl
        string type "IMAGE or VIDEO"
        string videoProvider "YOUTUBE, STREAM, R2"
        string altText
        number sortOrder
    }

    SPECIFICATION_GROUP {
        ObjectId _id PK
        ObjectId productId FK
        string groupName "Display, Engine, Battery, Power"
        number sortOrder
    }

    SPECIFICATION_ITEM {
        ObjectId _id PK
        ObjectId specGroupId FK
        string label "Screen Size, Displacement, RAM"
        string value "6.8 Inch AMOLED, 2000 cc, 12GB"
    }

    USER {
        ObjectId _id PK
        string name
        string email UK
        string passwordHash
        string role "ADMIN, CATALOG_MANAGER"
        datetime createdAt
    }
```

#### B. Gemini Pro / AI Image Prompt:
> *"A professional Crow's Foot Entity Relationship Diagram (ERD) for an Online Product Catalog System. Displays relational boxes: 'CATEGORY', 'BRAND', 'PRODUCT', 'PRODUCT_MEDIA', 'SPECIFICATION_GROUP', and 'USER'. Clean relational connectors showing 1-to-many relationships (e.g., One BRAND has many PRODUCTS; One PRODUCT has many PRODUCT_MEDIA; One PRODUCT has many SPECIFICATION_GROUPs). Primary keys (PK) and Foreign keys (FK) clearly indicated. Clean database design schema layout, white background, crisp technical typography."*

---

## 5. System Architecture & Cloud Infrastructure Diagram *(Optional Bonus)*

### 📍 বসবে: Section 2.1 (Product Perspective)

#### A. Draw.io Mermaid Code:
```mermaid
flowchart TD
    subgraph Clients ["Client Layer (Responsive Viewports)"]
        Mobile["📱 Mobile Browser (iOS / Android)"]
        Desktop["💻 Desktop & Tablet Browser"]
    end

    subgraph CDN ["Edge Delivery & Caching Layer"]
        CF["🌐 Cloudflare Global Edge CDN<br/>(Image Transformation & HTTPS)"]
    end

    subgraph WebServer ["Application Server (Next.js 16)"]
        SSR["⚡ Server-Side Rendering (SSR)<br/>Catalog Pages & PDP"]
        API["🔌 RESTful Route Handlers<br/>(/api/products, /api/categories)"]
        AuthM["🛡️ Auth & Middleware Guard<br/>(RBAC: Admin / Staff)"]
    end

    subgraph Storage ["Cloud Persistence Layer"]
        DB[("🍃 MongoDB Atlas Cluster<br/>(Products, Brands, Specs, Users)")]
        R2[("🪣 Cloudflare R2 / S3 Object Storage<br/>(Compressed WebP Images & Videos)")]
    end

    Clients -->|"HTTPS Requests"| CF
    CF -->|"Cache Miss / Dynamic SSR"| WebServer
    CF -->|"Edge Cached Media (0ms)"| Clients

    SSR -->|"Direct In-Memory Query"| DB
    API -->|"CRUD Mutations"| DB
    API -->|"Upload Media Files"| R2
    WebServer -.->|"Verify Credentials"| DB
```

---

## 💡 শিক্ষককে দেখানোর সময় শেষ চেকলিস্ট (Teacher Defense Tips)
1. **ক্যাটালগের মাল্টিমিডিয়া সাপোর্ট:** শিক্ষক যদি জিজ্ঞেস করেন *"হোম অ্যাপ্লায়েন্স বা মোবাইল ফোনের স্পেসিফিকেশন কীভাবে ম্যানেজ করেছেন?"*  
   👉 বলবেন: *`SPECIFICATION_GROUP` এবং `SPECIFICATION_ITEM` ডাইনামিক স্কিমার মাধ্যমে যেকোনো ক্যাটাগরির জন্য আলাদা স্পেক্স টেবিল তৈরি করা যায় (যেমন: ফোনের জন্য RAM/Processor, গাড়ির জন্য Engine/Horsepower)।*
2. **স্কোপ বাউন্ডারি:** শিক্ষক যদি জিজ্ঞেস করেন *"পেমেন্ট বা কার্ট অপশন কোথায়?"*  
   👉 বলবেন: *সমস্যা নং ৪ ছিল স্পেসিফিকভাবে "Online Product Catalog System"। তাই IEEE 830 স্ট্যান্ডার্ড অনুযায়ী অপ্রয়োজনীয় পেমেন্ট/কুরিয়ার কমপ্লেক্সিটি বাদ দিয়ে পিওর হাই-পারফরম্যান্স ক্যাটালগ এবং স্পেসিফিকেশন ইঞ্জিন তৈরি করা হয়েছে।*
